package net.geoprism.geoai.explorer.core.service.search;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.hc.core5.http.HttpHost;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.query_dsl.Operator;
import org.opensearch.client.opensearch._types.query_dsl.TextQueryType;
import org.opensearch.client.opensearch.core.SearchResponse;
import org.opensearch.client.opensearch.core.search.Hit;
import org.opensearch.client.transport.OpenSearchTransport;
import org.opensearch.client.transport.aws.AwsSdk2Transport;
import org.opensearch.client.transport.aws.AwsSdk2TransportOptions;
import org.opensearch.client.transport.httpclient5.ApacheHttpClient5TransportBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import net.geoprism.geoai.explorer.core.config.AppProperties;
import net.geoprism.geoai.explorer.core.model.Location;
import net.geoprism.geoai.explorer.core.model.LocationPage;
import net.geoprism.geoai.explorer.core.service.GraphQueryService;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.http.apache.ApacheHttpClient;

@Service
@Primary
@ConditionalOnProperty(name = "explorer.search", havingValue = "opensearch")
public class OpenSearchService extends BasicSearchService
{
  @Autowired
  private AppProperties properties;

  @Override
  public LocationPage fullTextLookup(String query, int offset, int limit)
  {
    List<Location> results = new ArrayList<>();

    try (OpenSearchTransport transport = buildTransport())
    {
      OpenSearchClient client = new OpenSearchClient(transport);

      List<String> tokens = tokenize(query);

      SearchResponse<LocationDocument> response = client.search(s -> s
          .index(properties.getOpenSearchIndex())
          .from(offset)
          .size(limit)
          .query(q -> q
              .bool(b ->
              {
                /*
                 * Best-case search:
                 * Prefer documents that match all search terms somewhere across the major fields.
                 *
                 * This gives high-quality results for queries like:
                 *   channel reach_25
                 *
                 * But unlike the old implementation, this is no longer the ONLY path.
                 */
                b.should(sh -> sh
                    .multiMatch(mm -> mm
                        .query(normalizeQuery(query))
                        .fields("label^5", "code^4", "type^2")
                        .type(TextQueryType.BestFields)
                        .operator(Operator.And)
                        .boost(4.0f)
                    )
                );

                /*
                 * Fallback search:
                 * Allow partial matches so one extra word does not destroy the entire result set.
                 *
                 * This is the important fix for:
                 *   reach_25          -> many results
                 *   channel reach_25  -> zero results
                 *
                 * With this fallback, reach_25 can still match even if "channel" does not.
                 */
                b.should(sh -> sh
                    .multiMatch(mm -> mm
                        .query(normalizeQuery(query))
                        .fields("label^3", "code^3", "type")
                        .type(TextQueryType.BestFields)
                        .operator(Operator.Or)
                        .fuzziness("AUTO")
                        .minimumShouldMatch("1")
                        .boost(1.0f)
                    )
                );

                /*
                 * Useful for human-entered labels where the query is the beginning
                 * of the thing they are looking for.
                 */
                b.should(sh -> sh
                    .matchPhrasePrefix(mpp -> mpp
                        .field("label")
                        .query(normalizeQuery(query))
                        .boost(3.0f)
                    )
                );

                /*
                 * Exact whole-query code match.
                 *
                 * This helps if someone searches directly for a code/id.
                 *
                 * NOTE:
                 * If your mapping has code.keyword, prefer code.keyword here.
                 * If code is only mapped as keyword, use code.
                 * If code is mapped as text only, this may not work as expected.
                 */
                b.should(sh -> sh
                    .term(t -> t
                        .field("code")
                        .value(v -> v.stringValue(normalizeQuery(query)))
                        .boost(12.0f)
                    )
                );

                /*
                 * Exact per-token code matches.
                 *
                 * This is extremely useful for queries like:
                 *   channel reach_25
                 *
                 * Even if "channel" is noise, "reach_25" can hit code exactly.
                 */
                for (String token : tokens)
                {
                  b.should(sh -> sh
                      .term(t -> t
                          .field("code")
                          .value(v -> v.stringValue(token))
                          .boost(10.0f)
                      )
                  );
                }

                /*
                 * At least one should-clause must match.
                 */
                b.minimumShouldMatch("1");

                return b;
              })
          ),
        LocationDocument.class
      );

      for (Hit<LocationDocument> hit : response.hits().hits())
      {
        LocationDocument doc = hit.source();

        if (doc == null)
        {
          continue;
        }

        results.add(new Location(
          doc.getUri(),
          doc.getType(),
          doc.getCode(),
          doc.getLabel(),
          GraphQueryService.parseGeometry(doc.getWkt())
        ));
      }

      LocationPage page = new LocationPage();
      page.setLocations(results);
      page.setCount(results.size());
      page.setLimit(limit);
      page.setOffset(offset);
      page.setStatement(buildDebugStatement(query, offset, limit));

      return page;
    }
    catch (IOException e)
    {
      throw new RuntimeException(
        "Failed to execute OpenSearch query against "
          + properties.getOpenSearchScheme() + "://"
          + properties.getOpenSearchHost() + ":"
          + properties.getOpenSearchPort()
          + "/" + properties.getOpenSearchIndex()
          + " (iam=" + properties.isOpenSearchIam() + ")",
        e
      );
    }
  }

  private OpenSearchTransport buildTransport()
  {
    if (properties.isOpenSearchIam())
    {
      return new AwsSdk2Transport(
        ApacheHttpClient.builder().build(),
        properties.getOpenSearchHost(),
        "es",
        properties.getOpenSearchRegion(),
        AwsSdk2TransportOptions.builder()
          .setCredentials(properties.getCredentialsProvider())
          .build()
      );
    }

    HttpHost host = new HttpHost(
      properties.getOpenSearchScheme(),
      properties.getOpenSearchHost(),
      properties.getOpenSearchPort()
    );

    return ApacheHttpClient5TransportBuilder.builder(host).build();
  }

  private List<String> tokenize(String query)
  {
    String normalized = normalizeQuery(query);

    if (normalized.isBlank())
    {
      return List.of();
    }

    return List.of(normalized.split("\\s+"));
  }

  private String normalizeQuery(String query)
  {
    if (query == null)
    {
      return "";
    }

    return query.trim();
  }

  private String buildDebugStatement(String query, int offset, int limit)
  {
    String normalizedQuery = normalizeQuery(query);
    List<String> tokens = tokenize(query);

    StringBuilder tokenClauses = new StringBuilder();

    for (String token : tokens)
    {
      if (!tokenClauses.isEmpty())
      {
        tokenClauses.append(",\n");
      }

      tokenClauses.append("""
                {
                  "term": {
                    "code": {
                      "value": "%s",
                      "boost": 10.0
                    }
                  }
                }""".formatted(escapeJson(token)));
    }

    String tokenClauseText = tokenClauses.isEmpty()
      ? ""
      : ",\n" + tokenClauses;

    return """
      {
        "index": "%s",
        "from": %d,
        "size": %d,
        "query": {
          "bool": {
            "should": [
              {
                "multi_match": {
                  "query": "%s",
                  "fields": ["label^5", "code^4", "type^2"],
                  "type": "best_fields",
                  "operator": "and",
                  "boost": 4.0
                }
              },
              {
                "multi_match": {
                  "query": "%s",
                  "fields": ["label^3", "code^3", "type"],
                  "type": "best_fields",
                  "operator": "or",
                  "fuzziness": "AUTO",
                  "minimum_should_match": "1",
                  "boost": 1.0
                }
              },
              {
                "match_phrase_prefix": {
                  "label": {
                    "query": "%s",
                    "boost": 3.0
                  }
                }
              },
              {
                "term": {
                  "code": {
                    "value": "%s",
                    "boost": 12.0
                  }
                }
              }%s
            ],
            "minimum_should_match": "1"
          }
        }
      }
      """.formatted(
        properties.getOpenSearchIndex(),
        offset,
        limit,
        escapeJson(normalizedQuery),
        escapeJson(normalizedQuery),
        escapeJson(normalizedQuery),
        escapeJson(normalizedQuery),
        tokenClauseText
      );
  }

  private String escapeJson(String value)
  {
    if (value == null)
    {
      return "";
    }

    return value
      .replace("\\", "\\\\")
      .replace("\"", "\\\"");
  }

  public static class LocationDocument
  {
    private String uri;
    private String type;
    private String code;
    private String label;
    private String wkt;

    public String getUri()
    {
      return uri;
    }

    public void setUri(String uri)
    {
      this.uri = uri;
    }

    public String getType()
    {
      return type;
    }

    public void setType(String type)
    {
      this.type = type;
    }

    public String getCode()
    {
      return code;
    }

    public void setCode(String code)
    {
      this.code = code;
    }

    public String getLabel()
    {
      return label;
    }

    public void setLabel(String label)
    {
      this.label = label;
    }

    public String getWkt()
    {
      return wkt;
    }

    public void setWkt(String wkt)
    {
      this.wkt = wkt;
    }
  }
}
package net.geoprism.geoai.explorer.core.service.search;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.hc.core5.http.HttpHost;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.query_dsl.Operator;
import org.opensearch.client.opensearch.core.SearchResponse;
import org.opensearch.client.opensearch.core.search.Hit;
import org.opensearch.client.transport.OpenSearchTransport;
import org.opensearch.client.transport.httpclient5.ApacheHttpClient5TransportBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import net.geoprism.geoai.explorer.core.config.AppProperties;
import net.geoprism.geoai.explorer.core.model.Location;
import net.geoprism.geoai.explorer.core.model.LocationPage;
import net.geoprism.geoai.explorer.core.service.GraphQueryService;

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

    HttpHost host = new HttpHost(
      properties.getOpenSearchScheme(),   // e.g. "http" or "https"
      properties.getOpenSearchHost(),     // e.g. "localhost"
      properties.getOpenSearchPort()      // e.g. 9200
    );

    ApacheHttpClient5TransportBuilder builder =
      ApacheHttpClient5TransportBuilder.builder(host);

    try (OpenSearchTransport transport = builder.build())
    {
      OpenSearchClient client = new OpenSearchClient(transport);

      SearchResponse<LocationDocument> response = client.search(s -> s
          .index(properties.getOpenSearchIndex())
          .from(offset)
          .size(limit)
          .query(q -> q
            .multiMatch(mm -> mm
              .query(query)
              .fields("label^3", "code^2", "type")
              .operator(Operator.And)
              .fuzziness("AUTO")
            )
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
      throw new RuntimeException("Failed to execute OpenSearch query", e);
    }
  }

  private String buildDebugStatement(String query, int offset, int limit)
  {
    return """
      {
        "index": "%s",
        "from": %d,
        "size": %d,
        "query": {
          "multi_match": {
            "query": "%s",
            "fields": ["label^3", "code^2", "type"],
            "operator": "and",
            "fuzziness": "AUTO"
          }
        }
      }
      """.formatted(
        properties.getOpenSearchIndex(),
        offset,
        limit,
        escapeJson(query)
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
package net.geoprism.geoai.explorer.demo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.http.ContentStreamProvider;
import software.amazon.awssdk.http.HttpExecuteRequest;
import software.amazon.awssdk.http.HttpExecuteResponse;
import software.amazon.awssdk.http.SdkHttpClient;
import software.amazon.awssdk.http.SdkHttpMethod;
import software.amazon.awssdk.http.SdkHttpRequest;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.http.auth.aws.signer.AwsV4HttpSigner;
import software.amazon.awssdk.http.auth.spi.signer.SignedRequest;
import software.amazon.awssdk.identity.spi.AwsCredentialsIdentity;
import software.amazon.awssdk.regions.Region;

import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class NeptuneToOpenSearchSync implements AutoCloseable
{
  private static final ObjectMapper MAPPER = new ObjectMapper();

  private static final String OPENSEARCH_SERVICE_NAME = "es";
  private static final String NEPTUNE_SERVICE_NAME = "neptune-db";

  private final SdkHttpClient httpClient;
  private final DefaultCredentialsProvider credentialsProvider;
  private final AwsV4HttpSigner signer;

  private final String neptuneSparqlEndpoint;
  private final String openSearchEndpoint;
  private final String indexName;
  private final Region region;

  public NeptuneToOpenSearchSync(
      String neptuneSparqlEndpoint,
      String openSearchEndpoint,
      String indexName,
      Region region)
  {
    this.httpClient = ApacheHttpClient.builder()
        .connectionTimeout(Duration.ofSeconds(20))
        .build();

    this.credentialsProvider = DefaultCredentialsProvider.create();
    this.signer = AwsV4HttpSigner.create();

    this.neptuneSparqlEndpoint = trimTrailingSlash(neptuneSparqlEndpoint);
    this.openSearchEndpoint = trimTrailingSlash(openSearchEndpoint);
    this.indexName = indexName;
    this.region = region;
  }

  public static void main(String[] args) throws Exception
  {
    Map<String, String> params = parseArgs(args);

    String neptune = required(params, "neptune");
    String opensearch = required(params, "opensearch");
    String index = params.getOrDefault("index", "geo_objects");
    int batchSize = Integer.parseInt(params.getOrDefault("batchSize", "500"));
    Region region = Region.of(required(params, "region"));

    String sparql = params.getOrDefault("sparql", """
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>

        SELECT ?uri ?type ?code ?label
        WHERE {
          ?uri lpgs:GeoObject-code ?code .
          ?uri rdfs:label ?label .
          ?uri a ?type .
        }
        """);

    try (NeptuneToOpenSearchSync app = new NeptuneToOpenSearchSync(neptune, opensearch, index, region))
    {
      app.ensureIndex();
      int total = app.syncQueryToOpenSearch(sparql, batchSize);
      System.out.println("Done. Indexed " + total + " documents into " + index);
    }
  }

  public int syncQueryToOpenSearch(String sparql, int batchSize) throws Exception
  {
    List<Map<String, Object>> docs = fetchDocumentsFromNeptune(sparql);
    System.out.println("Fetched " + docs.size() + " rows from Neptune");

    int indexed = 0;
    for (int i = 0; i < docs.size(); i += batchSize)
    {
      int end = Math.min(i + batchSize, docs.size());
      List<Map<String, Object>> batch = docs.subList(i, end);
      bulkIndex(batch);
      indexed += batch.size();
      System.out.println("Indexed " + indexed + " / " + docs.size());
    }

    return indexed;
  }

  public void ensureIndex() throws Exception
  {
    SimpleHttpResponse existsResponse = sendSignedRequest(
        OPENSEARCH_SERVICE_NAME,
        "GET",
        openSearchEndpoint + "/" + indexName,
        null,
        null,
        null);

    if (existsResponse.statusCode == 200)
    {
      System.out.println("Index already exists: " + indexName);
      return;
    }

    if (existsResponse.statusCode != 404)
    {
      throw new RuntimeException("Unexpected response checking index: "
          + existsResponse.statusCode + " body=" + existsResponse.body);
    }

    String mappingJson = """
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "uri":   { "type": "keyword" },
              "label": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
              "code":  { "type": "keyword" },
              "type":  { "type": "keyword" }
            }
          }
        }
        """;

    SimpleHttpResponse createResponse = sendSignedRequest(
        OPENSEARCH_SERVICE_NAME,
        "PUT",
        openSearchEndpoint + "/" + indexName,
        mappingJson,
        "application/json",
        "application/json");

    if (createResponse.statusCode < 200 || createResponse.statusCode >= 300)
    {
      throw new RuntimeException("Failed to create index: "
          + createResponse.statusCode + " body=" + createResponse.body);
    }

    System.out.println("Created index: " + indexName);
  }

  public List<Map<String, Object>> fetchDocumentsFromNeptune(String sparql) throws Exception
  {
    String body = "query=" + URLEncoder.encode(sparql, StandardCharsets.UTF_8);

    SimpleHttpResponse response = sendSignedRequest(
        NEPTUNE_SERVICE_NAME,
        "POST",
        neptuneSparqlEndpoint,
        body,
        "application/x-www-form-urlencoded",
        "application/sparql-results+json");

    if (response.statusCode < 200 || response.statusCode >= 300)
    {
      throw new RuntimeException("Neptune query failed: "
          + response.statusCode + " body=" + response.body);
    }

    JsonNode root = MAPPER.readTree(response.body);
    JsonNode bindings = root.path("results").path("bindings");

    if (!bindings.isArray())
    {
      throw new RuntimeException("Unexpected SPARQL JSON format: missing results.bindings");
    }

    List<Map<String, Object>> docs = new ArrayList<>();

    for (JsonNode row : bindings)
    {
      String uri = sparqlValue(row, "uri");
      String label = sparqlValue(row, "label");
      String code = sparqlValue(row, "code");
      String typeUri = sparqlValue(row, "type");

      if (uri == null || label == null || code == null || typeUri == null)
      {
        continue;
      }

      Map<String, Object> doc = new LinkedHashMap<>();
      doc.put("uri", uri);
      doc.put("label", label);
      doc.put("code", code);
      doc.put("type", shortenType(typeUri));

      docs.add(doc);
    }

    return docs;
  }

  public void bulkIndex(List<Map<String, Object>> docs) throws Exception
  {
    StringBuilder ndjson = new StringBuilder();

    for (Map<String, Object> doc : docs)
    {
      String id = Objects.toString(doc.get("uri"), null);
      if (id == null || id.isBlank())
      {
        continue;
      }

      Map<String, Object> action = Map.of(
          "index", Map.of(
              "_index", indexName,
              "_id", id
          )
      );

      ndjson.append(toJson(action)).append("\n");
      ndjson.append(toJson(doc)).append("\n");
    }

    SimpleHttpResponse response = sendSignedRequest(
        OPENSEARCH_SERVICE_NAME,
        "POST",
        openSearchEndpoint + "/_bulk",
        ndjson.toString(),
        "application/x-ndjson",
        "application/json");

    if (response.statusCode < 200 || response.statusCode >= 300)
    {
      throw new RuntimeException("Bulk index failed: "
          + response.statusCode + " body=" + response.body);
    }

    JsonNode root = MAPPER.readTree(response.body);
    boolean errors = root.path("errors").asBoolean(false);

    if (errors)
    {
      throw new RuntimeException("Bulk index returned item errors: " + response.body);
    }
  }

  private SimpleHttpResponse sendSignedRequest(
      String serviceName,
      String method,
      String url,
      String body,
      String contentType,
      String accept) throws Exception
  {
    URI uri = URI.create(url);

    SdkHttpRequest.Builder requestBuilder = SdkHttpRequest.builder()
        .uri(uri)
        .method(SdkHttpMethod.fromValue(method));

    if (contentType != null)
    {
      requestBuilder.putHeader("Content-Type", contentType);
    }

    if (accept != null)
    {
      requestBuilder.putHeader("Accept", accept);
    }

    SdkHttpRequest sdkRequest = requestBuilder.build();

    AwsCredentialsIdentity credentials = credentialsProvider.resolveCredentials();
    ContentStreamProvider payload = body == null
        ? null
        : ContentStreamProvider.fromUtf8String(body);

    SignedRequest signedRequest = signer.sign(r -> {
      r.identity(credentials)
          .request(sdkRequest)
          .putProperty(AwsV4HttpSigner.SERVICE_SIGNING_NAME, serviceName)
          .putProperty(AwsV4HttpSigner.REGION_NAME, region.id());

      if (payload != null)
      {
        r.payload(payload);
      }
    });

    HttpExecuteRequest.Builder executeBuilder = HttpExecuteRequest.builder()
        .request(signedRequest.request());

    signedRequest.payload().ifPresent(executeBuilder::contentStreamProvider);

    HttpExecuteResponse response = httpClient.prepareRequest(executeBuilder.build()).call();

    return new SimpleHttpResponse(
        response.httpResponse().statusCode(),
        readResponseBody(response));
  }

  private static String readResponseBody(HttpExecuteResponse response) throws Exception
  {
    if (response.responseBody().isEmpty())
    {
      return "";
    }

    try (InputStream in = response.responseBody().get())
    {
      return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }
  }

  private static String sparqlValue(JsonNode row, String fieldName)
  {
    JsonNode field = row.path(fieldName);
    if (field.isMissingNode() || field.isNull())
    {
      return null;
    }

    JsonNode value = field.get("value");
    return value == null || value.isNull() ? null : value.asText();
  }

  private static String shortenType(String typeUri)
  {
    if (typeUri == null)
    {
      return null;
    }

    int hash = typeUri.lastIndexOf('#');
    int slash = typeUri.lastIndexOf('/');
    int idx = Math.max(hash, slash);

    if (idx >= 0 && idx + 1 < typeUri.length())
    {
      return typeUri.substring(idx + 1);
    }

    return typeUri;
  }

  private static String trimTrailingSlash(String s)
  {
    if (s == null)
    {
      return null;
    }

    while (s.endsWith("/"))
    {
      s = s.substring(0, s.length() - 1);
    }

    return s;
  }

  private static String toJson(Object obj)
  {
    try
    {
      return MAPPER.writeValueAsString(obj);
    }
    catch (JsonProcessingException e)
    {
      throw new RuntimeException("JSON serialization failed", e);
    }
  }

  private static Map<String, String> parseArgs(String[] args)
  {
    Map<String, String> map = new LinkedHashMap<>();

    for (String arg : args)
    {
      if (!arg.startsWith("--"))
      {
        continue;
      }

      int eq = arg.indexOf('=');
      if (eq < 0)
      {
        map.put(arg.substring(2), "true");
      }
      else
      {
        map.put(arg.substring(2, eq), arg.substring(eq + 1));
      }
    }

    return map;
  }

  private static String required(Map<String, String> params, String key)
  {
    String value = params.get(key);
    if (value == null || value.isBlank())
    {
      throw new IllegalArgumentException("Missing required argument --" + key + "=...");
    }
    return value;
  }

  @Override
  public void close()
  {
    httpClient.close();
    credentialsProvider.close();
  }

  private static final class SimpleHttpResponse
  {
    private final int statusCode;
    private final String body;

    private SimpleHttpResponse(int statusCode, String body)
    {
      this.statusCode = statusCode;
      this.body = body;
    }
  }
}
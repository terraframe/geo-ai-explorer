package net.geoprism.geoai.explorer.core.service;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;

import net.geoprism.geoai.explorer.core.config.AppProperties;
import net.geoprism.geoai.explorer.core.model.History;
import net.geoprism.geoai.explorer.core.model.Message;
import software.amazon.awssdk.http.nio.netty.NettyNioAsyncHttpClient;
import software.amazon.awssdk.services.bedrockagentruntime.BedrockAgentRuntimeAsyncClient;
import software.amazon.awssdk.services.bedrockagentruntime.model.InvokeAgentRequest;
import software.amazon.awssdk.services.bedrockagentruntime.model.InvokeAgentResponseHandler;

@Service
public class BedrockService
{
  private static final int MAX_TIMEOUT_MINUTES = 5;

  private static final Logger log = LoggerFactory.getLogger(BedrockService.class);

  private static final Pattern LOCATION_NAME_PATTERN = Pattern.compile(".*<name>(.*?)<\\/name>.*", Pattern.DOTALL);

  @Autowired
  private AppProperties properties;

  private final ObjectMapper objectMapper = JsonMapper.builder().enable(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS).build();

  public Message prompt(String sessionId, String inputText) throws InterruptedException, ExecutionException, TimeoutException
  {
    String value = invokeAgent(
        properties.getChatAgentId(),
        properties.getChatAgentAliasId(),
        sessionId,
        inputText
    );

    Matcher matcher = LOCATION_NAME_PATTERN.matcher(value);
    boolean find = matcher.find();

    boolean mappable = value.contains("#mapit");
    boolean ambiguous = !mappable &&
        ((find && value.toLowerCase().contains("#ambiguous")) ||
            value.toLowerCase().contains("i found multiple"));

    Message message = new Message();
    message.setContent(
        value
            .replace("#mapit", "")
            .replace("#ambiguous", "")
            .replaceFirst("<name>(.*?)<\\/name>", "")
    );
    message.setSessionId(sessionId);
    message.setMappable(mappable);
    message.setAmbiguous(ambiguous);

    if (find)
    {
      message.setLocation(matcher.group(1));
    }

    return message;
  }

  public record TypeAndQuery(String type, String query)
  {
  }

  public List<TypeAndQuery> getLocationSparql(History history)
      throws InterruptedException, ExecutionException, TimeoutException
  {
    String text = history.toText();

    log.info("Invoking SPARQL agent {} with text: {}", properties.getSparqlAgentAliasId(), text);

    String response = invokeAgent(
        properties.getSparqlAgentId(),
        properties.getSparqlAgentAliasId(),
        UUID.randomUUID().toString(),
        text
    );
    
    // No idea why bedrock is redacting the word 'sparl'? Could be because its a tool parameter I don't know.
    response = response.replaceAll("<REDACTED>", "sparql");

    return parseTypeAndQueries(response);
  }

  private String invokeAgent(String agentId, String agentAliasId, String sessionId, String inputText)
      throws InterruptedException, ExecutionException, TimeoutException
  {
    final StringBuilder content = new StringBuilder();

    try (BedrockAgentRuntimeAsyncClient client = getClient())
    {
      InvokeAgentRequest request = InvokeAgentRequest.builder()
          .agentId(agentId)
          .agentAliasId(agentAliasId)
          .sessionId(sessionId)
          .inputText(inputText)
          .enableTrace(false)
          .build();

      InvokeAgentResponseHandler handler = InvokeAgentResponseHandler.builder()
          .onResponse(response -> {
            log.info("Response received from Bedrock agent: {}", response);
          })
          .onEventStream(publisher -> {
            publisher.subscribe(event -> {
              log.info("Event: {}", event);

              event.accept(InvokeAgentResponseHandler.Visitor.builder()
                  .onChunk(payload -> content.append(payload.bytes().asUtf8String()))
                  .build());
            });
          })
          .onError(error -> {
            log.error("Error occurred while invoking Bedrock agent", error);
          })
          .build();

      CompletableFuture<Void> future = client.invokeAgent(request, handler);

      future.get(MAX_TIMEOUT_MINUTES, TimeUnit.MINUTES);
    }

    return content.toString();
  }

  private List<TypeAndQuery> parseTypeAndQueries(String response)
  {
//    String json = extractJsonArray(response);

    try
    {
      return objectMapper.readValue(response, new TypeReference<List<TypeAndQuery>>() {});
    }
    catch (JsonProcessingException e)
    {
      throw new IllegalStateException("Failed to parse Bedrock SPARQL response into List<TypeAndQuery>. Response was: " + response, e);
    }
  }

//  private String extractJsonArray(String response)
//  {
//    String text = response.trim();
//
//    // Handles ```json ... ``` or ``` ... ```
//    if (text.startsWith("```"))
//    {
//      text = text.replaceFirst("^```(?:json)?\\s*", "");
//      text = text.replaceFirst("\\s*```$", "");
//      text = text.trim();
//    }
//
//    int start = text.indexOf('[');
//    int end = text.lastIndexOf(']');
//
//    if (start == -1 || end == -1 || end <= start)
//    {
//      throw new IllegalStateException("Bedrock response did not contain a JSON array. Response was: " + response);
//    }
//
//    return text.substring(start, end + 1);
//  }

  private BedrockAgentRuntimeAsyncClient getClient()
  {
    final Duration sdkTimeout = Duration.ofMinutes(MAX_TIMEOUT_MINUTES);
    final Duration nettyReadTimeout = Duration.ofMinutes(MAX_TIMEOUT_MINUTES);

    return BedrockAgentRuntimeAsyncClient.builder()
        .region(properties.getBedrockRegion())
        .credentialsProvider(properties.getCredentialsProvider())
        .httpClientBuilder(
            NettyNioAsyncHttpClient.builder()
                .readTimeout(nettyReadTimeout)
        )
        .overrideConfiguration(cfg -> {
          cfg.apiCallTimeout(sdkTimeout);
          cfg.apiCallAttemptTimeout(sdkTimeout);
        })
        .build();
  }
}
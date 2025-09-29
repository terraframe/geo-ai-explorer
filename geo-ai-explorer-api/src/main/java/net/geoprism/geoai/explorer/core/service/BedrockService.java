/**
 * Copyright 2020 The Department of Interior
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package net.geoprism.geoai.explorer.core.service;

import java.time.Duration;
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

import net.geoprism.geoai.explorer.core.config.AppProperties;
import net.geoprism.geoai.explorer.core.model.History;
import net.geoprism.geoai.explorer.core.model.Message;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.http.nio.netty.NettyNioAsyncHttpClient;
import software.amazon.awssdk.services.bedrockagentruntime.BedrockAgentRuntimeAsyncClient;
import software.amazon.awssdk.services.bedrockagentruntime.model.InvokeAgentRequest;
import software.amazon.awssdk.services.bedrockagentruntime.model.InvokeAgentResponseHandler;

@Service
public class BedrockService
{
  private static final int MAX_TIMEOUT_MINUTES = 5;
	
  private static final Logger log = LoggerFactory.getLogger(BedrockService.class);

  @Autowired
  private AppProperties       properties;

  public Message prompt(String sessionId, String inputText) throws InterruptedException, ExecutionException, TimeoutException
  {
    final StringBuilder content = new StringBuilder();

    try (BedrockAgentRuntimeAsyncClient client = getClient())
    {
      InvokeAgentRequest request = InvokeAgentRequest.builder() //
          .agentId(properties.getChatAgentId()) //
          .agentAliasId(properties.getChatAgentAliasId()) //
          .sessionId(sessionId) //
          .inputText(inputText) //
          .enableTrace(false) //
          // .sessionState(SessionState.builder()
          // .sessionAttributes(Map.of("Authorization", authToken))
          // .build())
          .build();

      InvokeAgentResponseHandler handler = InvokeAgentResponseHandler.builder().onResponse(response -> {
        log.info("Response Received from Agent: {}", response);
        // Process the response here
      }).onEventStream(publisher -> {
        publisher.subscribe(event -> {
          log.info("Event: {}", event);

          event.accept(InvokeAgentResponseHandler.Visitor.builder().onChunk(payload -> {
            content.append(payload.bytes().asUtf8String());
          }).build());
        });
      }).onError(error -> {
        log.error("Error occurred: ", error);
      }).build();

      CompletableFuture<Void> future = client.invokeAgent(request, handler);

      future.get(MAX_TIMEOUT_MINUTES, TimeUnit.MINUTES);
    }

    String value = content.toString();

    Pattern pattern = Pattern.compile(".*<name>(.*?)<\\/name>.*");
    Matcher matcher = pattern.matcher(value);
    boolean find = matcher.find();
    boolean mappable = value.contains("#mapit");
    boolean ambiguous = !mappable && ( find && value.toLowerCase().contains("#ambiguous") || value.toLowerCase().contains("i found multiple") );

    Message message = new Message();
    message.setContent(value.replace("#mapit", "").replace("#ambiguous", "").replaceFirst("<name>(.*?)<\\/name>", ""));
    message.setSessionId(sessionId);
    message.setMappable(mappable);
    message.setAmbiguous(ambiguous);

    if (find)
    {
      message.setLocation(matcher.group(1));
    }

    return message;
  }

  public String getLocationSparql(History history) throws InterruptedException, ExecutionException, TimeoutException
  {
    final StringBuilder content = new StringBuilder();

    try (BedrockAgentRuntimeAsyncClient client = getClient())
    {
      String text = history.toText();
      
      System.out.println("Invoking agent " + properties.getSparqlAgentAliasId() + " with text:");
      
      System.out.println(text);
      
      InvokeAgentRequest request = InvokeAgentRequest.builder() //
          .agentId(properties.getSparqlAgentId()) //
          .agentAliasId(properties.getSparqlAgentAliasId()) //
          .sessionId(UUID.randomUUID().toString()) //
          .inputText(text) //
          .enableTrace(false) //
          // .sessionState(SessionState.builder()
          // .sessionAttributes(Map.of("Authorization", authToken))
          // .build())
          .build();

      InvokeAgentResponseHandler handler = InvokeAgentResponseHandler.builder().onResponse(response -> {
        log.info("Response Received from Agent: {}", response);
        // Process the response here
      }).onEventStream(publisher -> {
        publisher.subscribe(event -> {
          log.info("Event: {}", event);

          event.accept(InvokeAgentResponseHandler.Visitor.builder().onChunk(payload -> {
            content.append(payload.bytes().asUtf8String());
          }).build());
        });
      }).onError(error -> {
        log.error("Error occurred: ", error);
      }).build();

      CompletableFuture<Void> future = client.invokeAgent(request, handler);

      future.get(MAX_TIMEOUT_MINUTES, TimeUnit.MINUTES);
    }

    String text = content.toString();

    int index = text.toUpperCase().indexOf("PREFIX");

    // Cut out any reasoning from the text
    if (index != -1)
    {
      return text.substring(index);
    }

    return text;
  }

  private BedrockAgentRuntimeAsyncClient getClient() {
	    final Duration sdkTimeout = Duration.ofMinutes(MAX_TIMEOUT_MINUTES);
	    final Duration nettyReadTimeout = Duration.ofMinutes(MAX_TIMEOUT_MINUTES);

	    AwsBasicCredentials credentials = AwsBasicCredentials.create(
	        properties.getAccessKeyId(),
	        properties.getSecretAccessKey()
	    );

	    return BedrockAgentRuntimeAsyncClient.builder()
	        .region(properties.getRegion())
	        .credentialsProvider(StaticCredentialsProvider.create(credentials))
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
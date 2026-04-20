package net.geoprism.geoai.explorer.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.regions.providers.DefaultAwsRegionProviderChain;

@Service
public class AppProperties
{
  @Autowired
  private Environment env;

  public String getChatAgentId()
  {
    return env.getProperty("bedrock.chat.agent.id");
  }

  public String getChatAgentAliasId()
  {
    return env.getProperty("bedrock.chat.agent.alias.id");
  }

  public String getSparqlAgentId()
  {
    return env.getProperty("bedrock.sparql.agent.id");
  }

  public String getSparqlAgentAliasId()
  {
    return env.getProperty("bedrock.sparql.agent.alias.id");
  }

  public Region getBedrockRegion()
  {
    String configured = env.getProperty("bedrock.region");

    if (configured != null && !configured.isBlank())
    {
      return Region.of(configured);
    }

    return DefaultAwsRegionProviderChain.builder().build().getRegion();
  }

  public Region getNeptuneRegion()
  {
    String configured = env.getProperty("neptune.region", env.getProperty("bedrock.region"));

    if (configured != null && !configured.isBlank())
    {
      return Region.of(configured);
    }

    return DefaultAwsRegionProviderChain.builder().build().getRegion();
  }

  public String getSparqlUrl()
  {
    return env.getProperty("sparql.url");
  }
  
  public String getOpenSearchScheme()
  {
    return env.getProperty("opensearch.scheme", "https");
  }

  public String getOpenSearchHost()
  {
    return env.getProperty("opensearch.host");
  }

  public int getOpenSearchPort()
  {
    return Integer.parseInt(env.getProperty("opensearch.port", "443"));
  }

  public String getOpenSearchIndex()
  {
    return env.getProperty("opensearch.index");
  }
  
  public boolean isOpenSearchIam()
  {
    return Boolean.parseBoolean(env.getProperty("opensearch.iam", "false"));
  }
  
  public Region getOpenSearchRegion()
  {
    String configured = env.getProperty("opensearch.region", env.getProperty("bedrock.region"));

    if (configured != null && !configured.isBlank())
    {
      return Region.of(configured);
    }

    return DefaultAwsRegionProviderChain.builder().build().getRegion();
  }

}

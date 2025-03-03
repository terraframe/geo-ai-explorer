package net.geoprism.geoai.explorer.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.regions.Region;

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

  public Region getRegion()
  {
    return Region.of(env.getProperty("bedrock.region"));
  }

  public String getAccessKeyId()
  {
    return env.getProperty("access.key.id");
  }

  public String getSecretAccessKey()
  {
    return env.getProperty("secret.access.key");
  }

}

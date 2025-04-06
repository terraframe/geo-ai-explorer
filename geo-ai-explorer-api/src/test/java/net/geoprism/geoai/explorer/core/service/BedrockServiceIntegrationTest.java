package net.geoprism.geoai.explorer.core.service;

import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

import org.junit.Assert;
import org.junit.Ignore;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import net.geoprism.geoai.explorer.core.config.TestConfiguration;
import net.geoprism.geoai.explorer.core.model.History;
import net.geoprism.geoai.explorer.core.model.HistoryMessage;
import net.geoprism.geoai.explorer.core.model.HistoryMessageType;
import net.geoprism.geoai.explorer.core.model.Message;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, classes = TestConfiguration.class)
@AutoConfigureMockMvc
public class BedrockServiceIntegrationTest
{

  @Autowired
  private BedrockService service;

  @Test
  public void testPrompt() throws InterruptedException, ExecutionException, TimeoutException
  {
    String sessionId = UUID.randomUUID().toString();

    Message message = service.prompt(sessionId, "what is the total population impacted if channel reach_25 floods?");

    Assert.assertTrue(message.getContent().trim().length() > 0);
    Assert.assertTrue(message.getContent().contains("I found multiple channel reaches with \"25\" in their name"));
    Assert.assertTrue(message.getContent().contains("<location><label>"));
    Assert.assertTrue(message.getContent().contains("<name>"));
    Assert.assertFalse(message.getMappable());
    Assert.assertTrue(message.getAmbiguous());
    Assert.assertEquals(sessionId, message.getSessionId());

    message = service.prompt(sessionId, "CEMVK_RR_03_ONE_25");

    Assert.assertTrue(message.getContent().trim().length() > 0);
    Assert.assertTrue(message.getContent().contains("431,826"));
    Assert.assertFalse(message.getContent().contains("<location><label>"));
    Assert.assertTrue(message.getMappable());
    Assert.assertEquals(sessionId, message.getSessionId());
    Assert.assertFalse(message.getAmbiguous());

    message = service.prompt(sessionId, "what school zones are impacted?");

    Assert.assertTrue(message.getContent().trim().length() > 0);
    Assert.assertTrue(message.getContent().contains("The following school districts would be impacted"));
    Assert.assertTrue(message.getContent().contains("<location><label>"));
    Assert.assertTrue(message.getMappable());
    Assert.assertEquals(sessionId, message.getSessionId());
    Assert.assertFalse(message.getAmbiguous());
  }

  @Test
  @Ignore
  public void testGetLocations() throws InterruptedException, ExecutionException, TimeoutException
  {
    History history = new History();
    history.addMessage(new HistoryMessage(HistoryMessageType.USER, "what is the total population impacted if channel reach_25 floods?"));
    history.addMessage(new HistoryMessage(HistoryMessageType.AI, "I found multiple channel reaches with \"25\" in their name. Could you please specify which one you're interested in? Here are some examples of the different reaches (showing first few):\n1. CEMVK_LM_09_LPM_25\n2. CEMVM_LM_26_HIK_25\n3. CEMVK_BR_01_FUL_25\n4. CELRN_TN_ND_PW2_25\n5. CELRN_TN_ND_GU1_25\n...and many more."));
    history.addMessage(new HistoryMessage(HistoryMessageType.USER, "CEMVK_RR_03_ONE_25"));
    history.addMessage(new HistoryMessage(HistoryMessageType.AI, "The total population that would be impacted if channel reach CEMVK_RR_03_ONE_25 floods is 431,826 people."));

    String sparql = service.getLocationSparql(history);

    Assert.assertTrue(sparql.contains("CEMVK_RR_03_ONE_25"));
    Assert.assertTrue(sparql.contains("ChannelHasLevee"));
    Assert.assertTrue(sparql.contains("HasFloodZone"));
    Assert.assertTrue(sparql.contains("TractAtRisk"));
    Assert.assertTrue(sparql.contains("?type"));
    Assert.assertTrue(sparql.contains("?code"));
    Assert.assertTrue(sparql.contains("?label"));
    Assert.assertTrue(sparql.contains("?wkt"));
  }

}
package net.geoprism.geoai.explorer.core.model;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import net.geoprism.geoai.explorer.core.config.TestConfiguration;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, classes = TestConfiguration.class)
@AutoConfigureMockMvc
public class HistoryTest
{

  @Test
  public void testToText()
  {
    History history = new History();
    history.addMessage(new HistoryMessage(HistoryMessageType.USER, "what is the total population impacted if channel reach_25 floods?"));
    history.addMessage(new HistoryMessage(HistoryMessageType.AI, "I found multiple channel reaches with \"25\" in their name. Could you please specify which one you're interested in? Here are some examples of the different reaches (showing first few):\n1. CEMVK_LM_09_LPM_25\n2. CEMVM_LM_26_HIK_25\n3. CEMVK_BR_01_FUL_25\n4. CELRN_TN_ND_PW2_25\n5. CELRN_TN_ND_GU1_25\n...and many more."));
    history.addMessage(new HistoryMessage(HistoryMessageType.USER, "CEMVK_RR_03_ONE_25"));
    history.addMessage(new HistoryMessage(HistoryMessageType.AI, "The total population that would be impacted if channel reach CEMVK_RR_03_ONE_25 floods is 431,826 people."));

    System.out.println(history.toText());
  }

}
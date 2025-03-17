package net.geoprism.geoai.explorer.core.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.json.simple.parser.ParseException;
import org.junit.Assert;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import net.geoprism.geoai.explorer.core.config.TestConfiguration;
import net.geoprism.geoai.explorer.core.model.Style;
import net.geoprism.geoai.explorer.core.model.VectorLayer;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, classes = TestConfiguration.class)
@AutoConfigureMockMvc
public class ConfigurationServiceTest
{
  @Autowired
  private ConfigurationService service;

  @Test
  public void testGetStyles() throws IOException, ParseException
  {
    Map<String, Style> styles = this.service.getStyles();

    Assert.assertTrue(styles.size() > 0);
  }

  @Test
  public void testGetVectorLayers() throws IOException, ParseException
  {
    List<VectorLayer> layers = this.service.getVectorLayers();

    Assert.assertTrue(layers.size() > 0);
  }

}

package net.geoprism.geoai.explorer.core.service;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.List;
import java.util.Map;

import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import net.geoprism.geoai.explorer.core.model.Style;
import net.geoprism.geoai.explorer.core.model.VectorLayer;

@Service
public class ConfigurationService
{

  public Map<String, Style> getStyles() throws IOException, ParseException
  {
    try (Reader reader = new InputStreamReader(this.getClass().getResourceAsStream("/styles.json")))
    {
      ObjectMapper mapper = new ObjectMapper();
      return mapper.readValue(reader, new TypeReference<Map<String, Style>>()
      {
      });
    }
  }

  public List<VectorLayer> getVectorLayers() throws IOException, ParseException
  {
    try (Reader reader = new InputStreamReader(this.getClass().getResourceAsStream("/vector-layers.json")))
    {
      ObjectMapper mapper = new ObjectMapper();
      return mapper.readValue(reader, new TypeReference<List<VectorLayer>>()
      {
      });
    }
  }

}

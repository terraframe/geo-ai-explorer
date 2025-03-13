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
package net.geoprism.geoai.explorer.web.controller;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.List;
import java.util.Map;

import org.json.simple.parser.ParseException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import net.geoprism.geoai.explorer.core.model.Configuration;
import net.geoprism.geoai.explorer.core.model.Style;
import net.geoprism.geoai.explorer.core.model.VectorLayer;

@RestController
@Validated
public class ConfigurationController
{
  @SuppressWarnings("unchecked")
  @GetMapping("/api/configuration/get")
  @ResponseBody
  public ResponseEntity<Configuration> getConfiguration() throws IOException, ParseException
  {
    ObjectMapper mapper = new ObjectMapper();
    Configuration configuration = new Configuration();

    try (Reader reader = new InputStreamReader(this.getClass().getResourceAsStream("/styles.json")))
    {
      Map<String, Style> styles = mapper.readValue(reader, Map.class);

      configuration.setStyles(styles);
    }

    try (Reader reader = new InputStreamReader(this.getClass().getResourceAsStream("/vector-layers.json")))
    {
      List<VectorLayer> layers = mapper.readValue(reader, List.class);

      configuration.setLayers(layers);
    }

    return new ResponseEntity<Configuration>(configuration, HttpStatus.OK);
  }

  @SuppressWarnings("unchecked")
  @GetMapping("/api/configuration/styles")
  @ResponseBody
  public ResponseEntity<Map<String, Style>> getStyles() throws IOException, ParseException
  {
    try (Reader reader = new InputStreamReader(this.getClass().getResourceAsStream("/styles.json")))
    {
      ObjectMapper mapper = new ObjectMapper();
      Map<String, Style> styles = mapper.readValue(reader, Map.class);

      return new ResponseEntity<Map<String, Style>>(styles, HttpStatus.OK);
    }
  }

  @SuppressWarnings("unchecked")
  @GetMapping("/api/configuration/vector-layers")
  @ResponseBody
  public ResponseEntity<List<VectorLayer>> getVectorLayerConfiguration() throws IOException, ParseException
  {
    try (Reader reader = new InputStreamReader(this.getClass().getResourceAsStream("/vector-layers.json")))
    {
      ObjectMapper mapper = new ObjectMapper();
      List<VectorLayer> layers = mapper.readValue(reader, List.class);

      return new ResponseEntity<List<VectorLayer>>(layers, HttpStatus.OK);
    }
  }

}

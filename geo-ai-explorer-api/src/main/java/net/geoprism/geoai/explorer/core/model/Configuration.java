package net.geoprism.geoai.explorer.core.model;

import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class Configuration
{
  private Map<String, Style> styles;

  private List<VectorLayer>  layers;

}

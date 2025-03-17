package net.geoprism.geoai.explorer.core.model;

import lombok.Data;

@Data
public class VectorLayer
{
  private String  url;

  private String  label;

  private String  color;

  private Integer order;

  private String  labelProperty;

  private String  codeProperty;

  private String  prefix;

  private Boolean enabled;

  private String  sourceLayer;

  private String  geometryType;
}

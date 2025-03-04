package net.geoprism.geoai.explorer.core.model;

import org.locationtech.jts.geom.Geometry;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import net.geoprism.geoai.explorer.core.serialization.GeometrySerializer;

public class Location
{
  private String   type;

  private String   code;

  private String   label;

  @JsonSerialize(using = GeometrySerializer.class)
  private Geometry geometry;

  public Location(String type, String code, String label, Geometry geometry)
  {
    super();
    this.type = type;
    this.code = code;
    this.label = label;
    this.geometry = geometry;
  }

  public String getCode()
  {
    return code;
  }

  public void setCode(String code)
  {
    this.code = code;
  }

  public String getLabel()
  {
    return label;
  }

  public void setLabel(String label)
  {
    this.label = label;
  }

  public String getType()
  {
    return type;
  }

  public void setType(String type)
  {
    this.type = type;
  }

  public Geometry getGeometry()
  {
    return geometry;
  }

  public void setGeometry(Geometry geometry)
  {
    this.geometry = geometry;
  }
}

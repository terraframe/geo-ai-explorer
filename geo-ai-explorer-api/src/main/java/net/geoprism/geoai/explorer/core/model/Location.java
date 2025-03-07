package net.geoprism.geoai.explorer.core.model;

import java.util.HashMap;
import java.util.Map;

import org.locationtech.jts.geom.Geometry;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import net.geoprism.geoai.explorer.core.serialization.GeometrySerializer;

public class Location
{
  private Map<String, Object> properties;

  private String              type;

  private String              id;

  @JsonSerialize(using = GeometrySerializer.class)
  private Geometry            geometry;

  public Location()
  {
    this.type = "Feature";
    this.properties = new HashMap<>();
  }

  public Location(String uri, String type, String code, String label, Geometry geometry)
  {
    this();

    this.id = uri;
    this.geometry = geometry;

    this.properties.put("uri", uri);
    this.properties.put("type", type);
    this.properties.put("code", code);
    this.properties.put("label", label);
  }

  public Geometry getGeometry()
  {
    return geometry;
  }

  public void setGeometry(Geometry geometry)
  {
    this.geometry = geometry;
  }

  public Map<String, Object> getProperties()
  {
    return properties;
  }

  public void setProperties(Map<String, Object> properties)
  {
    this.properties = properties;
  }

  public String getId()
  {
    return id;
  }

  public void setId(String id)
  {
    this.id = id;
  }

  public String getType()
  {
    return type;
  }

  public void setType(String type)
  {
    this.type = type;
  }
}

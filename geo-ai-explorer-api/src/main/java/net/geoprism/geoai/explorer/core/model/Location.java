package net.geoprism.geoai.explorer.core.model;

public class Location
{
  private String type;

  private String code;

  private String label;

  private String wkt;

  public Location(String type, String code, String label, String wkt)
  {
    super();
    this.type = type;
    this.code = code;
    this.label = label;
    this.wkt = wkt;
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

  public String getWkt()
  {
    return wkt;
  }

  public void setWkt(String wkt)
  {
    this.wkt = wkt;
  }

}

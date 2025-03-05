package net.geoprism.geoai.explorer.core.model;

public class Style
{
  private String color;

  private int    order;

  public Style()
  {
  }

  public Style(String color, int order)
  {
    super();
    this.color = color;
    this.order = order;
  }

  public String getColor()
  {
    return color;
  }

  public void setColor(String color)
  {
    this.color = color;
  }

  public int getOrder()
  {
    return order;
  }

  public void setOrder(int order)
  {
    this.order = order;
  }

}

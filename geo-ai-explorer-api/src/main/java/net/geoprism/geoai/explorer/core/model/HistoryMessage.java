package net.geoprism.geoai.explorer.core.model;

public class HistoryMessage
{
  private HistoryMessageType type;

  private String             content;

  public HistoryMessage()
  {
  }

  public HistoryMessage(HistoryMessageType type, String content)
  {
    super();
    this.type = type;
    this.content = content;
  }

  public HistoryMessageType getType()
  {
    return type;
  }

  public void setType(HistoryMessageType type)
  {
    this.type = type;
  }

  public String getContent()
  {
    return content;
  }

  public void setContent(String content)
  {
    this.content = content;
  }
}

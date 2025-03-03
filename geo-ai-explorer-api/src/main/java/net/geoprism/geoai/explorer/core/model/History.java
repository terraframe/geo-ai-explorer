package net.geoprism.geoai.explorer.core.model;

import java.util.List;

public class History
{
  private List<HistoryMessage> messages;

  public List<HistoryMessage> getMessages()
  {
    return messages;
  }

  public void setMessages(List<HistoryMessage> messages)
  {
    this.messages = messages;
  }

  public String toText()
  {
    return null;
  }

}

package net.geoprism.geoai.explorer.core.model;

import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class History
{
  private List<HistoryMessage> messages;

  public History()
  {
    this.messages = new LinkedList<>();
  }

  public List<HistoryMessage> getMessages()
  {
    return messages;
  }

  public void setMessages(List<HistoryMessage> messages)
  {
    this.messages = messages;
  }

  public void addMessage(HistoryMessage message)
  {
    this.messages.add(message);
  }

  public String toText()
  {
    ObjectMapper mapper = new ObjectMapper();

    try
    {
      return mapper.writeValueAsString(this);
    }
    catch (JsonProcessingException e)
    {
      throw new RuntimeException(e);
    }
  }

}

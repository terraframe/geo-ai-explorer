package net.geoprism.geoai.explorer.core.model;

import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Data;

@Data
public class History
{
  private List<HistoryMessage> messages = new LinkedList<>();

  private int                  limit    = 1000;

  private int                  offset   = 0;

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

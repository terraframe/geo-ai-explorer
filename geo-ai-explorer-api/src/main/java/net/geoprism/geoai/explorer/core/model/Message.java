package net.geoprism.geoai.explorer.core.model;

import lombok.Data;

@Data
public class Message
{
  /**
   * Content of the message
   */
  private String  content;

  /**
   * Session if of the conversation
   */
  private String  sessionId;

  /**
   * Flag indicating if the message represents a mappable message
   */
  private Boolean mappable;

}

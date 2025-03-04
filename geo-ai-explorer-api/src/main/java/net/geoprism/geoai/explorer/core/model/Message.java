package net.geoprism.geoai.explorer.core.model;

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

  public String getContent()
  {
    return content;
  }

  public void setContent(String content)
  {
    this.content = content;
  }

  public String getSessionId()
  {
    return sessionId;
  }

  public void setSessionId(String sessionId)
  {
    this.sessionId = sessionId;
  }

  public Boolean getMappable()
  {
    return mappable;
  }

  public void setMappable(Boolean mappable)
  {
    this.mappable = mappable;
  }

}

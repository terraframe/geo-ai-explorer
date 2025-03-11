package net.geoprism.geoai.explorer.core.model;

public class GenericRestException extends RuntimeException
{
  private static final long serialVersionUID = -2287472400338293280L;

  private int               status           = 400;

  public GenericRestException()
  {
    super();
  }

  public GenericRestException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace)
  {
    super(message, cause, enableSuppression, writableStackTrace);
  }

  public GenericRestException(String message, Throwable cause)
  {
    super(message, cause);
  }

  public GenericRestException(String message)
  {
    super(message);
  }

  public GenericRestException(Throwable cause)
  {
    super(cause);
  }

  public int getStatus()
  {
    return status;
  }

  public void setStatus(int status)
  {
    this.status = status;
  }

}

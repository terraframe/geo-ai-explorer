package net.geoprism.geoai.explorer.core.serialization;

import java.io.IOException;

import org.geotools.geojson.geom.GeometryJSON;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.locationtech.jts.geom.Geometry;
import org.springframework.boot.json.JsonParseException;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

@SuppressWarnings("deprecation")
public class GeometrySerializer extends StdSerializer<Geometry>
{

  private static final long serialVersionUID = -904451118296177873L;

  public GeometrySerializer()
  {
    this(null);
  }

  public GeometrySerializer(Class<Geometry> t)
  {
    super(t);
  }

  @Override
  public void serialize(Geometry value, JsonGenerator gen, SerializerProvider provider) throws IOException
  {
    try
    {
      if (value != null)
      {
        gen.writeObject(new JSONParser().parse(new GeometryJSON().toString(value)));
      }
    }
    catch (IOException | ParseException e)
    {
      throw new JsonParseException(e);
    }
  }

}

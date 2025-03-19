package net.geoprism.geoai.explorer.core.model;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationPage
{
  private String         statement;

  private List<Location> locations;

  private long           count  = 0;

  private long           offset = 0;

  private int            limit  = 1000;
}

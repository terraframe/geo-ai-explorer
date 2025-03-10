package net.geoprism.geoai.explorer.core.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistoryMessage
{
  private HistoryMessageType type;

  private String             content;
}

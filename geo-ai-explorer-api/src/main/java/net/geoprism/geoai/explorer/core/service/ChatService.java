/**
 * Copyright 2020 The Department of Interior
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
package net.geoprism.geoai.explorer.core.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import net.geoprism.geoai.explorer.core.model.History;
import net.geoprism.geoai.explorer.core.model.Location;
import net.geoprism.geoai.explorer.core.model.Message;

@Service
public class ChatService
{
  private static final Logger log = LoggerFactory.getLogger(ChatService.class);

  @Autowired
  private BedrockService      bedrock;

  @Autowired
  private JenaService         jena;

  public Message prompt(String sessionId, String inputText)
  {
    return this.bedrock.prompt(sessionId, inputText);
  }

  public List<Location> getLocations(History history)
  {
    String statement = this.bedrock.getLocationSparql(history);

    return this.jena.query(statement);
  }
}
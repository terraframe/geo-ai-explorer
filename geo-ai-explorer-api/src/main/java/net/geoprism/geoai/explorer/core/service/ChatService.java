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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import net.geoprism.geoai.explorer.core.model.GenericRestException;
import net.geoprism.geoai.explorer.core.model.History;
import net.geoprism.geoai.explorer.core.model.LocationPage;
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
    try
    {
      return this.bedrock.prompt(sessionId, inputText);
    }
    catch (Exception e)
    {
      log.error("Error invoking a remote service: ", e);

      throw new GenericRestException("The chat agent was unable to generate a response. If your chat history is not relevant to the current request, you can try clearing your chat history and sending your message again.", e);
    }
  }

  public LocationPage getLocations(History history)
  {
    try
    {
      String statement = this.bedrock.getLocationSparql(history);

      return this.getPage(statement, history.getOffset(), history.getLimit());
    }
    catch (Exception e)
    {
      log.error("Error invoking a bedrock service: ", e);

      throw new GenericRestException("Unable to map the locations. An error occurred while generating the response", e);
    }
  }

  public LocationPage getPage(String statement, int offset, int limit)
  {
    try
    {
      LocationPage page = new LocationPage();
      page.setLocations(this.jena.query(statement, offset, limit));
      page.setCount(this.jena.getCount(statement));
      page.setLimit(limit);
      page.setOffset(offset);
      page.setStatement(statement);

      return page;
    }
    catch (Exception e)
    {
      log.error("Error invoking a remote service: ", e);
      log.error("SPARQL statement: " + statement);

      throw new GenericRestException("Unable to map the locations. An error occurred while generating the response", e);
    }
  }
}
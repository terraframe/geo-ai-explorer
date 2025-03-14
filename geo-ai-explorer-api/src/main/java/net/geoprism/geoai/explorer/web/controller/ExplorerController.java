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
package net.geoprism.geoai.explorer.web.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import net.geoprism.geoai.explorer.core.model.Graph;
import net.geoprism.geoai.explorer.core.model.Location;
import net.geoprism.geoai.explorer.core.service.JenaService;

@RestController
@Validated
public class ExplorerController
{
  @Autowired
  private JenaService jena;

  @PostMapping("/api/neighbors")
  @ResponseBody
  public ResponseEntity<Graph> neighbors(@RequestBody Map<String, String> request)
  {
    String uri = request.get("uri");

    if (uri == null || uri.isBlank())
    {
      return ResponseEntity.badRequest().build();
    }

    Graph graph = this.jena.neighbors(uri);

    return new ResponseEntity<Graph>(graph, HttpStatus.OK);
  }

  @GetMapping("/api/get-attributes")
  @ResponseBody
  public ResponseEntity<Location> neighbors(@RequestParam(name = "uri", required = true) String uri)
  {
    Location location = this.jena.getAttributes(uri, false);

    return new ResponseEntity<Location>(location, HttpStatus.OK);
  }
}

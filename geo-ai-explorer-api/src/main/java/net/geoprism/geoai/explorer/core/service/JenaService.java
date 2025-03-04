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

import java.util.LinkedList;
import java.util.List;

import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionRemote;
import org.apache.jena.rdfconnection.RDFConnectionRemoteBuilder;
import org.geotools.geometry.jts.WKTReader2;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import net.geoprism.geoai.explorer.core.config.AppProperties;
import net.geoprism.geoai.explorer.core.model.Location;

@Service
public class JenaService
{
  private static final Logger log = LoggerFactory.getLogger(JenaService.class);

  @Autowired
  private AppProperties       properties;

  public List<Location> query(String statement)
  {
    RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create() //
        .destination(properties.getJenaUrl());

    try (RDFConnection conn = builder.build())
    {
      LinkedList<Location> results = new LinkedList<>();
      WKTReader2 reader = new WKTReader2();

      conn.querySelect(statement, (qs) -> {
        String type = qs.getResource("type").getURI();
        String code = qs.getLiteral("code").getString();
        String label = qs.getLiteral("label").getString();
        String wkt = qs.getLiteral("wkt").getString();

        try
        {
          Geometry geometry = reader.read(wkt);

          results.add(new Location(type, code, label, geometry));
        }
        catch (ParseException e)
        {
          throw new RuntimeException(e);
        }

      });

      return results;
    }

  }
}
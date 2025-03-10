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

import org.apache.jena.geosparql.implementation.parsers.wkt.WKTReader;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionRemote;
import org.apache.jena.rdfconnection.RDFConnectionRemoteBuilder;
import org.locationtech.jts.geom.Geometry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import net.geoprism.geoai.explorer.core.config.AppProperties;
import net.geoprism.geoai.explorer.core.model.Graph;
import net.geoprism.geoai.explorer.core.model.Location;

@Service
public class JenaService {
	private static final Logger log = LoggerFactory.getLogger(JenaService.class);
	
	public static final String PREFIXES = """
		PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>
		PREFIX lpg: <https://localhost:4200/lpg#>
		PREFIX lpgv: <https://localhost:4200/lpg/graph_801104/0#>
		PREFIX lpgvs: <https://localhost:4200/lpg/graph_801104/0/rdfs#>
		PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
		PREFIX geo: <http://www.opengis.net/ont/geosparql#>
		PREFIX spatialF: <http://jena.apache.org/function/spatial#>
	""";

	@Autowired
	private AppProperties properties;

	public List<Location> query(String statement) {
		RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create() //
				.destination(properties.getJenaUrl());

		try (RDFConnection conn = builder.build()) {
			LinkedList<Location> results = new LinkedList<>();

      conn.querySelect(statement, (qs) -> {
        String uri = qs.getResource("uri").getURI();
        String type = qs.getResource("type").getURI();
        String code = qs.getLiteral("code").getString();
        String label = qs.getLiteral("label").getString();
        String wkt = qs.getLiteral("wkt").getString();

				WKTReader reader = WKTReader.extract(wkt);
				Geometry geometry = reader.getGeometry();

        results.add(new Location(uri, type, code, label, geometry));

			});

			return results;
		}

	}
	
	public static String NEIGHBOR_QUERY = PREFIXES + """
			  SELECT
			      ?gf1 ?ft1 ?f1 ?wkt1 ?lbl1 ?code1 # Source Object
			      ?e1 ?ev1 # Outgoing Edge
			      ?gf2 ?ft2 ?f2 ?wkt2 ?lbl2 ?code2 # Outgoing Vertex (f1 → f2)
			      ?e2 ?ev2 # Incoming Edge
			      ?gf3 ?ft3 ?f3 ?wkt3 ?lbl3 ?code3 # Incoming Vertex (f3 → f1)
		      WHERE {
		        BIND(geo:Feature as ?gf1) .
		        BIND(?uri as ?f1) .
		        
		        # Source Object
		        GRAPH lpgv: {
			        ?f1 a ?ft1 .
			        ?f1 rdfs:label ?lbl1 .
			        ?f1 lpgs:GeoObject-code ?code1 .
			        
			        OPTIONAL {
			        	?f1 geo:hasGeometry ?g1 .
			        	?g1 geo:asWKT ?wkt1 .
			        }
		        }
		        GRAPH lpg: {
			       ?ft1 rdfs:subClassOf  lpgs:GeoObject . 
		        }
		
				{
				  # Outgoing Relationship
                  BIND(geo:Feature as ?gf2) .
                  BIND(?f2 as ?ev1) .

                  GRAPH lpgv: {
                      ?f1 ?e1 ?f2 .
                      ?f2 a ?ft2 .
                      ?f2 rdfs:label ?lbl2 .
                      ?f2 lpgs:GeoObject-code ?code2 .

                      OPTIONAL {
                          ?f2 geo:hasGeometry ?g2 .
                          ?g2 geo:asWKT ?wkt2 .
                      }
                  }

                  GRAPH lpg: {
                      ?ft2 rdfs:subClassOf  lpgs:GeoObject .
                  }
				}
				UNION
				{
  					# Incoming Relationship
  					BIND(geo:Feature as ?gf3) .
                    BIND(?f3 as ?ev2) .

                    GRAPH lpgv: {
                        ?f3 ?e2 ?f1 .
                        ?f3 a ?ft3 .
                        ?f3 rdfs:label ?lbl3 .
                        ?f3 lpgs:GeoObject-code ?code3 .

                        OPTIONAL {
                            ?f3 geo:hasGeometry ?g3 .
                            ?g3 geo:asWKT ?wkt3 .
                        }
                    }

                    GRAPH lpg: {
                        ?ft3 rdfs:subClassOf  lpgs:GeoObject .
                    }
				}
		      }
		      LIMIT 50
			""";

	public Graph neighbors(String uri) {
	    RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create()
	            .destination(properties.getJenaUrl());
	    
	    if (uri.startsWith("<") && uri.endsWith(">"))
	    	uri = uri.substring(1, uri.length()-1);

	    try (RDFConnection conn = builder.build()) {
	        // Use ParameterizedSparqlString to inject the URI safely
	        ParameterizedSparqlString pss = new ParameterizedSparqlString();
	        pss.setCommandText(NEIGHBOR_QUERY);

	        // Inject the URI properly
	        System.out.println("Iri set as : " + uri);
	        pss.setIri("uri", uri);
	        
	        System.out.println("Executing sparql:");
	        System.out.println(pss.asQuery());

	        try (QueryExecution qe = conn.query(pss.asQuery())) {
	            ResultSet rs = qe.execSelect();
	            return SparqlGraphConverter.convert(rs);
	        }
	    }
	}




}
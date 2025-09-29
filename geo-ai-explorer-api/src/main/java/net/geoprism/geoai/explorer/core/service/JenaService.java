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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.apache.jena.geosparql.implementation.parsers.wkt.WKTReader;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionRemote;
import org.apache.jena.rdfconnection.RDFConnectionRemoteBuilder;
import org.apache.jena.sparql.util.FmtUtils;
import org.locationtech.jts.geom.Geometry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import net.geoprism.geoai.explorer.core.config.AppProperties;
import net.geoprism.geoai.explorer.core.model.GenericRestException;
import net.geoprism.geoai.explorer.core.model.Graph;
import net.geoprism.geoai.explorer.core.model.Location;
import net.geoprism.geoai.explorer.core.model.LocationPage;

@Service
public class JenaService {
	public static final String OBJECT_PRFIX = "https://localhost:4200/lpg/graph_801104/0/rdfs#";

	public static final String PREFIXES = """
				PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>
				PREFIX lpg: <https://localhost:4200/lpg#>
				PREFIX lpgv: <https://localhost:4200/lpg/graph_801104/0#>
				PREFIX lpgvs: <https://localhost:4200/lpg/graph_801104/0/rdfs#>
				PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
				PREFIX geo: <http://www.opengis.net/ont/geosparql#>
				PREFIX spatialF: <http://jena.apache.org/function/spatial#>
			""";

	public static String ATTRIBUTES_QUERY = PREFIXES + """
			SELECT ?s ?p ?o
			FROM <https://localhost:4200/lpg/graph_801104/0#>
			WHERE {
			  BIND(?uri as ?s) .
			  ?s ?p ?o .
			}""";

	public static String ATTRIBUTES_WITH_GEOMETRY_QUERY = PREFIXES + """
			SELECT *
			FROM <https://localhost:4200/lpg/graph_801104/0#>
			WHERE {
			  {
			    SELECT ?s ?p ?o WHERE {
			      BIND(?uri as ?s) .
			      ?s ?p ?o .
			    }
			  }
			  UNION
			  {
			    SELECT ?s ?p ?o WHERE {
			      BIND(?uri as ?s) .
			      BIND(geo:asWKT as ?p) .

			      ?s geo:hasGeometry ?geom .
			      ?geom ?p ?o
			    }
			  }
			}
			""";

	public static String NEIGHBOR_QUERY = PREFIXES + """
					PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>
					PREFIX lpg: <https://localhost:4200/lpg#>
					PREFIX lpgv: <https://localhost:4200/lpg/graph_801104/0#>
					PREFIX lpgvs: <https://localhost:4200/lpg/graph_801104/0/rdfs#>
					PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
					PREFIX geo: <http://www.opengis.net/ont/geosparql#>
					PREFIX spatialF: <http://jena.apache.org/function/spatial#>

					SELECT
					?gf1 ?ft1 ?f1 ?wkt1 ?lbl1 ?code1 # Source Object
					?e1 ?ev1 # Outgoing Edge
					?gf2 ?ft2 ?f2 ?wkt2 ?lbl2 ?code2 # Outgoing Vertex (f1 → f2)
					?e2 ?ev2 # Incoming Edge
					?gf3 ?ft3 ?f3 ?wkt3 ?lbl3 ?code3 # Incoming Vertex (f3 → f1)
					FROM lpgv:
					WHERE {
						BIND(geo:Feature as ?gf1) .
						BIND(?uri as ?f1) .

						# Source Object
						?f1 a ?ft1 .
						?f1 rdfs:label ?lbl1 .
						?f1 lpgs:GeoObject-code ?code1 .

						OPTIONAL {
							?f1 geo:hasGeometry ?g1 .
							?g1 geo:asWKT ?wkt1 .
						}

						{
							# Outgoing Relationship
							?f1 ?e1 ?f2 .
							?f2 a ?ft2 .
							###TYPE_FILTER_FILTER1###
							?f2 rdfs:label ?lbl2 .
							?f2 lpgs:GeoObject-code ?code2 .

							BIND(geo:Feature as ?gf2) .
							BIND(?f2 as ?ev1) .

							OPTIONAL {
								?f2 geo:hasGeometry ?g2 .
								?g2 geo:asWKT ?wkt2 .
							}
						}
						UNION
						{
							# Incoming Relationship
							?f3 ?e2 ?f1 .
							?f3 a ?ft3 .
							###TYPE_FILTER_FILTER2###
							?f3 rdfs:label ?lbl3 .
							?f3 lpgs:GeoObject-code ?code3 .

							BIND(geo:Feature as ?gf3) .
							BIND(?f3 as ?ev2) .

							OPTIONAL {
								?f3 geo:hasGeometry ?g3 .
								?g3 geo:asWKT ?wkt3 .
							}
						}
					}
					LIMIT 100
			""";

	public static String NEIGHBOR_METADATA_QUERY = PREFIXES + """
					PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>
			PREFIX lpg: <https://localhost:4200/lpg#>
			PREFIX lpgv: <https://localhost:4200/lpg/graph_801104/0#>
			PREFIX lpgvs: <https://localhost:4200/lpg/graph_801104/0/rdfs#>
			PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
			PREFIX geo: <http://www.opengis.net/ont/geosparql#>

			SELECT ?type (COUNT(DISTINCT ?obj) AS ?count)
			FROM lpgv:
			WHERE {
			  {
			    # Type of source object
			    BIND(?uri AS ?obj)
			    ?obj a ?type .
			    ?obj lpgs:GeoObject-code ?code .
			  }
			  UNION
			  {
			    # Outgoing object types
			    ?uri ?p1 ?obj .
			    ?obj a ?type .
			    ?obj lpgs:GeoObject-code ?code .
			  }
			  UNION
			  {
			    # Incoming object types
			    ?obj ?p2 ?uri .
			    ?obj a ?type .
			    ?obj lpgs:GeoObject-code ?code .
			  }
			}
			GROUP BY ?type
			ORDER BY DESC(?count)
					""";

	public static String FULL_TEXT_LOOKUP = PREFIXES + """
					PREFIX   ex: <https://localhost:4200/lpg/graph_801104/0/rdfs#>
			      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
			      PREFIX text: <http://jena.apache.org/text#>
			      PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>

			      SELECT ?uri ?type ?code ?label ?wkt
			      FROM <https://localhost:4200/lpg/graph_801104/0#>
			      WHERE {{
			        (?uri ?score) text:query (rdfs:label ?query) .
			        ?uri lpgs:GeoObject-code ?code .
			        ?uri rdfs:label ?label .
			        ?uri a ?type .
			        OPTIONAL {
			            ?uri geo:hasGeometry ?g .
			            ?g geo:asWKT ?wkt .
			        }
			      }}
			      ORDER BY DESC(?score)
			""";

	@Autowired
	private AppProperties properties;

	public List<Location> query(String statement) {
		return this.query(statement, 0, 1000);
	}

	public List<Location> query(String statement, int offset, int limit) {
	    // The agent sometimes includes formatting text. Just remove it...
	    statement = statement.replaceAll("```", "");
	  
		RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create() //
				.destination(properties.getJenaUrl());

		String sparql = new String(statement);
		
		// Remove existing LIMIT and OFFSET clauses (case-insensitive)
		sparql = sparql.replaceAll("(?i)LIMIT\\s+\\d+", "");
		sparql = sparql.replaceAll("(?i)OFFSET\\s+\\d+", "");

		// Append ORDER BY, which must come before the limit
		if (!sparql.toUpperCase().contains("ORDER BY")) {
			sparql += " ORDER BY ASC(?label)";
		}

		// Append new LIMIT and OFFSET
		sparql += " LIMIT " + limit + " OFFSET " + offset;

		try (RDFConnection conn = builder.build()) {
			LinkedList<Location> results = new LinkedList<>();

			System.out.println("JenaService.query - EXECUTING QUERY");
			System.out.println(sparql);

			conn.querySelect(sparql, (qs) -> {
				String uri = qs.getResource("uri").getURI();
				String type = readString(qs, "type");
				String code = readString(qs, "code");
				String label = readString(qs, "label");
				String wkt = readString(qs, "wkt");

				WKTReader reader = WKTReader.extract(wkt);
				Geometry geometry = reader.getGeometry();

				results.add(new Location(uri, type, code, label, geometry));

			});

			return results;
		}
	}

	private String readString(QuerySolution qs, String name) {
		if (qs.contains(name)) {
			RDFNode node = qs.get(name);

			if (node.isLiteral()) {
				return node.asLiteral().getString();
			} else {
				return node.asResource().getURI();
			}
		}

		return "";
	}

	public Long getCount(String statement) {
		Map<String, Long> holder = new HashMap<>();

		RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create() //
				.destination(properties.getJenaUrl());

		StringBuilder sparql = new StringBuilder();

		int selectIndex = statement.toUpperCase().indexOf("SELECT");
		int fromIndex = statement.toUpperCase().indexOf("FROM");
		int whereIndex = statement.toUpperCase().indexOf("WHERE");
		int groupByIndex = statement.toUpperCase().indexOf("GROUP BY");

		// Prefix section
		sparql.append(statement.substring(0, selectIndex));
		sparql.append("SELECT (COUNT(distinct ?uri) AS ?count)\n");

		if (groupByIndex != -1) {
			sparql.append(statement.substring(fromIndex, groupByIndex));
		} else if (fromIndex != -1) {
			sparql.append(statement.substring(fromIndex));
		} else {
          sparql.append(statement.substring(whereIndex));
      }

		try (RDFConnection conn = builder.build()) {
			conn.querySelect(sparql.toString(), (qs) -> {
				holder.put("count", qs.getLiteral("count").getLong());
			});

			return holder.getOrDefault("count", 0L);
		}
	}

	public Location getAttributes(final String uri, boolean includeGeometry) {
		// if (uri.startsWith("<") && uri.endsWith(">"))
		// {
		// uri = uri.substring(1, uri.length() - 1);
		// }

		RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create() //
				.destination(properties.getJenaUrl());

		try (RDFConnection conn = builder.build()) {
			String statement = includeGeometry ? ATTRIBUTES_WITH_GEOMETRY_QUERY : ATTRIBUTES_QUERY;

			// Use ParameterizedSparqlString to inject the URI safely
			ParameterizedSparqlString pss = new ParameterizedSparqlString();
			pss.setCommandText(statement);
			pss.setIri("uri", uri);

			Location location = new Location();
			location.setId(uri);
			location.addProperty("uri", uri);

			conn.queryResultSet(pss.asQuery(), (resultSet) -> {

				if (!resultSet.hasNext()) {
					throw new GenericRestException("Unable to find a location with the uri [" + uri + "]");
				}

				resultSet.forEachRemaining(qs -> {

					String attribute = qs.get("p").asResource().getLocalName();

					RDFNode object = qs.get("o");

					if (attribute.equalsIgnoreCase("asWKT")) {
						WKTReader reader = WKTReader.extract(object.asLiteral().getString());
						Geometry geometry = reader.getGeometry();

						location.setGeometry(geometry);
					} else if (object.isLiteral()) {
						// TODO: Use metadata if we have it for attribute names
						// For now assume the attribute is in the style of
						// ClassName-AttributeName
						if (attribute.contains("-")) {
							attribute = attribute.split("-")[1];
						}

						Object value = object.asLiteral().getValue();

						location.addProperty(attribute, value);
					} else if (object.isResource()) {
						if (attribute.equalsIgnoreCase("type")) {
							location.addProperty("type", object.asResource().getURI());
						}
					}
				});
			});

			return location;

		}

	}

	public Graph neighbors(String uri, List<String> excludedTypes) {
		RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create().destination(properties.getJenaUrl());

		if (uri.startsWith("<") && uri.endsWith(">")) {
			uri = uri.substring(1, uri.length() - 1);
		}
		
		final Graph results = new Graph();

		// Fetch metadata
		try (RDFConnection conn = builder.build()) {
			ParameterizedSparqlString pss = new ParameterizedSparqlString();
			pss.setCommandText(NEIGHBOR_METADATA_QUERY);
			pss.setIri("uri", uri);

			conn.querySelect(pss.asQuery(), (qs) -> {
				results.getTypeCount().put(readString(qs, "type"), qs.getLiteral("count").getInt());
			});
		}

		// Grab the data
		try (RDFConnection conn = builder.build()) {
			String q = NEIGHBOR_QUERY.replace("###TYPE_FILTER_FILTER1###", exclusionFor("?ft2", excludedTypes))
				    .replace("###TYPE_FILTER_FILTER2###", exclusionFor("?ft3", excludedTypes));
			
			ParameterizedSparqlString pss = new ParameterizedSparqlString();
			pss.setCommandText(q);
			pss.setIri("uri", uri);

			try (QueryExecution qe = conn.query(pss.asQuery())) {
				ResultSet rs = qe.execSelect();
				SparqlGraphConverter.convert(results, rs);
			}
		}

		// The object has no neighbors
		if (results.getNodes().size() == 0) {
			results.setNodes(Arrays.asList(this.getAttributes(uri, true)));
		}

		return results;
	}
	
	private static String exclusionFor(String varName, List<String> excludedTypes) {
	    if (excludedTypes == null || excludedTypes.isEmpty()) return "";
	    Pattern iriPattern = Pattern.compile("^[a-zA-Z][a-zA-Z0-9+.-]*://[^\\s<>\"{}|\\\\^`]*$");

	    List<String> safeIris = excludedTypes.stream()
	        .filter(t -> t != null && iriPattern.matcher(t).matches())
	        .map(t -> "<" + t + ">")
	        .toList();

	    if (safeIris.isEmpty()) return "";
	    return "FILTER(" + varName + " NOT IN (" + String.join(", ", safeIris) + ")) .";
	}

	public LocationPage fullTextLookup(String query, int offset, int limit) {
		RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create().destination(properties.getJenaUrl());

		List<Location> results = new ArrayList<Location>();

		try (RDFConnection conn = builder.build()) {
			var sparql = FULL_TEXT_LOOKUP;
			sparql += " LIMIT " + limit + " OFFSET " + offset;

			// Use ParameterizedSparqlString to inject the URI safely
			ParameterizedSparqlString pss = new ParameterizedSparqlString();
			pss.setCommandText(sparql);

			pss.setLiteral("query", query);

			try (QueryExecution qe = conn.query(pss.asQuery())) {
				ResultSet rs = qe.execSelect();

				while (rs.hasNext()) {
					QuerySolution qs = rs.next();

					String uri = qs.getResource("uri").getURI();
					String type = qs.getResource("type").getURI();
					String code = qs.getLiteral("code").getString();
					String label = qs.getLiteral("label").getString();
					String wkt = qs.getLiteral("wkt").getString();

					WKTReader reader = WKTReader.extract(wkt);
					Geometry geometry = reader.getGeometry();

					results.add(new Location(uri, type, code, label, geometry));
				}
			}
		}

		LocationPage page = new LocationPage();
		page.setLocations(results);
		page.setCount(results.size());
		page.setLimit(100);
		page.setOffset(0);
		page.setStatement(FULL_TEXT_LOOKUP.replace("?query", FmtUtils.stringForString(query)));

		return page;
	}

}
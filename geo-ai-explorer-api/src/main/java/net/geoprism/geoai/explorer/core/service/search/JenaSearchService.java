package net.geoprism.geoai.explorer.core.service.search;

import java.util.ArrayList;
import java.util.List;

import org.apache.jena.geosparql.implementation.parsers.wkt.WKTReader;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionRemote;
import org.apache.jena.rdfconnection.RDFConnectionRemoteBuilder;
import org.apache.jena.sparql.util.FmtUtils;
import org.locationtech.jts.geom.Geometry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import net.geoprism.geoai.explorer.core.config.AppProperties;
import net.geoprism.geoai.explorer.core.model.Location;
import net.geoprism.geoai.explorer.core.model.LocationPage;
import net.geoprism.geoai.explorer.core.service.GraphQueryService;

/**
 * Uses Jena to provide the full text lookup capabilities
 */
@Service
@Primary
@ConditionalOnProperty(name = "explorer.search", havingValue = "jena")
public class JenaSearchService extends BasicSearchService
{
  public static String  JENA_FULL_TEXT_LOOKUP = GraphQueryService.PREFIXES + """
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

  public LocationPage fullTextLookup(String query, int offset, int limit)
  {
    RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create().destination(properties.getSparqlUrl());

    List<Location> results = new ArrayList<Location>();

    try (RDFConnection conn = builder.build())
    {
      var sparql = JENA_FULL_TEXT_LOOKUP;
      sparql += " LIMIT " + limit + " OFFSET " + offset;

      // Use ParameterizedSparqlString to inject the URI safely
      ParameterizedSparqlString pss = new ParameterizedSparqlString();
      pss.setCommandText(sparql);

      pss.setLiteral("query", query);

      try (QueryExecution qe = conn.query(pss.asQuery()))
      {
        ResultSet rs = qe.execSelect();

        while (rs.hasNext())
        {
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
    page.setStatement(JENA_FULL_TEXT_LOOKUP.replace("?query", FmtUtils.stringForString(query)));

    return page;
  }
}

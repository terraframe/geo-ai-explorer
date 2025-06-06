package net.geoprism.geoai.explorer.core.service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.io.WKTReader;

import net.geoprism.geoai.explorer.core.model.Edge;
import net.geoprism.geoai.explorer.core.model.Graph;
import net.geoprism.geoai.explorer.core.model.Location;

public class SparqlGraphConverter {
	public static void convert(Graph graph, ResultSet rs) {
        Map<String, Location> locationMap = new HashMap<>();
        
        if (!rs.hasNext()) {
          return;
        }

        while (rs.hasNext()) {
            QuerySolution qs = rs.next();
            String uri1 = qs.contains("f1") ? qs.getResource("f1").getURI() : null;
            String outUri = qs.contains("f2") ? qs.getResource("f2").getURI() : null;
            String inUri = qs.contains("f3") ? qs.getResource("f3").getURI() : null;
            String outEdgeType = qs.contains("e1") ? qs.getResource("e1").getURI() : null;
            String inEdgeType = qs.contains("e2") ? qs.getResource("e2").getURI() : null;

            boolean firstRow = !locationMap.containsKey(uri1);
            Location loc1 = locationMap.computeIfAbsent(uri1, u -> createLocation(qs, "f1", "ft1", "wkt1", "lbl1", "code1"));
            if (firstRow) graph.getNodes().add(loc1);
            
            if (outUri != null)
            {
            	Location loc2 = locationMap.computeIfAbsent(outUri, u -> createLocation(qs, "f2", "ft2", "wkt2", "lbl2", "code2"));

	            graph.getNodes().add(loc2);
	
	            // Add Edge
	            Edge edge = new Edge(loc1.getId(), loc2.getId(), outEdgeType);
	            graph.getEdges().add(edge);
            }
            
            if (inUri != null)
            {
            	Location loc3 = locationMap.computeIfAbsent(inUri, u -> createLocation(qs, "f3", "ft3", "wkt3", "lbl3", "code3"));

	            graph.getNodes().add(loc3);
	
	            // Add Edge
	            Edge edge = new Edge(loc3.getId(), loc1.getId(), inEdgeType);
	            graph.getEdges().add(edge);
            }
        }
    }

    private static Location createLocation(QuerySolution qs, String uriVar, String typeVar, String wktVar, String labelVar, String codeVar) {
    	String uri = qs.contains(uriVar) ? qs.getResource(uriVar).getURI() : UUID.randomUUID().toString();
    	String type = qs.contains(typeVar) ? qs.getResource(typeVar).getURI() : "Unknown";
        String label = qs.contains(labelVar) ? qs.getLiteral(labelVar).getString() : "";
        String code = qs.contains(codeVar) ? qs.getLiteral(codeVar).getString() : "";
        Geometry geometry = null;

        if (qs.contains(wktVar) && qs.get(wktVar).isLiteral()) {
            try {
            	String wktLiteral = qs.getLiteral(wktVar).getString();
            	String cleanWkt = wktLiteral.replaceAll("^<[^>]+>\\s+", ""); // Remove CRS prefix

            	WKTReader reader = new WKTReader();
            	geometry = reader.read(cleanWkt);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return new Location(uri, type, code, label, geometry);
    }
}

package net.geoprism.geoai.explorer.core.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Serializable;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import org.apache.commons.io.FileUtils;
import org.apache.jena.graph.Node;
import org.apache.jena.graph.NodeFactory;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionRemote;
import org.apache.jena.rdfconnection.RDFConnectionRemoteBuilder;
import org.apache.jena.riot.RDFFormat;
import org.apache.jena.riot.system.StreamRDF;
import org.apache.jena.riot.system.StreamRDFWriter;
import org.apache.jena.sparql.core.Quad;
import org.geotools.api.data.DataStore;
import org.geotools.api.data.SimpleFeatureSource;
import org.geotools.api.data.SimpleFeatureStore;
import org.geotools.api.data.Transaction;
import org.geotools.api.feature.simple.SimpleFeature;
import org.geotools.api.feature.simple.SimpleFeatureType;
import org.geotools.data.DataUtilities;
import org.geotools.data.DefaultTransaction;
import org.geotools.data.collection.ListFeatureCollection;
import org.geotools.data.shapefile.ShapefileDataStoreFactory;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.SchemaException;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.geojson.feature.FeatureJSON;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.geoprism.geoai.explorer.core.config.AppProperties;
import net.geoprism.geoai.explorer.core.config.TestConfiguration;
import net.geoprism.geoai.explorer.core.model.Location;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK, classes = TestConfiguration.class)
@AutoConfigureMockMvc
public class JenaRDFBuilderIntegrationTest
{
  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  static class AttributeInfo
  {
    private String name;

    private String type;
  }

  @Data
  @AllArgsConstructor
  @NoArgsConstructor
  static class TypeInfo
  {
    private String                     type;

    private String                     geometryType;

    private Set<String>                subjects;

    private Map<String, AttributeInfo> attributes;

    public TypeInfo(String type, String geometryType, AttributeInfo... extras)
    {
      this.type = type;
      this.geometryType = geometryType;
      this.subjects = new TreeSet<>();
      this.attributes = new HashMap<>();
      this.attributes.put("label", new AttributeInfo("label", "String"));
      this.attributes.put("code", new AttributeInfo("code", "String"));

      for (AttributeInfo extra : extras)
      {
        this.attributes.put(extra.name, extra);
      }
    }

    public void add(String uri)
    {
      this.subjects.add(uri);
    }
  }

  public static final List<String> CODES = Arrays.asList("CEMVK_RR_03_ONE_25", "CEMVK_RR_03_ONE_26", "CEMVK_RR_03_ONE_27", "CEMVK_RR_03_ONE_28");

  @Autowired
  private AppProperties            properties;

  @Autowired
  private JenaService              service;

  // @Test
  public void exportTrigFile() throws FileNotFoundException, IOException
  {
    RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create() //
        .destination(properties.getJenaUrl());

    System.out.println(properties.getJenaUrl());

    // Create the list of subject objects to export
    Set<String> subjects = new TreeSet<>();
    try (RDFConnection conn = builder.build())
    {
      for (String code : CODES)
      {

        StringBuilder statement = new StringBuilder();
        statement.append("PREFIX lpgvs: <https://localhost:4200/lpg/graph_801104/0/rdfs#>\n");
        statement.append("PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>\n");
        statement.append("PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n");
        statement.append("SELECT *\n");
        statement.append("FROM <https://localhost:4200/lpg/graph_801104/0#>\n");
        statement.append("WHERE {\n");
        statement.append("  {\n");
        statement.append("    SELECT * WHERE {\n");
        statement.append("      ?root a lpgvs:ChannelReach .\n");
        statement.append("      ?root lpgs:GeoObject-code '" + code + "' .\n");
        statement.append("      OPTIONAL {\n");
        statement.append("        ?root lpgvs:FlowsInto ?sub .\n");
        statement.append("      }\n");
        statement.append("      ?root lpgvs:ChannelHasLevee ?levee .\n");
        statement.append("      ?levee lpgvs:HasFloodZone ?leveedArea .\n");
        statement.append("      ?tract lpgvs:TractAtRisk ?leveedArea .\n");
        statement.append("    }\n");
        statement.append("  }\n");
        statement.append("  UNION {\n");
        statement.append("    SELECT * WHERE {\n");
        statement.append("      ?root a lpgvs:ChannelReach .\n");
        statement.append("      ?root lpgs:GeoObject-code '" + code + "' .\n");
        statement.append("      OPTIONAL {\n");
        statement.append("        ?root lpgvs:FlowsInto ?sub .\n");
        statement.append("      }\n");
        statement.append("      ?root lpgvs:ChannelHasLevee ?levee .\n");
        statement.append("      ?levee lpgvs:HasFloodZone ?leveedArea .\n");
        statement.append("      ?leveedArea lpgvs:HasFloodRisk ?school .\n");
        statement.append("      ?zone lpgvs:HasSchoolZone ?school .\n");
        statement.append("    }\n");
        statement.append("  }\n");
        statement.append("}");

        conn.queryResultSet(statement.toString(), (resultSet) -> {

          final List<String> vars = resultSet.getResultVars();

          resultSet.forEachRemaining(qs -> {
            for (String var : vars)
            {
              RDFNode node = qs.get(var);

              if (node != null && node.isResource())
              {
                String uri = node.asResource().getURI();

                if (uri != null)
                {
                  subjects.add(uri);
                }
              }
            }

          });
        });
      }

      // For each subject export all of their predicate and objects
      try (FileOutputStream ostream = new FileOutputStream(new File("export.trig")))
      {
        StreamRDF writer = StreamRDFWriter.getWriterStream(ostream, RDFFormat.TRIG_BLOCKS);

        writer.start();

        try
        {
          for (String subject : subjects)
          {
            StringBuilder statement = new StringBuilder();
            statement.append("SELECT ?p ?o\n");
            statement.append("FROM <https://localhost:4200/lpg/graph_801104/0#>\n");
            statement.append("WHERE {\n");
            statement.append(" <" + subject + "> ?p ?o \n");
            statement.append("}");

            conn.queryResultSet(statement.toString(), (resultSet) -> {

              resultSet.forEachRemaining(qs -> {
                RDFNode object = qs.get("o");
                String predicate = qs.getResource("p").getURI();

                if (!predicate.contains("hasGeometry"))
                {

                  Node graphNode = NodeFactory.createURI("https://localhost:4200/lpg/graph_801104/0#");
                  Node subjectNode = NodeFactory.createURI(subject);
                  Node predicateNode = NodeFactory.createURI(predicate);
                  Node objectNode = object.isResource() ? NodeFactory.createURI(object.asResource().getURI()) : NodeFactory.createLiteralByValue(object.asLiteral().getValue());

                  writer.quad(Quad.create(graphNode, subjectNode, predicateNode, objectNode));
                }
              });
            });
          }
        }
        finally
        {
          writer.finish();
        }
      }
    }

  }

  @SuppressWarnings("deprecation")
  @Test
  public void exportShapefiles() throws FileNotFoundException, IOException
  {
    RDFConnectionRemoteBuilder builder = RDFConnectionRemote.create() //
        .destination(properties.getJenaUrl());

    System.out.println(properties.getJenaUrl());

    TypeInfo channel = new TypeInfo("ChannelReach", "MultiPolygon");

    Map<String, TypeInfo> map = new HashMap<String, TypeInfo>();
    map.put("root", channel);
    map.put("sub", channel);
    map.put("levee", new TypeInfo("LeveeArea", "MultiPolygon"));
    map.put("leveedArea", new TypeInfo("LeveedArea", "MultiPolygon"));
    map.put("tract", new TypeInfo("CensusTract", "MultiPolygon", new AttributeInfo("population", "Integer")));
    map.put("school", new TypeInfo("School", "MultiPoint", new AttributeInfo("population", "Integer")));
    map.put("zone", new TypeInfo("SchoolZone", "MultiPolygon"));

    // Create the list of subject objects to export
    try (RDFConnection conn = builder.build())
    {
      for (String code : CODES)
      {

        StringBuilder statement = new StringBuilder();
        statement.append("PREFIX lpgvs: <https://localhost:4200/lpg/graph_801104/0/rdfs#>\n");
        statement.append("PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>\n");
        statement.append("PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n");
        statement.append("SELECT *\n");
        statement.append("FROM <https://localhost:4200/lpg/graph_801104/0#>\n");
        statement.append("WHERE {\n");
        statement.append("  {\n");
        statement.append("    SELECT * WHERE {\n");
        statement.append("      ?root a lpgvs:ChannelReach .\n");
        statement.append("      ?root lpgs:GeoObject-code '" + code + "' .\n");
        statement.append("      OPTIONAL {\n");
        statement.append("        ?root lpgvs:FlowsInto ?sub .\n");
        statement.append("      }\n");
        statement.append("      ?root lpgvs:ChannelHasLevee ?levee .\n");
        statement.append("      ?levee lpgvs:HasFloodZone ?leveedArea .\n");
        statement.append("      ?tract lpgvs:TractAtRisk ?leveedArea .\n");
        statement.append("    }\n");
        statement.append("  }\n");
        statement.append("  UNION {\n");
        statement.append("    SELECT * WHERE {\n");
        statement.append("      ?root a lpgvs:ChannelReach .\n");
        statement.append("      ?root lpgs:GeoObject-code '" + code + "' .\n");
        statement.append("      OPTIONAL {\n");
        statement.append("        ?root lpgvs:FlowsInto ?sub .\n");
        statement.append("      }\n");
        statement.append("      ?root lpgvs:ChannelHasLevee ?levee .\n");
        statement.append("      ?levee lpgvs:HasFloodZone ?leveedArea .\n");
        statement.append("      ?leveedArea lpgvs:HasFloodRisk ?school .\n");
        statement.append("      ?zone lpgvs:HasSchoolZone ?school .\n");
        statement.append("    }\n");
        statement.append("  }\n");
        statement.append("}");

        conn.queryResultSet(statement.toString(), (resultSet) -> {

          final List<String> vars = resultSet.getResultVars();

          resultSet.forEachRemaining(qs -> {
            for (String var : vars)
            {
              RDFNode node = qs.get(var);

              if (node != null && node.isResource())
              {
                String uri = node.asResource().getURI();

                if (uri != null)
                {
                  map.get(var).add(uri);
                }
              }
            }
          });
        });
      }

      // Additionally create a geojson file with the data
      File geojson = new File("geojson");

      if (geojson.exists())
      {
        FileUtils.deleteDirectory(geojson);
      }

      geojson.mkdirs();

      map.forEach((var, info) -> {

        if (!var.equals("sub"))
        {
          StringBuilder definition = new StringBuilder();
          definition.append("the_geom:" + info.geometryType + ":srid=4326");

          info.attributes.forEach((key, attribute) -> {
            definition.append("," + attribute.name + ":" + attribute.type);
          });

          try
          {
            // Define the feature type
            SimpleFeatureType featureType = DataUtilities.createType(info.type, definition.toString());

            /*
             * A list to collect features as we create them.
             */
            List<SimpleFeature> features = new ArrayList<>();

            /*
             * GeometryFactory will be used to create the geometry attribute of
             * each feature, using a Point object for the location.
             */
            SimpleFeatureBuilder featureBuilder = new SimpleFeatureBuilder(featureType);

            for (String subject : info.subjects)
            {
              // Build the features
              Location location = this.service.getAttributes(subject, true);

              featureBuilder.add(location.getGeometry());

              info.attributes.forEach((key, attribute) -> {
                Map<String, Object> props = location.getProperties();

                featureBuilder.add(props.get(key));
              });

              SimpleFeature feature = featureBuilder.buildFeature(location.getId());

              features.add(feature);
            }

            // Create the shapefile
            File directory = new File("shapefiles/" + info.getType());

            if (directory.exists())
            {
              FileUtils.deleteDirectory(directory);
            }

            directory.mkdirs();

            ShapefileDataStoreFactory dataStoreFactory = new ShapefileDataStoreFactory();

            Map<String, Serializable> params = new HashMap<>();
            params.put("url", directory.toURI().toURL());
            params.put("create spatial index", Boolean.TRUE);

            DataStore newDataStore = dataStoreFactory.createNewDataStore(params);

            /*
             * TYPE is used as a template to describe the file contents
             */
            newDataStore.createSchema(featureType);

            /*
             * Write the features to the shapefile
             */
            Transaction transaction = new DefaultTransaction("create");

            String typeName = newDataStore.getTypeNames()[0];
            SimpleFeatureSource featureSource = newDataStore.getFeatureSource(typeName);

            if (featureSource instanceof SimpleFeatureStore)
            {
              SimpleFeatureStore featureStore = (SimpleFeatureStore) featureSource;
              /*
               * SimpleFeatureStore has a method to add features from a
               * SimpleFeatureCollection object, so we use the
               * ListFeatureCollection class to wrap our list of features.
               */
              SimpleFeatureCollection collection = new ListFeatureCollection(featureType, features);
              featureStore.setTransaction(transaction);
              try
              {
                featureStore.addFeatures(collection);
                transaction.commit();
              }
              catch (Exception problem)
              {
                problem.printStackTrace();
                transaction.rollback();
              }
              finally
              {
                transaction.close();
              }

              try (FileWriter writer = new FileWriter(new File(geojson, info.getType() + ".geojson")))
              {
                FeatureJSON fjson = new FeatureJSON();
                fjson.writeFeatureCollection(collection, writer);
              }
            }
            else
            {
              System.out.println(typeName + " does not support read/write access");
            }
          }
          catch (SchemaException | IOException e)
          {
            throw new RuntimeException(e);
          }
        }
      });
    }

  }

}
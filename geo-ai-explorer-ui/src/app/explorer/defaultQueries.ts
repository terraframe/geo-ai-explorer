import { StyleConfig } from "../models/style.model";


export interface QueryConfig { title: string, sparql: string, styles: StyleConfig, wktVar: string, focus?: string }

export const stateCentroid = {
  'Alabama': 'POINT(32.789086191041434 -86.7720711354423)',
  'Alaska': "POINT(63.67687347681572 -148.59318752459765)",
  'Arizona': "POINT(34.3214380220878 -111.70335495974372)",
  'Arkansas': "POINT(34.73136192154202 -92.25109194408903)",
  'California': "POINT(36.81812877727798 -119.77997972387986)",
  'Colorado': "POINT(39.27504398311664 -105.50983906203898)",
  'Connecticut': "POINT(41.63857643520059 -72.65881246877078)",
  'Delaware': "POINT(38.99626263717853 -75.51474965848284)",
  'Florida': "POINT(28.599760125907853 -81.88761981519225)",
  'Georgia': "POINT(32.73410081257544 -83.16453971142646)",
  'Hawaii': "POINT(20.90214229156724 -157.2917468645364)",
  'Idaho': "POINT(44.673820559395054 -114.78789086055774)",
  'Illinois': "POINT(40.38462335044361 -89.35386258035841)",
  'Indiana': "POINT(39.937646809441745 -86.25157321559536)",
  'Iowa': "POINT(42.1936164999191 -93.34849077899067)",
  'Kansas': "POINT(38.68318833488225 -98.30106944871468)",
  'Kentucky': "POINT(37.58428304756201 -85.23268705177152)",
  'Louisiana': "POINT(30.949968975365064 -92.17275494567667)",
  'Maine': "POINT(45.34370949423833 -69.26171111428044)",
  'Maryland': "POINT(39.246199192594986 -76.80702449112808)",
  'Massachusetts': "POINT(42.36712981689756 -71.89297870459292)",
  'Michigan': "POINT(44.58052571224928 -84.96560979358756)",
  'Minnesota': "POINT(46.38883136655231 -94.3085270813808)",
  'Mississippi': "POINT(32.863949237635175 -89.67115300890605)",
  'Missouri': "POINT(38.56773309756065 -92.51672098658355)",
  'Montana': "POINT(47.189450315662555 -109.43141708656171)",
  'Nebraska': "POINT(41.64328601102762 -99.54078197782697)",
  'Nevada': "POINT(39.6494029528147 -116.68535466547152)",
  'New Hampshire': "POINT(43.87118920383149 -71.50635465593484)",
  'New Jersey': "POINT(40.162274900749246 -74.62068735103527)",
  'New Mexico': "POINT(34.482772138076946 -106.00758493712898)",
  'New York': "POINT(40.771788887060495 -73.8981726477129)",
  'North Carolina': "POINT(35.6969588699727 -79.15009915515135)",
  'North Dakota': "POINT(47.55629685796633 -100.28189273064936)",
  'Ohio': "POINT(40.41708863955768 -82.72723944679935)",
  'Oklahoma': "POINT(35.70970701092796 -97.24777474568536)",
  'Oregon': "POINT(44.18615135490685 -120.50896034498346)",
  'Pennsylvania': "POINT(41.026631431959025 -77.6933131240006)",
  'Puerto Rico': "POINT(18.24428637523363 -66.5252271076189)",
  'Rhode Island': "POINT(41.70939762700985 -71.51457622734324)",
  'South Carolina': "POINT(34.03684136491442 -80.66926615301222)",
  'South Dakota': "POINT(44.59823216906491 -100.128782941894)",
  'Tennessee': "POINT(35.94416399712969 -86.42133563202755)",
  'Texas': "POINT(31.623789207668707 -98.88334384961011)",
  'Utah': "POINT(39.35949361814378 -111.429256950244)",
  'Vermont': "POINT(44.04216564924113 -72.75427265008868)",
  'Virginia': "POINT(37.52220677390323 -78.6329056971331)",
  'Washington': "POINT(47.42883070418504 -120.3683372906725)",
  'West Virginia': "POINT(38.76727592910808 -80.63324687973355)",
  'Wisconsin': "POINT(44.76126625824688 -89.78062441065751)",
  'Wyoming': "POINT(43.138551556979436 -107.38018780284965)"
};

let prefixes: string = `PREFIX lpgs: <https://dev-georegistry.geoprism.net/lpg/rdfs#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX lpgv: <https://dev-georegistry.geoprism.net/lpg/deliverable2024/0#>
PREFIX lpgvs: <https://dev-georegistry.geoprism.net/lpg/deliverable2024/0/rdfs#>
PREFIX spatialF: <http://jena.apache.org/function/spatial#>
`

export const SELECTED_COLOR = "#ffff00";
export const HOVER_COLOR = "#cf0000";

let defaultStyles = {
  'lpgvs:Hospital': { color: '#F2799D', order: 0 },
  'lpgvs:Dam': { color: '#D5F279', order: 0 },
  'lpgvs:Project': { color: '#C0F279', order: 6, label: "Real Property Project" },
  'lpgvs:Watershed': { color: '#79F2C9', order: 4 },
  'lpgvs:LeveeArea': { color: '#d1d1d1', order: 4 },
  'lpgvs:RealProperty': { color: '#79F294', order: 0 },
  'lpgvs:Reservoir': { color: '#caeefb', order: 5 },
  'lpgvs:ChannelArea': { color: '#156082', order: 4 },
  'lpgvs:ChannelReach': { color: '#79DAF2', order: 4 },
  'lpgvs:RecreationArea': { color: '#F2E779', order: 3 },
  'lpgvs:School': { color: '#F2A579', order: 0 },
  'lpgvs:ChannelLine': { color: '#79F2A0', order: 1 },
  'lpgvs:LeveedArea': { color: '#C379F2', order: 4 },
  'lpgvs:River': { color: '#7999F2', order: 2 },
  'lpgvs:SchoolZone': { color: '#fbe3d6', order: 6 },
  'lpgvs:Levee': { color: '#F279E0', order: 0 },
  'lpgvs:WaterLock': { color: '#79F2E2', order: 0 },
  'lpgvs:UsaceRecreationArea': { color: '#F2BE79', order: 3 },
  'http://dime.usace.mil/ontologies/cwbi-concept#Program': { color: '#FF5733', order: 0 }
};

export const defaultQueries: QueryConfig[] = [
  {
    title: "Show me some data",
    sparql: prefixes + `
      SELECT
      ?gf1 ?ft1 ?f1 ?wkt1 ?lbl1
      FROM lpgv: 
      WHERE {
        BIND(geo:Feature as ?gf1) .
        ?f1 a ?ft1 .
        ?f1 geo:hasGeometry ?g1 .
        ?g1 geo:asWKT ?wkt1 .
        ?f1 rdfs:label ?lbl1 .
      }
      LIMIT 10`,
    wktVar: "COALESCE(?wkt5,?wkt4,?wkt3,?wkt2,?wkt1)",
    styles: defaultStyles
  },
  {
    title: "'Map It' AI Query",
    sparql: prefixes + `
  SELECT
  ?gf1 ?ft1 ?f1 ?wkt1 ?lbl1
  FROM lpgv: 
  WHERE {
    BIND(geo:Feature as ?gf1) .
    BIND(lpgvs:SchoolZone as ?ft1) .
    ?f1 a ?ft1 .
    ?f1 geo:hasGeometry ?g1 .
    ?g1 geo:asWKT ?wkt1 .
    ?f1 rdfs:label ?lbl1 .

    # Only include these specific school districts
    FILTER(?lbl1 IN (
        "Pine Bluff School District", 
        "Hamburg School District", 
        "Dermott School District", 
        "Dumas School District", 
        "Lakeside School District", 
        "McGehee School District",
        "Avoyelles Parish School District",
        "Catahoula Parish School District",
        "Concordia Parish School District",
        "East Carroll Parish School District",
        "Franklin Parish School District"
    ))
  }
  LIMIT 10`,
    wktVar: "COALESCE(?wkt5,?wkt4,?wkt3,?wkt2,?wkt1)",
    styles: defaultStyles
  },
  {
    title: "Selected object's neighbors",
    sparql: prefixes + `
      SELECT
      ?gf1 ?ft1 ?f1 ?wkt1 ?lbl1 # Selected Object
      ?e1 ?ev1 # Edge
      ?gf2 ?ft2 ?f2 ?wkt2 ?lbl2 # Neighbor Vertex
      FROM lpgv: 
      WHERE {
        BIND(geo:Feature as ?gf1) .
        BIND(<{{uri}}> as ?f1) .
        ?f1 a ?ft1 .
        ?f1 geo:hasGeometry ?g1 .
        ?g1 geo:asWKT ?wkt1 .
        ?f1 rdfs:label ?lbl1 .

        ?f1 ?e1 ?f2 .
        BIND(?f2 as ?ev1) .

        BIND(geo:Feature as ?gf2) 
        ?f2 a ?ft2 .
        ?f2 geo:hasGeometry ?g2 .
        ?g2 geo:asWKT ?wkt2 .
        ?f2 rdfs:label ?lbl2 .
      }
      LIMIT 10`,
    wktVar: "COALESCE(?wkt5,?wkt4,?wkt3,?wkt2,?wkt1)",
    styles: defaultStyles
  }
];

export const locationCriteriaSparql = `
  # Limit to a geographic area
  BIND("<http://www.opengis.net/def/crs/EPSG/0/4326> {{centroid}}"^^<http://www.opengis.net/ont/geosparql#wktLiteral> AS ?p) .
  FILTER(spatialF:nearby({{wktVar}},?p,350,<http://www.opengis.net/def/uom/OGC/1.0/kilometre>))
`;

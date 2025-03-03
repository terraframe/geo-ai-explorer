
export interface StyleConfig { [key: string]: {color:string, order:number, label?: string} }

export interface QueryConfig { title:string, sparql: string, styles: StyleConfig, wktVar: string, focus?: string }

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

let prefixes:string = `PREFIX lpgs: <https://dev-georegistry.geoprism.net/lpg/rdfs#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX lpgv: <https://dev-georegistry.geoprism.net/lpg/deliverable2024/0#>
PREFIX lpgvs: <https://dev-georegistry.geoprism.net/lpg/deliverable2024/0/rdfs#>
PREFIX spatialF: <http://jena.apache.org/function/spatial#>
`

export const SELECTED_COLOR = "#ffff00";

let defaultStyles = {
    'lpgvs:Hospital': {color:'#F2799D', order:0},
    'lpgvs:Dam':{color:'#D5F279', order:0},
    'lpgvs:Project':{color:'#C0F279', order:6, label:"Real Property Project"},
    'lpgvs:Watershed':{color:'#79F2C9', order:4},
    'lpgvs:LeveeArea':{color:'#d1d1d1', order:4}, 
    'lpgvs:RealProperty':{color:'#79F294', order:0},
    'lpgvs:Reservoir':{color:'#caeefb', order:5},
    'lpgvs:ChannelArea':{color:'#156082',order:4},
    'lpgvs:ChannelReach':{color:'#79DAF2',order:4},
    'lpgvs:RecreationArea':{color:'#F2E779',order:3},
    'lpgvs:School':{color:'#F2A579',order:0},
    'lpgvs:ChannelLine':{color:'#79F2A0',order:1},
    'lpgvs:LeveedArea':{color:'#C379F2',order:4},
    'lpgvs:River':{color:'#7999F2',order:2},
    'lpgvs:SchoolZone':{color:'#fbe3d6',order:6},
    'lpgvs:Levee':{color:'#F279E0',order:0},
    'lpgvs:WaterLock':{color:'#79F2E2',order:0},
    'lpgvs:UsaceRecreationArea':{color:'#F2BE79',order:3},
    'http://dime.usace.mil/ontologies/cwbi-concept#Program':{color:'#FF5733',order:0}
};

export const defaultQueries: QueryConfig[] = [
    {
        title: "Projects FloodRisk Structures",
        sparql: prefixes + `
SELECT
?gf1 ?ft1 ?f1 ?wkt1 ?lbl1 # Project
?e1 ?ev1 # ConnectedTo
?gf2 ?ft2 ?f2 ?wkt2 ?lbl2 # LeveeArea
?e2 ?ev2 # HasFloodZone
?gf3 ?ft3 ?f3 ?wkt3 ?lbl3 # LeveedArea
?e3 ?ev3 # ConnectedTo
?gf4 ?ft4 ?f4 ?wkt4 ?lbl4 # Object of interest
FROM lpgv: 
WHERE {
  BIND(geo:Feature as ?gf1) .
  BIND(lpgvs:Project as ?ft1) .
  ?f1 a ?ft1 .
  ?f1 geo:hasGeometry ?g1 .
  ?g1 geo:asWKT ?wkt1 .
  ?f1 rdfs:label ?lbl1 .
  ?f1 lpgvs:ConnectedTo ?f2 .

  BIND(lpgvs:ConnectedTo as ?e1) .
  BIND(?f2 as ?ev1) .

  BIND(geo:Feature as ?gf2) .
  BIND(lpgvs:LeveeArea as ?ft2) .
  ?f2 a ?ft2 .
  ?f2 geo:hasGeometry ?g2 .
  ?g2 geo:asWKT ?wkt2 .
  ?f2 rdfs:label ?lbl2 .
  ?f2 lpgvs:HasFloodZone ?f3 .
  
  BIND(lpgvs:HasFloodZone as ?e2) .
  BIND(?f3 as ?ev2) .

  BIND(geo:Feature as ?gf3) .
  BIND(lpgvs:LeveedArea as ?ft3) .
  ?f3 a ?ft3 .
  ?f3 geo:hasGeometry ?g3 .
  ?g3 geo:asWKT ?wkt3 .
  ?f3 rdfs:label ?lbl3 .
  ?f3 lpgvs:HasFloodRisk ?f4 .
  
  BIND(lpgvs:HasFloodRisk as ?e3) .
  BIND(?f4 as ?ev3) .

  BIND(geo:Feature as ?gf4) .
  ?f4 a ?ft4 .
  ?f4 geo:hasGeometry ?g4 .
  ?g4 geo:asWKT ?wkt4 .
  ?f4 rdfs:label ?lbl4
}
LIMIT 30`,
        wktVar: "COALESCE(?wkt5,?wkt4,?wkt3,?wkt2,?wkt1)",
        styles: defaultStyles,
        focus: "https://dev-georegistry.geoprism.net/lpg/deliverable2024/0#Project-PROJ819"
    },
    {
        title: "ChannelReach ConnectedTo ProjectArea PartOf Program",
        sparql: prefixes + `PREFIX lds: <http://dime.usace.mil/data/dataset#TERRAFRAME_CHANNEL_TO_PROJECT>
PREFIX ldsremis: <http://dime.usace.mil/data/dataset#REMIS_PROJECTS>

SELECT
?gf1 ?ft1 ?f1 ?wkt1 ?lbl1 # ChannelReach
?e1 ?ev1 # ConnectedTo
?gf2 ?ft2 ?f2 ?wkt2 ?lbl2 # Project (GPR)
?e2 ?ev2 # IsPartOf (ImageMatters)
?gf3 ?ft3 ?f3 ?lbl3 # Program
FROM lpgv:
FROM lds:
FROM ldsremis:
WHERE {
  BIND(geo:Feature as ?gf1) .
  BIND(lpgvs:ChannelReach as ?ft1) .
  ?f1 a ?ft1 .
  ?f1 geo:hasGeometry ?g1 .
  ?g1 geo:asWKT ?wkt1 .
  ?f1 rdfs:label ?lbl1 .
  ?f1 lpgvs:ConnectedTo ?f2 .

  BIND(lpgvs:ConnectedTo as ?e1) .
  BIND(?f2 as ?ev1) .

  BIND(geo:Feature as ?gf2) .
  BIND(lpgvs:Project as ?ft2) .
  ?f2 a ?ft2 .
  ?f2 geo:hasGeometry ?g2 .
  ?g2 geo:asWKT ?wkt2 .
  ?f2 rdfs:label ?lbl2 .
  ?f2 lpgs:GeoObject-code ?f2code .

  ?imp <http://www.w3.org/2004/02/skos/core#altLabel> ?f2code .
  ?imp <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dime.usace.mil/ontologies/cwbi-concept#Remis_Project> .
  ?imp <http://dime.usace.mil/ontologies/cwbi-concept#Program> ?f3 .
  
  BIND(<http://dime.usace.mil/ontologies/cwbi-concept#Program> as ?e2) .
  BIND(?f3 as ?ev2) .

  BIND(geo:Feature as ?gf3) .
  ?f3 a <http://dime.usace.mil/ontologies/cwbi-concept#Program> .
  BIND(<http://dime.usace.mil/ontologies/cwbi-concept#Program> as ?ft3) .
  ?f3 <http://www.w3.org/2004/02/skos/core#altLabel> ?lbl3
}
LIMIT 100`,
        wktVar: "COALESCE(?wkt5,?wkt4,?wkt3,?wkt2,?wkt1)",
        styles: defaultStyles,
        focus: "https://dev-georegistry.geoprism.net/lpg/deliverable2024/0#ChannelReach-CESWL_AR_06_TER_5",
        // focus: "https://dev-georegistry.geoprism.net/lpg/deliverable2024/0#ChannelReach-CENWO_MO_10_OML_5"
    },

    /* This hydrology query is incredibly difficult to expand past this pooint because:
     * 1. Our dataset has no dams
     * 2. The LeveeAreas returned from this dataset don't have any FloodZones (otherwise we could join this query with query 1)
     */
    {
      title: "Hydrology",
      sparql: prefixes + `
SELECT
?gf1 ?ft1 ?f1 ?wkt1 ?lbl1 # ChannelReach
?e1 ?ev1 # FlowsThrough
?e3 ?ev3 # ChannelHasLevee
?gf2 ?ft2 ?f2 ?wkt2 ?lbl2 # Reservoir
?gf3 ?ft3 ?f3 ?wkt3 ?lbl3 # River
?e2 ?ev2 # River FlowsInto Reservoir
?gf4 ?ft4 ?f4 ?wkt4 ?lbl4 # LeveeArea
FROM lpgv: 
WHERE {
  BIND(geo:Feature as ?gf1) .
  BIND(lpgvs:ChannelReach as ?ft1) .
  ?f1 a ?ft1 .
  ?f1 geo:hasGeometry ?g1 .
  ?g1 geo:asWKT ?wkt1 .
  ?f1 rdfs:label ?lbl1 .
  ?f1 lpgvs:FlowsThrough ?f2 .
  ?f1 lpgvs:ChannelHasLevee ?f4 .

  BIND(lpgvs:FlowsThrough as ?e1) .
  BIND(?f2 as ?ev1) .

  BIND(geo:Feature as ?gf2) .
  BIND(lpgvs:Reservoir as ?ft2) .
  ?f2 a ?ft2 .
  ?f2 geo:hasGeometry ?g2 .
  ?g2 geo:asWKT ?wkt2 .
  ?f2 rdfs:label ?lbl2 .
  ?f3 lpgvs:FlowsInto ?f2 .

  BIND(lpgvs:FlowsInto as ?e2) .
  BIND(?f2 as ?ev2) .

  BIND(geo:Feature as ?gf3) .
  BIND(lpgvs:River as ?ft3) .
  ?f3 a ?ft3 .
  ?f3 geo:hasGeometry ?g3 .
  ?g3 geo:asWKT ?wkt3 .
  ?f3 rdfs:label ?lbl3
  
  BIND(lpgvs:ChannelHasLevee as ?e3) .
  BIND(?f4 as ?ev3) .

  BIND(geo:Feature as ?gf4) .
  BIND(lpgvs:LeveeArea as ?ft4) .
  ?f4 a ?ft4 .
  ?f4 geo:hasGeometry ?g4 .
  ?g4 geo:asWKT ?wkt4 .
  ?f4 rdfs:label ?lbl4
}
LIMIT 100
`,
      wktVar: "COALESCE(?wkt5,?wkt4,?wkt3,?wkt2,?wkt1)",
      styles: defaultStyles
    },
    {
      title: "Flood risk structures and school zone shelters",
      sparql: prefixes + `
SELECT
?gf1 ?ft1 ?f1 ?wkt1 ?lbl1 # LeveedArea1
?e1 ?ev1 # ConnectedTo
?gf2 ?ft2 ?f2 ?wkt2 ?lbl2 # Structure
?e2 ?ev2 # ConnectedTo (Optional)
?gf3 ?ft3 ?f3 ?wkt3 ?lbl3 # SchoolZone (Optional)
FROM lpgv: 
WHERE {
  BIND(geo:Feature as ?gf1) .
  BIND(lpgvs:LeveedArea as ?ft1) .
  ?f1 a ?ft1 .
  ?f1 geo:hasGeometry ?g1 .
  ?g1 geo:asWKT ?wkt1 .
  ?f1 rdfs:label ?lbl1 .
  ?f1 lpgvs:HasFloodRisk ?f2 .
  
  BIND(lpgvs:HasFloodRisk as ?e1) .
  BIND(?f2 as ?ev1) .

  BIND(geo:Feature as ?gf2) .
  ?f2 a ?ft2 .
  ?f2 geo:hasGeometry ?g2 .
  ?g2 geo:asWKT ?wkt2 .
  ?f2 rdfs:label ?lbl2 .
  
  OPTIONAL {
    ?f2 lpgvs:HasSchoolZone ?f3 .
    
    BIND(lpgvs:HasSchoolZone as ?e2) .
    BIND(?f3 as ?ev2) .
    
    BIND(geo:Feature as ?gf3) .
    BIND(lpgvs:SchoolZone as ?ft3) .
    ?f3 a ?ft3 .
    ?f3 geo:hasGeometry ?g3 .
    ?g3 geo:asWKT ?wkt3 .
    ?f3 rdfs:label ?lbl3 .
  }
}
LIMIT 100`,
      wktVar: "COALESCE(?wkt5,?wkt4,?wkt3,?wkt2,?wkt1)",
      styles: defaultStyles
    },
    {
      title: "Flood risk hospitals",
      sparql: prefixes + `
SELECT
?gf1 ?ft1 ?f1 ?wkt1 ?lbl1 # LeveedArea1
?e1 ?ev1 # ConnectedTo
?gf2 ?ft2 ?f2 ?wkt2 ?lbl2 # Hospital
FROM lpgv: 
WHERE {
  BIND(geo:Feature as ?gf1) .
  BIND(lpgvs:LeveedArea as ?ft1) .
  ?f1 a ?ft1 .
  ?f1 geo:hasGeometry ?g1 .
  ?g1 geo:asWKT ?wkt1 .
  ?f1 rdfs:label ?lbl1 .
  ?f1 lpgvs:HasFloodRisk ?f2 .
  
  BIND(lpgvs:HasFloodRisk as ?e1) .
  BIND(?f2 as ?ev1) .

  BIND(geo:Feature as ?gf2) .
  BIND(lpgvs:Hospital as ?ft2) .
  ?f2 a ?ft2 .
  ?f2 geo:hasGeometry ?g2 .
  ?g2 geo:asWKT ?wkt2 .
  ?f2 rdfs:label ?lbl2 .
}
LIMIT 100`,
        wktVar: "COALESCE(?wkt5,?wkt4,?wkt3,?wkt2,?wkt1)",
        styles: defaultStyles
    },
    {
      title: "Specific Program Flood Risk (000510)",
      sparql: prefixes + `PREFIX lds: <http://dime.usace.mil/data/dataset#TERRAFRAME_CHANNEL_TO_PROJECT>
PREFIX ldsremis: <http://dime.usace.mil/data/dataset#REMIS_PROJECTS>

SELECT
?gf0 ?ft0 ?f0 ?wkt0 ?lbl0 # Program
?e0 ?ev0 # Project PartOf Program
?gf1 ?ft1 ?f1 ?wkt1 ?lbl1 # Project
?e1 ?ev1 # ConnectedTo
?gf2 ?ft2 ?f2 ?wkt2 ?lbl2 # LeveeArea
?e2 ?ev2 # HasFloodZone
?gf3 ?ft3 ?f3 ?wkt3 ?lbl3 # LeveedArea
?e3 ?ev3 # ConnectedTo
?gf4 ?ft4 ?f4 ?wkt4 ?lbl4 # Object of interest
FROM lpgv: 
FROM lds:
FROM ldsremis:
WHERE {
  ## Change this if you want to view a different program or comment out to see all programs ##
  ?f0 <http://www.w3.org/2004/02/skos/core#altLabel> "000510" .
  ##

  BIND(geo:Feature as ?gf1) .
  BIND(lpgvs:Project as ?ft1) .
  ?f1 a ?ft1 .
  ?f1 geo:hasGeometry ?g1 .
  ?g1 geo:asWKT ?wkt1 .
  ?f1 rdfs:label ?lbl1 .
  ?f1 lpgs:GeoObject-code ?f1code .
  ?f1 lpgvs:ConnectedTo ?f2 .

  ?imp <http://www.w3.org/2004/02/skos/core#altLabel> ?f1code .
  ?imp <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dime.usace.mil/ontologies/cwbi-concept#Remis_Project> .
  ?imp <http://dime.usace.mil/ontologies/cwbi-concept#Program> ?f0 .
  
  BIND(<http://dime.usace.mil/ontologies/cwbi-concept#Program> as ?e0) .
  BIND(?f1 as ?ev0) .

  BIND(geo:Feature as ?gf0) .
  ?f0 a <http://dime.usace.mil/ontologies/cwbi-concept#Program> .
  BIND(<http://dime.usace.mil/ontologies/cwbi-concept#Program> as ?ft0) .
  ?f0 <http://www.w3.org/2004/02/skos/core#altLabel> ?lbl0 .

  BIND(lpgvs:ConnectedTo as ?e1) .
  BIND(?f2 as ?ev1) .

  BIND(geo:Feature as ?gf2) .
  ?f2 a ?ft2 .
  ?f2 geo:hasGeometry ?g2 .
  ?g2 geo:asWKT ?wkt2 .
  ?f2 rdfs:label ?lbl2 .
  OPTIONAL {
    ?f2 lpgvs:HasFloodZone ?f3 .

    BIND(lpgvs:HasFloodZone as ?e2) .
    BIND(?f3 as ?ev2) .

    BIND(geo:Feature as ?gf3) .
    BIND(lpgvs:LeveedArea as ?ft3) .
    ?f3 a ?ft3 .
    ?f3 geo:hasGeometry ?g3 .
    ?g3 geo:asWKT ?wkt3 .
    ?f3 rdfs:label ?lbl3 .
    ?f3 lpgvs:HasFloodRisk ?f4 .

    BIND(lpgvs:HasFloodRisk as ?e3) .
    BIND(?f4 as ?ev3) .

    BIND(geo:Feature as ?gf4) .
    ?f4 a ?ft4 .
    ?f4 geo:hasGeometry ?g4 .
    ?g4 geo:asWKT ?wkt4 .
    ?f4 rdfs:label ?lbl4
  }
}
LIMIT 100`,
      wktVar: "COALESCE(?wkt5,?wkt4,?wkt3,?wkt2,?wkt1)",
      styles: defaultStyles,
      focus: "https://dev-georegistry.geoprism.net/lpg/deliverable2024/0#Project-30000693"
  },
  {
    title: "ALL Programs Flood Risk",
    sparql: prefixes + `PREFIX lds: <http://dime.usace.mil/data/dataset#TERRAFRAME_CHANNEL_TO_PROJECT>
PREFIX ldsremis: <http://dime.usace.mil/data/dataset#REMIS_PROJECTS>

SELECT
?gf0 ?ft0 ?f0 ?wkt0 ?lbl0 # Program
?e0 ?ev0 # Project PartOf Program
?gf1 ?ft1 ?f1 ?wkt1 ?lbl1 # Project
?e1 ?ev1 # ConnectedTo
?gf2 ?ft2 ?f2 ?wkt2 ?lbl2 # LeveeArea
?e2 ?ev2 # HasFloodZone
?gf3 ?ft3 ?f3 ?wkt3 ?lbl3 # LeveedArea
?e3 ?ev3 # ConnectedTo
?gf4 ?ft4 ?f4 ?wkt4 ?lbl4 # Object of interest
FROM lpgv: 
FROM lds:
FROM ldsremis:
WHERE {
BIND(geo:Feature as ?gf1) .
BIND(lpgvs:Project as ?ft1) .
?f1 a ?ft1 .
?f1 geo:hasGeometry ?g1 .
?g1 geo:asWKT ?wkt1 .
?f1 rdfs:label ?lbl1 .
?f1 lpgs:GeoObject-code ?f1code .
?f1 lpgvs:ConnectedTo ?f2 .

?imp <http://www.w3.org/2004/02/skos/core#altLabel> ?f1code .
?imp <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dime.usace.mil/ontologies/cwbi-concept#Remis_Project> .
?imp <http://dime.usace.mil/ontologies/cwbi-concept#Program> ?f0 .

BIND(<http://dime.usace.mil/ontologies/cwbi-concept#Program> as ?e0) .
BIND(?f1 as ?ev0) .

BIND(geo:Feature as ?gf0) .
?f0 a <http://dime.usace.mil/ontologies/cwbi-concept#Program> .
BIND(<http://dime.usace.mil/ontologies/cwbi-concept#Program> as ?ft0) .
?f0 <http://www.w3.org/2004/02/skos/core#altLabel> ?lbl0 .

BIND(lpgvs:ConnectedTo as ?e1) .
BIND(?f2 as ?ev1) .

BIND(geo:Feature as ?gf2) .
?f2 a ?ft2 .
?f2 geo:hasGeometry ?g2 .
?g2 geo:asWKT ?wkt2 .
?f2 rdfs:label ?lbl2 .
OPTIONAL {
  ?f2 lpgvs:HasFloodZone ?f3 .

  BIND(lpgvs:HasFloodZone as ?e2) .
  BIND(?f3 as ?ev2) .

  BIND(geo:Feature as ?gf3) .
  BIND(lpgvs:LeveedArea as ?ft3) .
  ?f3 a ?ft3 .
  ?f3 geo:hasGeometry ?g3 .
  ?g3 geo:asWKT ?wkt3 .
  ?f3 rdfs:label ?lbl3 .
  ?f3 lpgvs:HasFloodRisk ?f4 .

  BIND(lpgvs:HasFloodRisk as ?e3) .
  BIND(?f4 as ?ev3) .

  BIND(geo:Feature as ?gf4) .
  ?f4 a ?ft4 .
  ?f4 geo:hasGeometry ?g4 .
  ?g4 geo:asWKT ?wkt4 .
  ?f4 rdfs:label ?lbl4
}
}
LIMIT 100`,
    wktVar: "COALESCE(?wkt5,?wkt4,?wkt3,?wkt2,?wkt1)",
    styles: defaultStyles,
    focus: "https://dev-georegistry.geoprism.net/lpg/deliverable2024/0#Project-30000693"
}
];

export const locationCriteriaSparql = `
  # Limit to a geographic area
  BIND("<http://www.opengis.net/def/crs/EPSG/0/4326> {{centroid}}"^^<http://www.opengis.net/ont/geosparql#wktLiteral> AS ?p) .
  FILTER(spatialF:nearby({{wktVar}},?p,350,<http://www.opengis.net/def/uom/OGC/1.0/kilometre>))
`;

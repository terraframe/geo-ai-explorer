
def lambda_handler(event, context):
    agent = event['agent']
    actionGroup = event['actionGroup']
    function = event['function']
    parameters = event.get('parameters', [])

    schema = """
The query should follow the following guidance:
- Always generate the from clause using graph <https://localhost:4200/lpg/graph_801104/0#>.
```
// Incorrect
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX obj: <https://localhost:4200/lpg/rdfs#>
PREFIX custom: <https://localhost:4200/lpg/graph_801104/0/rdfs#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>

SELECT DISTINCT ?schoolZoneName
WHERE {
    ?leveeArea obj:GeoObject-code "LEV_A_229" .
    ?leveeArea custom:HasFloodZone ?leveedArea .
    ?leveedArea custom:HasFloodRisk ?school .
    ?schoolZone custom:HasSchoolZone ?school .
    ?schoolZone rdfs:label ?schoolZoneName .

// Correct
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX obj: <https://localhost:4200/lpg/rdfs#>
PREFIX custom: <https://localhost:4200/lpg/graph_801104/0/rdfs#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>

SELECT DISTINCT ?schoolZoneName
FROM <https://localhost:4200/lpg/graph_801104/0#>
WHERE {
    ?leveeArea obj:GeoObject-code "LEV_A_229" .
    ?leveeArea custom:HasFloodZone ?leveedArea .
    ?leveedArea custom:HasFloodRisk ?school .
    ?schoolZone custom:HasSchoolZone ?school .
    ?schoolZone rdfs:label ?schoolZoneName .
}```

- Self referencing should always generate an edge with *
```
// Incorrect
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX obj: <https://localhost:4200/lpg/rdfs#> 
PREFIX custom: <https://localhost:4200/lpg/graph_801104/0/rdfs#>  
PREFIX geo: <http://www.opengis.net/ont/geosparql#>

SELECT DISTINCT ?tractCode ?tractLabel
FROM <https://localhost:4200/lpg/graph_801104/0#>
WHERE {     
  ?parent rdf:type custom:ChannelReach ;
  obj:GeoObject-code "CEMVK_RR_03_ONE_27" .     
  ?parent custom:FlowsInto ?channel .     
  ?channel custom:ChannelHasLevee ?leveeArea .     
  ?leveeArea obj:GeoObject-code ?leveeAreaCode .     
} 

// Correct
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX obj: <https://localhost:4200/lpg/rdfs#> 
PREFIX custom: <https://localhost:4200/lpg/graph_801104/0/rdfs#>  
PREFIX geo: <http://www.opengis.net/ont/geosparql#>

SELECT DISTINCT ?tractCode ?tractLabel
FROM <https://localhost:4200/lpg/graph_801104/0#>
WHERE {     
  ?parent rdf:type custom:ChannelReach ;
  obj:GeoObject-code "CEMVK_RR_03_ONE_27" .     
  ?parent custom:FlowsInto* ?channel .     
  ?channel custom:ChannelHasLevee ?leveeArea .     
  ?leveeArea obj:GeoObject-code ?leveeAreaCode .     
}```
- Aggregation functions must always be wrapped in parenthesis with its variable name 
```
// Incorrect
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX obj: <https://localhost:4200/lpg/rdfs#>
PREFIX custom: <https://localhost:4200/lpg/graph_801104/0/rdfs#>

SELECT SUM(?population) as ?totalPopulation
FROM <https://localhost:4200/lpg/graph_801104/0#>
WHERE {
  ?censusTract obj:GeoObject-code "CEMVK_RR_03_ONE_27" .
  ?censusTract custom:CensusTract-population ?population .  
} 

// Correct
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX obj: <https://localhost:4200/lpg/rdfs#>
PREFIX custom: <https://localhost:4200/lpg/graph_801104/0/rdfs#>

SELECT (SUM(?population) as ?totalPopulation) 
FROM <https://localhost:4200/lpg/graph_801104/0#>
WHERE {
  ?censusTract obj:GeoObject-code "CEMVK_RR_03_ONE_27" .
  ?censusTract custom:CensusTract-population ?population .  
} ```

Note: Be as concise as possible.
Do not include any explanations or apologies in your responses.
Do not include any text except the SPARQL query generated.


Schema:
In the following, each IRI is followed by the local name and optionally its description in parentheses. 
The graph supports the following node types:

<https://localhost:4200/lpg/graph_801104/0/rdfs#Hospital> (Hospital), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#ChannelReach> (ChannelReach), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#School> (School), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#LeveeArea> (LeveeArea), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#LeveedArea> (LeveedArea), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#RealProperty> (RealProperty), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#SchoolZone> (SchoolZone), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#CensusTract> (CensusTract), 
<http://www.opengis.net/ont/geosparql#Geometry> (Geometry), 

The graph supports the following relationships:
<https://localhost:4200/lpg/rdfs#GeoObject-exists> (GeoObject-exists), 
<https://localhost:4200/lpg/rdfs#GeoObject-uid> (GeoObject-uid), 
<http://www.w3.org/2000/01/rdf-schema#label> (label), 
<http://www.w3.org/1999/02/22-rdf-syntax-ns#type> (type), 
<https://localhost:4200/lpg/rdfs#GeoObject-code> (GeoObject-code), 
<http://www.opengis.net/ont/geosparql#asWKT> (Geometry-asWKT),
<https://localhost:4200/lpg/graph_801104/0/rdfs#RealProperty-realPropertyType> (RealProperty-realPropertyType), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#RealProperty-realPropertyUse> (RealProperty-realPropertyUse), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#School-population> (School-population), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#CensusTract-population> (CensusTract-population), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#FlowsInto> (FlowsInto), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#ChannelHasLevee> (ChannelHasLevee), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#FlowsThrough> (FlowsThrough), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#HasFloodZone> (HasFloodZone), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#HasSchoolZone> (HasSchoolZone), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#TractAtRisk> (TractAtRisk), 
<https://localhost:4200/lpg/graph_801104/0/rdfs#HasFloodRisk> (HasFloodRisk), 
<http://www.opengis.net/ont/geosparql#hasGeometry> (HasGeometry), 

The data model between types is the following:
(ChannelReach)-[FlowsInto]->(ChannelReach),
(ChannelReach)-[ChannelHasLevee]->(LeveeArea),
(LeveeArea)-[HasFloodZone]->(LeveedArea),
(CensusTract)-[TractAtRisk]->(LeveedArea),
(LeveedArea)-[HasFloodRisk]->(School),
(SchoolZone)-[HasSchoolZone]->(School),
(ChannelReach)-[HasGeometry]->(Geometry),
(LeveeArea)-[HasGeometry]->(Geometry),
(CensusTract)-[HasGeometry]->(Geometry),
(LeveedArea)-[HasGeometry]->(Geometry),
(SchoolZone)-[HasGeometry]->(Geometry),
(School)-[HasGeometry]->(Geometry),

If the user asks about population use CensusTract-population. If the user asks about the number of students use School-population.    
    """

    # Execute your business logic here. For more information, refer to: https://docs.aws.amazon.com/bedrock/latest/userguide/agents-lambda.html
    responseBody =  {
        "TEXT": {
            "body": schema
        }
    }
    
    action_response = {
        'actionGroup': actionGroup,
        'function': function,
        'functionResponse': {
            'responseBody': responseBody
        }

    }

    dummy_function_response = {'response': action_response, 'messageVersion': event['messageVersion']}

    return dummy_function_response


def lambda_handler(event, context):
    agent = event['agent']
    actionGroup = event['actionGroup']
    function = event['function']
    parameters = event.get('parameters', [])

    schema = """
The database does NOT include any data in the default graph. When executing queries, you must always specify one or more graphs in the FROM clause, or you may specify a graph wildcard to query all graphs.


===
- Self referencing should always generate an edge with *
===
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
}


===
- Aggregation functions must always be wrapped in parenthesis with its variable name
===
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
}
===


Note: Be as concise as possible.
Do not include any explanations or apologies in your responses.
Do not include any text except the SPARQL query generated.


======
Schema
======


The full schema of the database is provided. For each section, a short description of the schema will be provided, followed by the data. This schema will be used to generate SPARQL queries used to serve end-user requests.


The ‘lpg’ schema often refers to ‘Geo-Object’, a concept coined by TerraFrame. A Geo-Object is a spatial concept, and can be thought of as a more formalized extension of a traditional GIS Feature. A GeoObjectType contains the metadata which defines the concrete GeoObject.


========
Prefixes
========


A full list of the prefixes used for the IRIs within this database.


@prefix apex: <http://dime.usace.mil/data/dataset#> .
@prefix cwbi: <http://dime.usace.mil/ontologies/cwbi-concept#> .
@prefix pm: <http://data.sec.usace.army.mil/ontologies/pm#> .
@prefix pmcommon: <http://data.sec.usace.army.mil/common/ont/pm#> .
@prefix sdsfie: <http://dime.usace.org/taxonomy/sdsfie/> .
@prefix lpgs: <https://localhost:4200/lpg/rdfs#>
@prefix lpg: <https://localhost:4200/lpg#>
@prefix lpgv: <https://localhost:4200/lpg/graph_801104/0#>
@prefix lpgvs: <https://localhost:4200/lpg/graph_801104/0/rdfs#>


Most of your queries will also need these prefixes:
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dct: <http://purl.org/dc/terms/> .



=====
Types
=====


A CSV list of (graph, type) pairs. This is the full list of rdf:type within the database.


lpgv,lpgvs:Hospital
lpgv,lpgvs:Dam
lpgv,lpgvs:Project
lpgv,lpgvs:Parcel
lpgv,lpgvs:Watershed
lpgv,lpgvs:LeveeArea
lpgv,lpgvs:RealProperty
lpgv,lpgvs:WaterTransportation
lpgv,lpgvs:ChannelArea
lpgv,lpgvs:WaterBody
lpgv,lpgvs:ChannelReach
lpgv,lpgvs:LandTransportation
lpgv,lpgvs:RecreationArea
lpgv,lpgvs:School
lpgv,lpgvs:State
lpgv,lpgvs:LeveedArea
lpgv,lpgvs:Waterway
lpgv,lpgvs:SchoolZone
lpgv,lpgvs:CensusTract
lpgv,lpgvs:WaterLock
lpgv,lpgvs:County
lpgv,lpgvs:UsaceRecreationArea
apex:APEX_prism,cwbi:Publiclaw
apex:WATER_SUPPLY_AGREEMENTS,cwbi:Publiclaw
apex:EXEC_CURRENT_MILESTONES,cwbi:Publiclaw
apex:PROMIS_MILESTONES,cwbi:Publiclaw
apex:FUNDED_AMSCO_BY_YEAR,cwbi:Publiclaw
apex:APEX_prism,pmcommon:BusinessLine
apex:CWIFD_ALL_FUNDED_WORKPACKAGES,pmcommon:BusinessLine
apex:APEX_prism,cwbi:District
apex:dam-to-program,cwbi:District
apex:USACE_FEM_Assets_Operating,cwbi:District
apex:USACE_FEM_Asset_Location_Sites,cwbi:District
apex:REMIS_PROJECTS,cwbi:District
apex:AMSCO_PROJ_WI,cwbi:District
apex:USACE-Organizations-data,cwbi:District
apex:APEX_prism,cwbi:Program
apex:USACE_CEFMS,cwbi:Program
apex:AMSCO_NAME_HISTORY,cwbi:Program
apex:high-med-low-csv-import,cwbi:Program
apex:CWBI_OPS_PROJECT_SITES,cwbi:Program
apex:CWIFD_ALL_FUNDED_WORKPACKAGES,cwbi:Program
apex:EXEC_CURRENT_MILESTONES,cwbi:Program
apex:FUNDED_AMSCO_BY_YEAR,cwbi:Program
apex:AMSCO_PROJ_WI,cwbi:Program
apex:dam-to-program,cwbi:Program
apex:USACE_FEM_Locations,cwbi:Program
apex:REMIS_PROJECTS,cwbi:Program
apex:FEM_OCA_COASTAL_PROJECTS,cwbi:Program
apex:DREDGE_INFO_SYSTEM,cwbi:Program
apex:TERRAFRAME_CHANNEL_TO_PROJECT,cwbi:Program
apex:levee-to-program,cwbi:Program
apex:APEX_prism,sdsfie:StateOrTerritory
apex:USACE_CEFMS,sdsfie:StateOrTerritory
apex:NIDS,sdsfie:StateOrTerritory
apex:REMIS_PROJECTS,sdsfie:StateOrTerritory
apex:USACE-datasets,cwbi:Dataset
apex:USACE_Workorders,cwbi:FEM_Asset
apex:USACE_FEM_Assets_Operating,cwbi:FEM_Asset
apex:USACE_FEM_Workorders,cwbi:FEM_Asset
apex:USACE_FEM_Asset_Location_Sites,cwbi:FEM_Asset
apex:USACE_FEM_Assets,cwbi:FEM_Asset
apex:FEM_COASTAL_STRUCTURES,cwbi:FEM_Asset
apex:USACE_Workorders,cwbi:Organization
apex:USACE-Organizations-data,cwbi:Organization
apex:USACE_FEM_Assets,cwbi:Organization
apex:USACE_FEM_Assets_Operating,cwbi:Organization
apex:USACE_FEM_Asset_Location_Sites,cwbi:Organization
apex:USACE_FEM_Workorders,cwbi:Organization
apex:USACE_FEM_Locations,cwbi:Organization
apex:USACE_Workorders,cwbi:PROMIS_Project
apex:AMSCO_PROJ_WI,cwbi:PROMIS_Project
apex:EXEC_CURRENT_MILESTONES,cwbi:PROMIS_Project
apex:USACE_FEM_Workorders,cwbi:PROMIS_Project
apex:PROMIS_MILESTONES,cwbi:PROMIS_Project
apex:CWIFD_ALL_FUNDED_WORKPACKAGES,cwbi:PROMIS_Project
apex:USACE_Workorders,cwbi:FEM_WorkOrder
apex:USACE_FEM_Workorders,cwbi:FEM_WorkOrder
apex:USACE_Workorders,cwbi:CEFMSWorkItem
apex:AMSCO_PROJ_WI,cwbi:CEFMSWorkItem
apex:USACE_FEM_Workorders,cwbi:CEFMSWorkItem
apex:USACE_CEFMS,pm:Appropriation
apex:AMSCO_NAME_HISTORY,pm:Appropriation
apex:FUNDED_AMSCO_BY_YEAR,pm:Appropriation
apex:CWIFD_ALL_FUNDED_WORKPACKAGES,pm:Appropriation
apex:USACE_CEFMS,cwbi:ContractAward
apex:high-med-low-csv-import,cwbi:ChannelReach
apex:TERRAFRAME_CHANNEL_TO_PROJECT,cwbi:ChannelReach
apex:CIVIL_WORKS_LAND,cwbi:Remis_Project
apex:REMIS_PROJECTS,cwbi:Remis_Project
apex:TERRAFRAME_CHANNEL_TO_PROJECT,cwbi:Remis_Project
apex:CIVIL_WORKS_LAND,cwbi:Remis_Installation
apex:REMIS_PROJECTS,cwbi:Remis_Installation
apex:CWBI_OPS_PROJECT_SITE_AREAS,cwbi:CWBI_ProjectSiteArea
apex:LOCK_PSA_LOOKUP,cwbi:CWBI_ProjectSiteArea
apex:CWBI_OPS_PROJECT_SITE_AREAS,cwbi:CWBI_ProjectSite
apex:CWBI_OPS_PROJECT_SITES,cwbi:CWBI_ProjectSite
apex:WATER_SUPPLY_AGREEMENTS,cwbi:CWBI_ProjectSite
apex:CWIFD_ALL_FUNDED_WORKPACKAGES,cwbi:CWIFD_WorkPackage
apex:CWIFD_ALL_FUNDED_WORKPACKAGES,cwbi:Dam
apex:dam-to-program,cwbi:Dam
apex:NIDS,cwbi:Dam
apex:LockToDam,cwbi:Dam
apex:CWIFD_ALL_FUNDED_WORKPACKAGES,cwbi:Fiscal_Year
apex:dam-to-program,cwbi:Division
apex:FEM_OCA_COASTAL_PROJECTS,cwbi:Division
apex:REMIS_PROJECTS,cwbi:Division
apex:DREDGE_INFO_SYSTEM,cwbi:Dredge
apex:EHYDRO_SURVEY_LOCATIONS,cwbi:Ehydro_Survey
apex:EHYDRO_SURVEY_LOCATIONS,cwbi:ChannelArea
apex:WATERWAY_TO_CHANNEL_AREA,cwbi:ChannelArea
apex:EXEC_CURRENT_MILESTONES,cwbi:PROMIS_Milestone_Task
apex:PROMIS_MILESTONES,cwbi:PROMIS_Milestone_Task
apex:EXEC_CURRENT_MILESTONES,cwbi:PROMIS_Milestone_Activity
apex:PROMIS_MILESTONES,cwbi:PROMIS_Milestone_Activity
apex:USACE_FEM_Assets,cwbi:FEM_Location
apex:USACE_FEM_Assets_Operating,cwbi:FEM_Location
apex:USACE_FEM_Locations,cwbi:FEM_Location
apex:USACE_FEM_Project_Management_Units,cwbi:FEM_Location
apex:USACE_FEM_Asset_Location_Sites,cwbi:FEM_Location
apex:USACE_FEM_Assets_Operating,cwbi:FEM_Site
apex:USACE_FEM_Asset_Location_Sites,cwbi:FEM_Site
apex:FEM_COASTAL_STRUCTURES,cwbi:FEM_Site
apex:FEM_OCA_COASTAL_PROJECTS,cwbi:FEM_Project
apex:FEM_COASTAL_STRUCTURES,cwbi:FEM_Project
apex:USACE_FEM_Project_Management_Units,cwbi:FEM_Project_Management_Unit
apex:FUNDED_AMSCO_BY_YEAR,cwbi:Uscode
apex:LOCK_PSA_LOOKUP,cwbi:River
apex:NIDS,cwbi:River
apex:LOCK_PSA_LOOKUP,cwbi:Lock
apex:LockToDam,cwbi:Lock
apex:levee-to-program,cwbi:Levee
apex:WATER_SUPPLY_AGREEMENTS,cwbi:WaterSupplyContract
apex:WATERWAY_TO_CHANNEL_AREA,cwbi:Waterway


=====
Edges
=====


A list of relationships between types. The relationship format is described as (SourceType)->[EdgeType]->(TargetType) and is directional from left to right. If a relationship is bi-directional it will be listed twice, one in each direction.


(pm:Appropriation)->[cwbi:Fiscal_Year]->(cwbi:Fiscal_Year)
(cwbi:CEFMSWorkItem)->[cwbi:AMSCO]->(cwbi:Program)
(cwbi:CEFMSWorkItem)->[cwbi:District]->(cwbi:District)
(cwbi:CEFMSWorkItem)->[cwbi:FEM_WorkOrder]->(cwbi:FEM_WorkOrder)
(cwbi:CEFMSWorkItem)->[cwbi:PROMIS_Project]->(cwbi:PROMIS_Project)
(cwbi:CWBI_ProjectSite)->[cwbi:Program]->(cwbi:Program)
(cwbi:CWBI_ProjectSiteArea)->[cwbi:CWBI_ProjectSite]->(cwbi:CWBI_ProjectSite)
(cwbi:CWIFD_WorkPackage)->[pmcommon:BusinessLine]->(pmcommon:BusinessLine)
(cwbi:CWIFD_WorkPackage)->[cwbi:Dam]->(cwbi:Dam)
(cwbi:CWIFD_WorkPackage)->[cwbi:PROMIS_Project]->(cwbi:PROMIS_Project)
(cwbi:ChannelReach)->[cwbi:Program]->(cwbi:Program)
(cwbi:ChannelReach)->[cwbi:Remis_Project]->(cwbi:Remis_Project)
(cwbi:ContractAward)->[pm:Appropriation]->(pm:Appropriation)
(cwbi:ContractAward)->[cwbi:Program]->(cwbi:Program)
(cwbi:Dam)->[cwbi:District]->(cwbi:District)
(cwbi:Dam)->[cwbi:Division]->(cwbi:Division)
(cwbi:Dam)->[cwbi:Program]->(cwbi:Program)
(cwbi:Dam)->[cwbi:River]->(cwbi:River)
(cwbi:Dam)->[sdsfie:StateOrTerritory]->(sdsfie:StateOrTerritory)
(cwbi:Dredge)->[cwbi:Program]->(cwbi:Program)
(cwbi:Ehydro_Survey)->[cwbi:ChannelArea]->(cwbi:ChannelArea)
(cwbi:FEM_Asset)->[cwbi:District]->(cwbi:District)
(cwbi:FEM_Asset)->[cwbi:FEM_Location]->(cwbi:FEM_Location)
(cwbi:FEM_Asset)->[cwbi:FEM_Site]->(cwbi:FEM_Site)
(cwbi:FEM_Asset)->[cwbi:Organization]->(cwbi:Organization)
(cwbi:FEM_Location)->[cwbi:Organization]->(cwbi:Organization)
(cwbi:FEM_Location)->[cwbi:Program]->(cwbi:Program)
(cwbi:FEM_Project)->[cwbi:Division]->(cwbi:Division)
(cwbi:FEM_Project)->[cwbi:Program]->(cwbi:Program)
(cwbi:FEM_Project_Management_Unit)->[cwbi:FEM_Location]->(cwbi:FEM_Location)
(cwbi:FEM_Site)->[cwbi:District]->(cwbi:District)
(cwbi:FEM_Site)->[cwbi:FEM_Asset]->(cwbi:FEM_Asset)
(cwbi:FEM_Site)->[cwbi:FEM_Location]->(cwbi:FEM_Location)
(cwbi:FEM_Site)->[cwbi:FEM_Project]->(cwbi:FEM_Project)
(cwbi:FEM_Site)->[cwbi:Organization]->(cwbi:Organization)
(cwbi:FEM_WorkOrder)->[cwbi:FEM_Asset]->(cwbi:FEM_Asset)
(cwbi:FEM_WorkOrder)->[cwbi:Organization]->(cwbi:Organization)
(cwbi:FEM_WorkOrder)->[cwbi:PROMIS_Project]->(cwbi:PROMIS_Project)
(cwbi:Fiscal_Year)->[cwbi:CWIFD_WorkPackage]->(cwbi:CWIFD_WorkPackage)
(cwbi:Levee)->[cwbi:Program]->(cwbi:Program)
(cwbi:Lock)->[cwbi:CWBI_ProjectSiteArea]->(cwbi:CWBI_ProjectSiteArea)
(cwbi:Lock)->[cwbi:Dam]->(cwbi:Dam)
(cwbi:Lock)->[cwbi:River]->(cwbi:River)
(cwbi:Organization)->[cwbi:District]->(cwbi:District)
(cwbi:PROMIS_Milestone_Task)->[cwbi:PROMIS_Milestone_Activity]->(cwbi:PROMIS_Milestone_Activity)
(cwbi:PROMIS_Milestone_Task)->[cwbi:PROMIS_Project]->(cwbi:PROMIS_Project)
(cwbi:PROMIS_Milestone_Task)->[cwbi:Publiclaw]->(cwbi:Publiclaw)
(cwbi:Program)->[pmcommon:BusinessLine]->(pmcommon:BusinessLine)
(cwbi:Program)->[pm:Appropriation]->(pm:Appropriation)
(cwbi:Program)->[cwbi:District]->(cwbi:District)
(cwbi:Program)->[cwbi:PROMIS_Project]->(cwbi:PROMIS_Project)
(cwbi:Program)->[cwbi:Publiclaw]->(cwbi:Publiclaw)
(cwbi:Program)->[cwbi:Uscode]->(cwbi:Uscode)
(cwbi:Program)->[sdsfie:StateOrTerritory]->(sdsfie:StateOrTerritory)
(cwbi:Remis_Project)->[cwbi:District]->(cwbi:District)
(cwbi:Remis_Project)->[cwbi:Division]->(cwbi:Division)
(cwbi:Remis_Project)->[cwbi:Program]->(cwbi:Program)
(cwbi:Remis_Project)->[cwbi:Remis_Installation]->(cwbi:Remis_Installation)
(cwbi:Remis_Project)->[sdsfie:StateOrTerritory]->(sdsfie:StateOrTerritory)
(cwbi:WaterSupplyContract)->[cwbi:CWBI_ProjectSite]->(cwbi:CWBI_ProjectSite)
(cwbi:WaterSupplyContract)->[cwbi:Publiclaw]->(cwbi:Publiclaw)
(cwbi:Waterway)->[cwbi:ChannelArea]->(cwbi:ChannelArea)
(lpgvs:CensusTract)->[lpgvs:TractAtRisk]->(lpgvs:LeveedArea)
(lpgvs:ChannelArea)->[lpgvs:FlowsThrough]->(lpgvs:CensusTract)
(lpgvs:ChannelReach)->[lpgvs:ChannelHasLevee]->(lpgvs:LeveeArea) 
(lpgvs:ChannelReach)->[lpgvs:FlowsThrough]->(lpgvs:CensusTract) 
(lpgvs:ChannelReach)->[lpgvs:FlowsInto]->(lpgvs:ChannelReach)
(lpgvs:LeveeArea)->[lpgvs:HasFloodZone]->(lpgvs:LeveedArea)
(lpgvs:LeveedArea)->[lpgvs:HasFloodRisk]->(lpgvs:Hospital)
(lpgvs:LeveedArea)->[lpgvs:HasFloodRisk]->(lpgvs:RealProperty)
(lpgvs:LeveedArea)->[lpgvs:HasFloodRisk]->(lpgvs:School)
(lpgvs:SchoolZone)->[lpgvs:HasSchoolZone]->(lpgvs:School)
(lpgvs:Watershed)->[lpgvs:WithinWatershed]->(lpgvs:RealProperty)
(lpgvs:Watershed)->[lpgvs:WithinWatershed]->(lpgvs:School)
(lpgvs:Watershed)->[lpgvs:WithinWatershed]->(lpgvs:Hospital)
(lpgvs:County)->[lpgvs:CENSUS_H]->(lpgvs:CensusTract)

The lpgvs:ConnectedTo can be used bi-directionally with any of the following types as a source or target:
lpgvs:RecreationArea, lpgvs:WaterBody, lpgvs:UsaceRecreationArea, lpgvs:Project, lpgvs:LandTransportation, lpgvs:ChannelArea, lpgvs:ChannelReach, lpgvs:Waterway, lpgvs:LeveeArea, lpgvs:WaterTransportation.

==========
Attributes
==========


There are many ‘data’ attributes which exist on these types for which various information can be fetched. These data attributes, for example, may define a display label, a code, or even a ‘population’ which might be required to service a particular user query.


rdfs:label - A string literal, defines the label of the GeoObject
lpgs:GeoObjectType-code - A string literal, defines the code of the GeoObject. Code is the uniqueness constraint for this dataset.
lpgs:GeoObjectType-uid - A generated, unique UUID for the object. Should not be shown to the end user as it does not contain much significance. Use code instead.


Geometries for this dataset are stored in accordance with the GeoSPARQL standard and are only available on the lpgv dataset.
?geoObject geo:hasGeometry ?geometry .
?geometry geo:asWKT ?wkt .


The ‘apex:’ datasets use the following attributes:


rdfs:label - A string literal, defines the label of the object
skos:altLabel - A string literal, often contains the code of the object (although not guaranteed)
dct:description - A string literal, sometimes contains a description of the object




# Code can either be GeoObject-code or altLabel, depending on which graph it comes from
OPTIONAL { ?s lpgs:GeoObject-code ?geoCode . }
OPTIONAL { ?s skos:altLabel ?altCode . }
BIND(COALESCE(?geoCode, ?altCode) AS ?code)




The following types contain domain specific attribution, where the type is listed first and an iri for the predicate which links to the literal is listed second, and then a description of the attribute is listed third.


lpgvs:RealProperty, lpgvs:RealProperty-realPropertyType, String literal. Specifies the type of the property
lpgvs:RealProperty, lpgvs:RealProperty-realPropertyUse, String literal. Specifies the usage of the property
lpgvs:School, lpgvs:School-population, Number. Population of the school.
lpgvs:CensusTract, lpgvs:CensusTract-population, Number. Population of the census tract.


============
Joining Data
============


lpgvs:Project can be joined against cwbi:Remis_Project or cwbi:Program by code. An example is as follows:


?proj a lpgvs:Project .
?proj lpgs:GeoObjectType-code "000510" .
?remisproj a cwbi:Remis_Project .
?remisproj skos:altLabel "000510" .
?program a cwbi:Program .
?program skos:altLabel "000510" .


These objects are all conceptually very similar objects. The lpgvs:Project is the object which contains the geometries and have “geometric” relationships with objects, whereas the cwbi objects contain more “domain specific” data.
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

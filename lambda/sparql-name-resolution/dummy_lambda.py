import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Updated SPARQL query using new FROM clauses
def execute(name: str) -> list:
    statement = f"""
    PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX ex: <https://localhost:4200/lpg/graph_801104/0/rdfs#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX text: <http://jena.apache.org/text#>
    PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>
    PREFIX lpgv: <https://localhost:4200/lpg/graph_801104/0#>
    PREFIX apex: <http://dime.usace.mil/data/dataset#>

    SELECT ?code ?type ?s
    FROM lpgv:
    FROM apex:APEX_prism
    WHERE {{
      BIND('{name}' AS ?search)

      {{
        (?s ?score) text:query (rdfs:label ?search) .
      }}
      UNION
      {{
        ?s lpgs:GeoObject-code ?search .
        BIND(1000000 AS ?score)
      }}
      UNION
      {{
        ?s skos:altLabel ?search .
        BIND(1000000 AS ?score)
      }}

      OPTIONAL {{ ?s lpgs:GeoObject-code ?geoCode . }}
      OPTIONAL {{ ?s skos:altLabel ?altCode . }}
      BIND(COALESCE(?geoCode, ?altCode) AS ?code)

      ?s a ?type .
    }}
    ORDER BY DESC(?score)
    LIMIT 100
    """

    response = requests.post(os.getenv('JENA_URL'), data={'query': statement})
    responseJson = response.json()

    results = []
    for r in responseJson.get('results', {}).get('bindings', []):
        if 'code' in r:
            results.append({
                'code': r['code']['value'],
                'type': r['type']['value'],
                'uri': r['s']['value']
            })

    return results

def lambda_handler(event, context):
    agent = event['agent']
    actionGroup = event['actionGroup']
    function = event['function']
    parameters = event.get('parameters', [])

    print("EVENT:", json.dumps(event))
    if not parameters or "value" not in parameters[0]:
        return {
            "error": "Missing required 'value' parameter.",
            "event": event
        }

    result = execute(parameters[0]["value"])

    responseBody = {
        "TEXT": {
            "body": json.dumps(result)
        }
    }

    action_response = {
        'actionGroup': actionGroup,
        'function': function,
        'functionResponse': {
            'responseBody': responseBody
        }
    }

    return {'response': action_response, 'messageVersion': event['messageVersion']}

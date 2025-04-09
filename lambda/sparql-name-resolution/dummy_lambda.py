import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Fulltext index query
def execute(name: str) -> str:
    
    statement = (
	    f"PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\n"
	    f"PREFIX ex: <https://localhost:4200/lpg/graph_801104/0/rdfs#>\n"
	    f"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
	    f"PREFIX text: <http://jena.apache.org/text#>\n"
	    f"PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>\n"
	    
	    f"SELECT ?code ?type ?s\n"
	    f"WHERE {{\n"
	    f"  GRAPH ?g {{\n"
	    f"    # We're looking for this\n"
	    f"    BIND('{name}' AS ?search)\n"
	    
	    f"    {{\n"
	    f"      # Full text search on the label field, which is used across all datasets\n"
	    f"      (?s ?score) text:query (rdfs:label ?search) .\n"
	    f"    }}\n"
	    f"    UNION\n"
	    f"    {{\n"
	    f"      # Allow them to also search for objects by code\n"
	    f"      ?s lpgs:GeoObject-code ?search .\n"
	    f"      BIND(1000000 AS ?score)\n"
	    f"    }}\n"
	    f"    UNION\n"
	    f"    {{\n"
	    f"      # LDS often puts code in the altLabel\n"
	    f"      ?s skos:altLabel ?search .\n"
	    f"      BIND(1000000 AS ?score)\n"
	    f"    }}\n"
	    
	    f"    # Code can either be GeoObject-code or altLabel, depending on which graph it comes from\n"
	    f"    OPTIONAL {{ ?s lpgs:GeoObject-code ?geoCode . }}\n"
	    f"    OPTIONAL {{ ?s skos:altLabel ?altCode . }}\n"
	    f"    BIND(COALESCE(?geoCode, ?altCode) AS ?code)\n"
	    
	    f"    ?s a ?type .\n"
	    f"  }}\n"
	    f"}}\n"
	    f"ORDER BY DESC(?score)\n"
	    f"LIMIT 100"
	)
    
    response = requests.post(os.getenv('JENA_URL'), data={'query': statement})
    
    responseJson = response.json()
    
    results = []
    
    for r in responseJson.get('results').get('bindings'):
        data = {}
        data['code'] = r.get('code').get('value')
        data['type'] = r.get('type').get('value')        
        data['uri'] = r.get('s').get('value')        
        results.append(data)

    return results    

def lambda_handler(event, context):
    agent = event['agent']
    actionGroup = event['actionGroup']
    function = event['function']
    parameters = event.get('parameters', [])

    # Execute your business logic here. For more information, refer to: https://docs.aws.amazon.com/bedrock/latest/userguide/agents-lambda.html
    
    result = execute(parameters[0]["value"])

    responseBody =  {
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

    dummy_function_response = {'response': action_response, 'messageVersion': event['messageVersion']}

    return dummy_function_response

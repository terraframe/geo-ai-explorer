import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Fulltext index query
def execute(name: str) -> str:
    
    statement = (
        f"PREFIX ex: <https://localhost:4200/lpg/graph_801104/0/rdfs#>\n"
        f"PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
        f"PREFIX text: <http://jena.apache.org/text#>\n"
        f"PREFIX lpgs: <https://localhost:4200/lpg/rdfs#>\n"
        
        f"SELECT ?code ?type ?s\n"
        f"FROM <https://localhost:4200/lpg/graph_801104/0#>\n"
        f"WHERE {{\n"
        f"  {{\n"
        f"    (?s ?score) text:query (rdfs:label '{name}') .\n"
        f"  }}\n"
        f"  UNION\n"
        f"  {{\n"
        f"    ?s lpgs:GeoObject-code '{name}' .\n"
        f"    BIND(1000000 AS ?score)\n"
        f"  }}\n"
        f"  ?s lpgs:GeoObject-code ?code .\n"
        f"  ?s a ?type .\n"
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

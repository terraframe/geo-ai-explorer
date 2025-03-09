import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Fulltext index query
def execute(statement: str) -> str:
    try:
        response = requests.post(os.getenv('JENA_URL'), data={'query': statement})
    
        json = response.json()
        results = ""

        print(json)
        keys = json.get('head').get('vars')
    
        for r in json.get('results').get('bindings'):
            results = results + (",".join([str(r.get(key, {}).get('value', '')) for key in keys]) + "\n")

        return results    
    except Exception as e:
        print('An exception was caused by the following statement: ' + statement)
        raise e

def lambda_handler(event, context):
    agent = event['agent']
    actionGroup = event['actionGroup']
    function = event['function']
    parameters = event.get('parameters', [])

    # Execute your business logic here. For more information, refer to: https://docs.aws.amazon.com/bedrock/latest/userguide/agents-lambda.html
    
    result = execute(parameters[0]["value"])

    responseBody =  {
        "TEXT": {
            "body": str(result)
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

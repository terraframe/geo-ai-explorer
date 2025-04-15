import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Fulltext index query
def execute(statement: str) -> str:
    MAX_ERROR_LENGTH = 1000

    try:
        response = requests.post(
            os.getenv('JENA_URL'),
            data={'query': statement},
            timeout=240
        )

        response.raise_for_status()

        try:
            json = response.json()
        except ValueError:
            return f"[ERROR] Received non-JSON response from Jena:\n{response.text[:MAX_ERROR_LENGTH]}"

        keys = json.get('head', {}).get('vars', [])
        results = ""
        for i, r in enumerate(json.get('results', {}).get('bindings', [])):
            if i < 100:
                results += ",".join([str(r.get(key, {}).get('value', '')) for key in keys]) + "\n"

        return results or "(No results)"

    except requests.exceptions.HTTPError as e:
        error_detail = response.text[:MAX_ERROR_LENGTH] if response is not None else "No response body"
        return f"[ERROR] HTTP error: {str(e)}\nDetails: {error_detail}"

    except requests.exceptions.RequestException as e:
        # Handle network-level issues like timeouts, DNS failures, etc.
        return f"[ERROR] Network error while contacting Jena: {str(e)}"

    except Exception as e:
        return f"[ERROR] An unexpected exception occurred: {str(e)}"



def lambda_handler(event, context):
    agent = event['agent']
    actionGroup = event['actionGroup']
    function = event['function']
    parameters = event.get('parameters', [])

    statement = parameters[0].get("value", "")
    result = execute(statement)

    responseBody = {
        "TEXT": {
            "body": result
        }
    }

    return {
        'response': {
            'actionGroup': actionGroup,
            'function': function,
            'functionResponse': {
                'responseBody': responseBody
            }
        },
        'messageVersion': event['messageVersion']
    }

import os
import requests

from botocore.auth import SigV4Auth
from botocore.awsrequest import AWSRequest
from botocore.session import Session


def is_truthy(value: str) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "y", "on"}


def execute(statement: str) -> str:
    MAX_ERROR_LENGTH = 1000

    sparql_url = os.getenv("SPARQL_URL")
    use_iam = is_truthy(os.getenv("USE_IAM", "false"))
    aws_region = os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION")

    if not sparql_url:
        return "[ERROR] SPARQL_URL is not set"

    if use_iam and not aws_region:
        return "[ERROR] USE_IAM is true but AWS_REGION is not set"

    try:
        data = {"query": statement}
        headers = {}

        if use_iam:
            session = Session()
            credentials = session.get_credentials()

            if credentials is None:
                return "[ERROR] USE_IAM is true but no AWS credentials were found"

            frozen_credentials = credentials.get_frozen_credentials()

            aws_request = AWSRequest(
                method="POST",
                url=sparql_url,
                data=data,
                headers={
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            )

            SigV4Auth(
                frozen_credentials,
                "neptune-db",
                aws_region
            ).add_auth(aws_request)

            headers = dict(aws_request.headers.items())

        response = requests.post(
            sparql_url,
            data=data,
            headers=headers,
            timeout=240
        )

        response.raise_for_status()

        try:
            json_response = response.json()
        except ValueError:
            return f"[ERROR] Received non-JSON response from SPARQL endpoint:\n{response.text[:MAX_ERROR_LENGTH]}"

        keys = json_response.get("head", {}).get("vars", [])
        rows = []

        for i, binding in enumerate(json_response.get("results", {}).get("bindings", [])):
            if i >= 100:
                break

            row = ",".join(
                str(binding.get(key, {}).get("value", ""))
                for key in keys
            )
            rows.append(row)

        return "\n".join(rows) if rows else "(No results)"

    except requests.exceptions.HTTPError as e:
        error_detail = response.text[:MAX_ERROR_LENGTH] if "response" in locals() and response is not None else "No response body"
        return f"[ERROR] HTTP error: {str(e)}\nDetails: {error_detail}"

    except requests.exceptions.RequestException as e:
        return f"[ERROR] Network error while contacting SPARQL endpoint: {str(e)}"

    except Exception as e:
        return f"[ERROR] An unexpected exception occurred: {str(e)}"


def lambda_handler(event, context):
    action_group = event["actionGroup"]
    function = event["function"]
    parameters = event.get("parameters", [])

    statement = parameters[0].get("value", "") if parameters else ""
    result = execute(statement)

    response_body = {
        "TEXT": {
            "body": result
        }
    }

    return {
        "response": {
            "actionGroup": action_group,
            "function": function,
            "functionResponse": {
                "responseBody": response_body
            }
        },
        "messageVersion": event["messageVersion"]
    }
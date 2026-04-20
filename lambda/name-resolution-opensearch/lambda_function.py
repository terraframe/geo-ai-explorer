import json
import os
from typing import Any, Dict, List, Optional

from opensearchpy import OpenSearch, RequestsHttpConnection
from boto3 import Session
from requests.auth import HTTPBasicAuth

try:
    # Native SigV4 auth support in opensearch-py
    from opensearchpy import AWSV4SignerAuth
except ImportError:
    AWSV4SignerAuth = None


def str_to_bool(value: Optional[str], default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in ("1", "true", "yes", "y", "on")


def build_client() -> OpenSearch:
    host = os.environ["OPENSEARCH_HOST"]  # example: search-my-domain.us-west-2.es.amazonaws.com
    region = os.environ.get("AWS_REGION", os.environ.get("OPENSEARCH_REGION", "us-west-2"))
    port = int(os.environ.get("OPENSEARCH_PORT", "443"))
    use_ssl = str_to_bool(os.environ.get("OPENSEARCH_USE_SSL", "true"), True)
    verify_certs = str_to_bool(os.environ.get("OPENSEARCH_VERIFY_CERTS", "true"), True)
    use_iam = str_to_bool(os.environ.get("OPENSEARCH_USE_IAM", "true"), True)

    http_auth = None

    if use_iam:
        if AWSV4SignerAuth is None:
            raise RuntimeError(
                "OPENSEARCH_USE_IAM=true but AWSV4SignerAuth is unavailable. "
                "Add opensearch-py with SigV4 support."
            )

        credentials = Session().get_credentials()
        frozen = credentials.get_frozen_credentials()
        http_auth = AWSV4SignerAuth(frozen, region, "es")
    else:
        username = os.environ.get("OPENSEARCH_USERNAME")
        password = os.environ.get("OPENSEARCH_PASSWORD")
        if username and password:
            http_auth = (username, password)

    return OpenSearch(
        hosts=[{"host": host, "port": port}],
        http_auth=http_auth,
        use_ssl=use_ssl,
        verify_certs=verify_certs,
        ssl_assert_hostname=verify_certs,
        ssl_show_warn=False,
        connection_class=RequestsHttpConnection,
        timeout=20,
        max_retries=3,
        retry_on_timeout=True,
    )


def build_query(name: str) -> Dict[str, Any]:
    """
    Tries to mimic your Jena behavior:

    1. Exact code match -> very high boost
    2. Exact altLabel match -> very high boost
    3. Exact label phrase match -> strong boost
    4. General full-text label match -> normal boost

    Assumes your index has keyword subfields:
      - code.keyword
      - altLabel.keyword
      - label.keyword

    If altLabel is multi-valued, that's fine in OpenSearch.
    """
    return {
        "size": 100,
        "_source": ["code", "type", "uri", "label", "altLabel"],
        "query": {
            "bool": {
                "should": [
                    {
                        "term": {
                            "code.keyword": {
                                "value": name,
                                "boost": 1000
                            }
                        }
                    },
                    {
                        "term": {
                            "altLabel.keyword": {
                                "value": name,
                                "boost": 1000
                            }
                        }
                    },
                    {
                        "term": {
                            "label.keyword": {
                                "value": name,
                                "boost": 200
                            }
                        }
                    },
                    {
                        "match_phrase": {
                            "label": {
                                "query": name,
                                "boost": 50
                            }
                        }
                    },
                    {
                        "match": {
                            "label": {
                                "query": name,
                                "operator": "and",
                                "boost": 10
                            }
                        }
                    }
                ],
                "minimum_should_match": 1
            }
        },
        "sort": [
            "_score"
        ]
    }


def execute(name: str) -> List[Dict[str, str]]:
    index_name = os.environ["OPENSEARCH_INDEX"]
    client = build_client()
    query = build_query(name)

    response = client.search(index=index_name, body=query)

    results: List[Dict[str, str]] = []
    hits = response.get("hits", {}).get("hits", [])

    for hit in hits:
        source = hit.get("_source", {})

        code = source.get("code")
        item_type = source.get("type")
        uri = source.get("uri")

        if code and item_type and uri:
            results.append({
                "code": str(code),
                "type": str(item_type),
                "uri": str(uri)
            })

    return results


def lambda_handler(event, context):
    agent = event["agent"]
    action_group = event["actionGroup"]
    function = event["function"]
    parameters = event.get("parameters", [])

    print("EVENT:", json.dumps(event))

    if not parameters or "value" not in parameters[0]:
        return {
            "error": "Missing required 'value' parameter.",
            "event": event
        }

    result = execute(parameters[0]["value"])

    response_body = {
        "TEXT": {
            "body": json.dumps(result)
        }
    }

    action_response = {
        "actionGroup": action_group,
        "function": function,
        "functionResponse": {
            "responseBody": response_body
        }
    }

    return {
        "response": action_response,
        "messageVersion": event["messageVersion"]
    }
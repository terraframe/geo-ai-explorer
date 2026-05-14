import json
import os
from typing import Any, Dict, List, Optional

from opensearchpy import OpenSearch, RequestsHttpConnection
from boto3 import Session

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

        if credentials is None:
            raise RuntimeError("Could not resolve AWS credentials for OpenSearch IAM auth.")

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


def normalize_query(value: Optional[str]) -> str:
    if value is None:
        return ""

    return value.strip()


def tokenize(value: Optional[str]) -> List[str]:
    normalized = normalize_query(value)

    if not normalized:
        return []

    return [part.strip() for part in normalized.split() if part.strip()]


def add_keyword_term(
    clauses: List[Dict[str, Any]],
    field: str,
    value: str,
    boost: float,
) -> None:
    if not value:
        return

    clauses.append({
        "term": {
            field: {
                "value": value,
                "boost": boost,
            }
        }
    })


def build_query(name: str) -> Dict[str, Any]:
    """
    Search strategy:

    1. Exact whole-query matches get huge boosts.
       Example:
         "reach_25" exactly matches code.keyword.

    2. Exact token matches get strong boosts.
       Example:
         "channel reach_25" can still exactly match token "reach_25"
         against code.keyword.

    3. Strong AND full-text match is kept as a boosted high-quality path.

    4. OR full-text fallback prevents one bad/noisy word from killing all results.

    Assumes your index has keyword subfields:
      - code.keyword
      - altLabel.keyword
      - label.keyword

    If altLabel is multi-valued, this is fine in OpenSearch.
    """

    normalized_name = normalize_query(name)
    tokens = tokenize(normalized_name)

    should_clauses: List[Dict[str, Any]] = []

    # -------------------------------------------------------------------------
    # Whole-query exact matches.
    # These are the strongest signals.
    # -------------------------------------------------------------------------
    add_keyword_term(should_clauses, "code.keyword", normalized_name, 1000)
    add_keyword_term(should_clauses, "altLabel.keyword", normalized_name, 1000)
    add_keyword_term(should_clauses, "label.keyword", normalized_name, 200)

    # -------------------------------------------------------------------------
    # Per-token exact matches.
    # This is the important rescue path for queries like:
    #
    #   channel reach_25
    #
    # Even if "channel" is noisy, "reach_25" can still hit code.keyword exactly.
    # -------------------------------------------------------------------------
    for token in tokens:
        add_keyword_term(should_clauses, "code.keyword", token, 700)
        add_keyword_term(should_clauses, "altLabel.keyword", token, 600)
        add_keyword_term(should_clauses, "label.keyword", token, 150)

    # -------------------------------------------------------------------------
    # Phrase-style label matches.
    # Good for normal human searches where the label contains the exact phrase.
    # -------------------------------------------------------------------------
    if normalized_name:
        should_clauses.append({
            "match_phrase": {
                "label": {
                    "query": normalized_name,
                    "boost": 50,
                }
            }
        })

        should_clauses.append({
            "match_phrase_prefix": {
                "label": {
                    "query": normalized_name,
                    "boost": 25,
                }
            }
        })

    # -------------------------------------------------------------------------
    # High-quality full-text path.
    # This keeps your old "all terms should match" behavior, but only as one
    # boosted option — not as the only way to get results.
    # -------------------------------------------------------------------------
    if normalized_name:
        should_clauses.append({
            "multi_match": {
                "query": normalized_name,
                "fields": [
                    "label^5",
                    "altLabel^4",
                    "code^3",
                    "type",
                ],
                "type": "best_fields",
                "operator": "and",
                "boost": 10,
            }
        })

    # -------------------------------------------------------------------------
    # Forgiving fallback full-text path.
    # This is what prevents:
    #
    #   reach_25          -> many results
    #   channel reach_25  -> zero results
    #
    # The OR fallback means at least one meaningful term can still hit.
    # -------------------------------------------------------------------------
    if normalized_name:
        should_clauses.append({
            "multi_match": {
                "query": normalized_name,
                "fields": [
                    "label^3",
                    "altLabel^3",
                    "code^2",
                    "type",
                ],
                "type": "best_fields",
                "operator": "or",
                "fuzziness": "AUTO",
                "minimum_should_match": "1",
                "boost": 1,
            }
        })

    # -------------------------------------------------------------------------
    # Per-token fuzzy-ish text matches.
    # Helpful when a token is not an exact code but is still useful text.
    # -------------------------------------------------------------------------
    for token in tokens:
        should_clauses.append({
            "multi_match": {
                "query": token,
                "fields": [
                    "label^3",
                    "altLabel^3",
                    "code^2",
                    "type",
                ],
                "type": "best_fields",
                "operator": "or",
                "fuzziness": "AUTO",
                "boost": 2,
            }
        })

    return {
        "size": 100,
        "_source": ["code", "type", "uri", "label", "altLabel"],
        "query": {
            "bool": {
                "should": should_clauses,
                "minimum_should_match": 1,
            }
        },
        "sort": ["_score"],
    }


def execute(name: str) -> List[Dict[str, str]]:
    index_name = os.environ["OPENSEARCH_INDEX"]
    client = build_client()
    query = build_query(name)

    print("OPENSEARCH QUERY:", json.dumps(query))

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
                "uri": str(uri),
            })

    return results


def lambda_handler(event, context):
    print("EVENT:", json.dumps(event))

    agent = event["agent"]
    action_group = event["actionGroup"]
    function = event["function"]
    parameters = event.get("parameters", [])

    if not parameters or "value" not in parameters[0]:
        return {
            "error": "Missing required 'value' parameter.",
            "event": event,
        }

    value = parameters[0]["value"]
    result = execute(value)

    response_body = {
        "TEXT": {
            "body": json.dumps(result),
        }
    }

    action_response = {
        "actionGroup": action_group,
        "function": function,
        "functionResponse": {
            "responseBody": response_body,
        },
    }

    return {
        "response": action_response,
        "messageVersion": event["messageVersion"],
    }
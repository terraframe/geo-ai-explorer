# Lambda OpenSearch Search

This Lambda searches an AWS OpenSearch index and returns results in the Bedrock action-group response format.

## Deploy

Files:

```text
main.py
requirements.txt
```

`requirements.txt`:

```txt
opensearch-py==2.8.0
requests==2.32.3
boto3==1.34.162
```

Build zip:

```bash
mkdir package
pip install -r requirements.txt -t package
cp lambda_function.py package/
cd package
zip -r ../lambda.zip .
```

In AWS Lambda:

- Create a Python Lambda
- Upload `lambda.zip`

## Configure

Environment variables:

```env
OPENSEARCH_HOST=search-your-domain.us-west-2.es.amazonaws.com
OPENSEARCH_INDEX=geo_objects
OPENSEARCH_PORT=443
OPENSEARCH_USE_IAM=true
OPENSEARCH_REGION=us-west-2
OPENSEARCH_USE_SSL=true
OPENSEARCH_VERIFY_CERTS=true
```

If not using IAM:

```env
OPENSEARCH_USE_IAM=false
OPENSEARCH_USERNAME=your-user
OPENSEARCH_PASSWORD=your-password
```

## IAM

If `OPENSEARCH_USE_IAM=true`, the Lambda execution role needs OpenSearch HTTP permissions, for example:

```json
{
  "Effect": "Allow",
  "Action": [
    "es:ESHttpGet",
    "es:ESHttpPost",
    "es:ESHttpPut"
  ],
  "Resource": "arn:aws:es:us-west-2:123456789012:domain/your-domain/*"
}
```

Your OpenSearch domain access policy must also allow that role.

## Expected document shape

```json
{
  "uri": "https://example.com/resource/123",
  "type": "https://example.com/ontology/GeoObject",
  "code": "ABCD",
  "label": "Sample Place",
  "altLabel": ["Sample Alt Name", "SP"]
}
```

## Test event

```json
{
  "agent": "example-agent",
  "actionGroup": "search",
  "function": "lookupLocation",
  "parameters": [
    {
      "name": "value",
      "value": "Omaha"
    }
  ],
  "messageVersion": "1.0"
}
```

## Common failures

- `403`: bad IAM/domain policy/auth mismatch
- timeout: Lambda cannot reach OpenSearch
- missing `.keyword` fields: index mapping does not match query
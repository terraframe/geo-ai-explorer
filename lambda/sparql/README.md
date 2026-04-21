# Lambda SPARQL Proxy

A small AWS Lambda function that accepts a SPARQL query from an incoming event, executes it against a configured SPARQL endpoint, and returns the results as plain text.

## How it works

The Lambda reads these environment variables:

- `SPARQL_URL` — full URL of the SPARQL endpoint. Required. No default. Should include port and protocol.
- `USE_IAM` — whether to sign requests with AWS SigV4. Optional. Defaults to `false`.
- `AWS_REGION` — AWS region for SigV4 signing. Required when `USE_IAM=true` unless `AWS_DEFAULT_REGION` is already set.
- `AWS_DEFAULT_REGION` — optional fallback region used when `AWS_REGION` is not set.

At runtime:

1. The handler reads the incoming query from `event.parameters[0].value`
2. It sends the query to `SPARQL_URL` as an HTTP `POST`
3. If `USE_IAM=true`, it signs the request with AWS SigV4 using the Lambda execution role credentials
4. It parses the SPARQL JSON response
5. It returns up to 100 result rows as comma-separated text

This is useful for:
- Neptune SPARQL endpoints with IAM auth enabled
- Standard SPARQL endpoints without IAM auth

## Files

- `lambda_function.py` — Lambda source
- `build.sh` — creates the deployment zip

## Deployment

### 1. Build the zip

```bash
./build.sh

### 2. Set lambda handler to 'lambda_function.lambda_handler'


### 3. Set timeout to 5 minutes


# Graph Rules Lambda

This Lambda function is used by a Bedrock Agent action group to return a static graph/schema rules document.

The function is intentionally simple. It does not connect to Bedrock, S3, DynamoDB, Neptune, Secrets Manager, Parameter Store, or any other remote service. It does not require environment variables or a `.env` file.

## Files

- `lambda_function.py` - Lambda handler source code
- `package.sh` - Builds the Lambda deployment zip
- `function.zip` - Generated deployment artifact

## Runtime

Use a standard Python Lambda runtime.

Recommended:

    Python 3.12 (or latest)

## Build

Run:

    chmod +x build.sh
    ./build.sh

The build script creates:

    function.zip

The zip contains only:

    lambda_function.py

## package.sh

The packaging script removes any existing `function.zip` and creates a new zip containing the Lambda source file.

Expected script:

    #!/usr/bin/env bash
    set -euo pipefail

    OUTPUT="function.zip"
    LAMBDA_FILE="lambda_function.py"

    if [ ! -f "$LAMBDA_FILE" ]; then
      echo "Error: $LAMBDA_FILE not found"
      exit 1
    fi

    rm -f "$OUTPUT"

    zip "$OUTPUT" "$LAMBDA_FILE"

    echo "Created $OUTPUT"

## Deploy

Upload `function.zip` to AWS Lambda.

Example:

    aws lambda update-function-code \
      --function-name YOUR_FUNCTION_NAME \
      --zip-file fileb://function.zip

## Configuration

No Lambda environment variables are required.

No secrets are required.

No `.env` file is required.

No dependency installation step is required.

## Dependencies

This Lambda currently has no third-party Python dependencies.

Do not run:

    pip install --target ./package

unless third-party imports are added later.

## Notes

The handler expects the standard Bedrock Agent Lambda event shape, including:

- `actionGroup`
- `function`
- `messageVersion`

The Lambda returns a Bedrock Agent-compatible function response containing static text.
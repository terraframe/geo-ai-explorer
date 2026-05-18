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
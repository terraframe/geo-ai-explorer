#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${ROOT_DIR}/package"
ZIP_FILE="${ROOT_DIR}/function.zip"

rm -rf "${BUILD_DIR}" "${ZIP_FILE}"
mkdir -p "${BUILD_DIR}"

python3 -m pip install -r "${ROOT_DIR}/requirements.txt" -t "${BUILD_DIR}"
cp "${ROOT_DIR}/lambda_function.py" "${BUILD_DIR}/"

cd "${BUILD_DIR}"
zip -r "${ZIP_FILE}" .
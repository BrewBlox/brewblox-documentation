#!/usr/bin/env bash
set -euo pipefail
pushd "$(dirname "$0")" > /dev/null

# Args: relative directory of brewblox-ui repo
DIR=${1:-"../brewblox-ui"}

echo "Using $(pwd)/${DIR}"

rm -rf ./shared-types/*
cp -rf "${DIR}/src/shared-types"/* ./shared-types/

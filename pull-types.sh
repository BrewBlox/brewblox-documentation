#!/usr/bin/env bash
set -e

# Args: relative directory of brewblox-ui repo
DIR=${1:-"../brewblox-ui"}

# Push script dir
pushd "$(dirname "$0")" > /dev/null

echo "Using $(pwd)/${DIR}"

rm -rf ./shared-types/*
cp -rf "${DIR}/src/shared-types"/* ./shared-types/

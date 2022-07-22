#!/usr/bin/env bash
set -euo pipefail
pushd "$(dirname "$0")" >/dev/null

# Args: relative directory of brewblox-ui repo
DIR=${1:-"../brewblox-ui"}
SRC="$(readlink -f "$PWD/$DIR")"

echo "Using $SRC"

rm -rf ./shared-types/*
cp -rf "$SRC/src/shared-types"/* ./shared-types/

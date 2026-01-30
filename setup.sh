#!/bin/bash

# PocketBase Version
PB_VERSION="0.36.1"

# Detect OS and Architecture
OS="linux"
ARCH="amd64"

if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="darwin"
    if [[ $(uname -m) == "arm64" ]]; then
        ARCH="arm64"
    else
        ARCH="amd64"
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
    ARCH="amd64"
fi

# Construct download URL
FILENAME="pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"
URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/${FILENAME}"

echo "🚀 Downloading PocketBase v${PB_VERSION} for ${OS}/${ARCH}..."

# Download and Extract
curl -L -o pb.zip "$URL"
unzip -o pb.zip pocketbase
rm pb.zip

if [[ "$OS" != "windows" ]]; then
    chmod +x pocketbase
fi

echo "✅ PocketBase has been installed as ./pocketbase"

#!/bin/bash

# Get the file path from argument
file_path="./svelte.config.js"

# Check if the file exists
if [ ! -f "$file_path" ]; then
    echo "File not found: $file_path"
    exit 1
fi

# Replace 'adapter-node' with 'adapter-cloudflare' in the file
sed -i 's/adapter-node/adapter-cloudflare/g' "$file_path"

echo "Replacement completed in $file_path"

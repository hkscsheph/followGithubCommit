#!/bin/bash

# Clone all student repos into portfolio folders
echo "Cloning student repositories..."

# Read .gitmodules and clone each submodule
while IFS= read -r line; do
  if [[ $line == \[submodule* ]]; then
    # Extract path and url from next lines
    read -r path_line
    read -r url_line
    
    path=$(echo "$path_line" | sed 's/.*path = //')
    url=$(echo "$url_line" | sed 's/.*url = //')
    
    echo "Cloning $url to $path"
    git clone "$url" "$path" 2>/dev/null || true
  fi
done < .gitmodules

echo "Build complete!"

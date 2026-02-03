#!/bin/bash

# Initialize and update all submodules
echo "Initializing submodules..."
git submodule update --init --recursive --depth 3

echo "Build complete!"

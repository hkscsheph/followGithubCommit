#!/bin/bash

# Initialize and update all submodules
echo "Initializing submodules..."
git submodule update --init --recursive --depth 3

# Generate static portfolio data
echo "Generating portfolio data..."
node scripts/generate-portfolio-data.js

echo "Build complete!"

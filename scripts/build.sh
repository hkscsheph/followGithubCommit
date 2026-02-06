#!/bin/bash

# Initialize and update all submodules
echo "Initializing submodules..."
git submodule update --init --recursive --depth 3 || true

# Clean any uncommitted changes in submodules
echo "Cleaning submodule working directories..."
git submodule foreach --recursive 'git clean -fd && git reset --hard' || true

# Generate static portfolio data
echo "Generating portfolio data..."
node scripts/generate-portfolio-data.js

echo "Build complete!"

const fs = require('fs');
const path = require('path');

function isDirectoryEmpty(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.length === 0;
  } catch {
    return false;
  }
}

function removeEmptyDirs(dirPath) {
  let removed = 0;

  function traverse(currentPath) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          traverse(fullPath);

          // Check if directory is now empty after recursive cleanup
          if (isDirectoryEmpty(fullPath)) {
            fs.rmdirSync(fullPath);
            console.log(`Removed: ${fullPath}`);
            removed++;
          }
        }
      }
    } catch (err) {
      console.error(`Error processing ${currentPath}: ${err.message}`);
    }
  }

  traverse(dirPath);
  return removed;
}

const portfolioPath = path.join(__dirname, '..', 'portfolio');
console.log('Cleaning empty portfolio folders...\n');

const count = removeEmptyDirs(portfolioPath);
console.log(`\nRemoved ${count} empty directories`);

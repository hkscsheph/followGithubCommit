const fs = require('fs');
const path = require('path');

// Read add-submodules.sh to get valid submodules
function getValidSubmodules() {
  try {
    const content = fs.readFileSync(path.join(__dirname, '../add-submodules.sh'), 'utf8');
    const lines = content.split('\n').filter(line => line.includes('git submodule add'));
    
    const valid = new Set();
    lines.forEach(line => {
      // Extract path from: git submodule add <url> <path>
      const match = line.match(/git submodule add .+ (portfolio\/.+)$/);
      if (match) {
        valid.add(match[1]);
      }
    });
    
    return valid;
  } catch (err) {
    console.error('Could not read add-submodules.sh:', err.message);
    process.exit(1);
  }
}

// Parse .gitmodules and filter
function cleanGitmodules() {
  const gitmodulesPath = path.join(__dirname, '../.gitmodules');
  const validPaths = getValidSubmodules();
  
  try {
    const content = fs.readFileSync(gitmodulesPath, 'utf8');
    const lines = content.split('\n');
    
    const result = [];
    let currentModule = null;
    let skipModule = false;
    
    for (const line of lines) {
      if (line.startsWith('[submodule')) {
        // Extract path from [submodule "path"]
        const match = line.match(/\[submodule "(.+)"\]/);
        if (match) {
          currentModule = match[1];
          skipModule = !validPaths.has(currentModule);
        }
      }
      
      if (!skipModule) {
        result.push(line);
      }
    }
    
    // Clean up extra blank lines
    const cleaned = result.join('\n').replace(/\n\n\n+/g, '\n\n').trim() + '\n';
    
    fs.writeFileSync(gitmodulesPath, cleaned);
    
    const removed = content.split('[submodule').length - cleaned.split('[submodule').length;
    console.log(`✓ Cleaned .gitmodules`);
    console.log(`  Kept: ${validPaths.size} submodules`);
    console.log(`  Removed: ${removed} submodules`);
  } catch (err) {
    console.error('Error cleaning .gitmodules:', err.message);
    process.exit(1);
  }
}

cleanGitmodules();

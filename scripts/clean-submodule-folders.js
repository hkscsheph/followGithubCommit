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

// Remove folders not in valid list
function cleanSubmoduleFolders() {
  const portfolioPath = path.join(__dirname, '../portfolio');
  const validPaths = getValidSubmodules();
  let removed = 0;

  // Get all repo folders at portfolio/user/repo level
  function getRepoFolders(basePath) {
    const repos = [];
    try {
      const users = fs.readdirSync(basePath, { withFileTypes: true });
      for (const user of users) {
        if (!user.isDirectory()) continue;
        const userPath = path.join(basePath, user.name);
        const repoEntries = fs.readdirSync(userPath, { withFileTypes: true });
        for (const repo of repoEntries) {
          if (repo.isDirectory()) {
            repos.push({
              path: path.join(userPath, repo.name),
              relPath: `portfolio/${user.name}/${repo.name}`
            });
          }
        }
      }
    } catch (err) {
      console.error(`Error scanning repos: ${err.message}`);
    }
    return repos;
  }

  const repos = getRepoFolders(portfolioPath);
  for (const repo of repos) {
    if (!validPaths.has(repo.relPath)) {
      fs.rmSync(repo.path, { recursive: true, force: true });
      console.log(`Removed: ${repo.relPath}`);
      removed++;
    }
  }

  console.log(`\n✓ Removed ${removed} submodule folders`);
}

cleanSubmoduleFolders();

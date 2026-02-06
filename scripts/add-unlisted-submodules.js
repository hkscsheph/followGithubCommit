const fs = require('fs');
const path = require('path');

function getListedSubmodules() {
  try {
    const content = fs.readFileSync(path.join(__dirname, '../.gitmodules'), 'utf8');
    const matches = content.match(/\[submodule "(.+?)"\]/g) || [];
    return new Set(matches.map(m => m.match(/"(.+?)"/)[1]));
  } catch (err) {
    return new Set();
  }
}

function findUnlistedFolders() {
  const portfolioPath = path.join(__dirname, '../portfolio');
  const listedSubmodules = getListedSubmodules();
  const unlisted = [];

  try {
    const users = fs.readdirSync(portfolioPath, { withFileTypes: true });
    
    for (const user of users) {
      if (!user.isDirectory()) continue;
      
      const userPath = path.join(portfolioPath, user.name);
      const repos = fs.readdirSync(userPath, { withFileTypes: true });
      
      for (const repo of repos) {
        if (!repo.isDirectory()) continue;
        
        const submodulePath = `portfolio/${user.name}/${repo.name}`;
        if (!listedSubmodules.has(submodulePath)) {
          unlisted.push({
            path: submodulePath,
            url: `https://github.com/${user.name}/${repo.name}.git`
          });
        }
      }
    }
  } catch (err) {
    console.error('Error scanning portfolio:', err.message);
    process.exit(1);
  }

  return unlisted;
}

function addToGitmodules(submodules) {
  if (submodules.length === 0) {
    console.log('✓ No unlisted folders found');
    return;
  }

  const gitmodulesPath = path.join(__dirname, '../.gitmodules');
  let content = '';
  
  try {
    content = fs.readFileSync(gitmodulesPath, 'utf8');
  } catch (err) {
    // File doesn't exist, create it
    content = '';
  }

  // Add new submodules
  for (const submodule of submodules) {
    const entry = `[submodule "${submodule.path}"]
\tpath = ${submodule.path}
\turl = ${submodule.url}
`;
    content += (content ? '\n' : '') + entry;
  }

  fs.writeFileSync(gitmodulesPath, content);
  console.log(`✓ Added ${submodules.length} unlisted submodules to .gitmodules`);
  
  submodules.forEach(sub => {
    console.log(`  - ${sub.path}`);
  });
}

const unlisted = findUnlistedFolders();
addToGitmodules(unlisted);

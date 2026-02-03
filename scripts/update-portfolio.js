// Script to download latest content from student GitHub repos
require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const githubToken = process.env.GITHUB_TOKEN;

// Load blacklist from blacklist.json
function getBlacklist() {
  try {
    const content = fs.readFileSync(path.join(__dirname, '../blacklist.json'), 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.warn('Could not read blacklist.json, using empty blacklist');
    return { students: [], repos: [] };
  }
}

// Repos list from repos-list.json
function getReposList() {
  try {
    const content = fs.readFileSync(path.join(__dirname, '../repos-list.json'), 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Could not read repos-list.json. Run gather-repos.js first.');
    process.exit(1);
  }
}

// Download file from GitHub
function downloadFile(owner, repo, filePath, localPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/contents/${filePath}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Accept': 'application/vnd.github.v3.raw',
        ...(githubToken && { 'Authorization': `token ${githubToken}` })
      }
    };

    https.request(options, (res) => {
      if (res.statusCode === 404) {
        resolve(false);
        return;
      }
      
      if (res.statusCode !== 200) {
        reject(new Error(`Status ${res.statusCode}`));
        return;
      }

      const dir = path.dirname(localPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const file = fs.createWriteStream(localPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', reject).end();
  });
}

// Get repo tree from GitHub
function getRepoTree(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        ...(githubToken && { 'Authorization': `token ${githubToken}` })
      }
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.tree || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject).end();
  });
}

// Check if project is React
function isReactProject(localPath) {
  const packageJsonPath = path.join(localPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return false;
  
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf8');
    const pkg = JSON.parse(content);
    return pkg.dependencies && (pkg.dependencies.react || pkg.devDependencies?.react);
  } catch {
    return false;
  }
}

// Build React project
function buildReactProject(localPath) {
  try {
    console.log(`  Building React project...`);
    execSync('npm install', { cwd: localPath, stdio: 'pipe' });
    execSync('npm run build', { cwd: localPath, stdio: 'pipe' });
    
    // Move build output to root if it exists
    const buildPath = path.join(localPath, 'build');
    const distPath = path.join(localPath, 'dist');
    
    if (fs.existsSync(buildPath)) {
      // Copy build contents to root
      const files = fs.readdirSync(buildPath);
      files.forEach(file => {
        const src = path.join(buildPath, file);
        const dest = path.join(localPath, file);
        if (fs.lstatSync(src).isDirectory()) {
          if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
          fs.cpSync(src, dest, { recursive: true });
        } else {
          fs.copyFileSync(src, dest);
        }
      });
      fs.rmSync(buildPath, { recursive: true });
    } else if (fs.existsSync(distPath)) {
      // Copy dist contents to root
      const files = fs.readdirSync(distPath);
      files.forEach(file => {
        const src = path.join(distPath, file);
        const dest = path.join(localPath, file);
        if (fs.lstatSync(src).isDirectory()) {
          if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
          fs.cpSync(src, dest, { recursive: true });
        } else {
          fs.copyFileSync(src, dest);
        }
      });
      fs.rmSync(distPath, { recursive: true });
    }
    
    console.log(`  ✓ Build successful`);
    return true;
  } catch (err) {
    console.log(`  ✗ Build failed: ${err.message}`);
    return false;
  }
}

async function updatePortfolio() {
  const reposList = getReposList();
  const BLACKLIST = getBlacklist();
  console.log(`Found ${reposList.length} students\n`);

  for (const student of reposList) {
    const { user, repos } = student;
    
    // Skip blacklisted students
    if (BLACKLIST.students.includes(user)) {
      console.log(`Skipping ${user} (blacklisted)\n`);
      continue;
    }
    
    for (const repo of repos) {
      // Skip blacklisted repos
      if (BLACKLIST.repos.includes(repo.name)) {
        console.log(`  Skipping ${repo.name} (blacklisted)`);
        continue;
      }

      try {
        const [owner, repoName] = repo.url.replace('https://github.com/', '').replace('.git', '').split('/');
        const localPath = path.join('portfolio', user, repo.name);

        console.log(`Updating ${owner}/${repoName}...`);

        // Get repo tree
        const tree = await getRepoTree(owner, repoName);
        
        // Filter important files (HTML, CSS, JS, JSON, images)
        const importantFiles = tree.filter(item => {
          if (item.type === 'tree') return false;
          const ext = path.extname(item.path).toLowerCase();
          return ['.html', '.css', '.js', '.json', '.md', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.jsx', '.tsx', '.ts'].includes(ext);
        });

        console.log(`  Found ${importantFiles.length} files`);

        // Download each file
        let downloaded = 0;
        for (const file of importantFiles) {
          const filePath = path.join(localPath, file.path);
          try {
            const success = await downloadFile(owner, repoName, file.path, filePath);
            if (success) {
              downloaded++;
            }
          } catch (err) {
            // Silently skip failed downloads
          }
        }

        console.log(`  ✓ Downloaded ${downloaded} files`);

        // Check if React project and build
        if (isReactProject(localPath)) {
          buildReactProject(localPath);
        }

        console.log();
      } catch (err) {
        console.log(`✗ Error updating ${repo.name}: ${err.message}\n`);
      }
    }
  }

  console.log('Portfolio update complete!');
}

updatePortfolio().catch(console.error);

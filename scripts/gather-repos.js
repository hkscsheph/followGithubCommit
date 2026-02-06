// Script to gather all repos from students' GitHub profiles
require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

const targetUsers = [
  '2223179',
  '2223107-cami',
  'Koodybiglookyea',
  'haha197',
  'kory520',
  'kou1gn',
  'BARON1118',
  'v1ann',
  'EmilyLau41',
  'giovanniuufj',
  '2526452-cmd',
  '2526453',
  '2526454-ship-it',
  'hayden626',
  'ethanhksc0930',
  '2526465-lgtm',
  '2223176-tech',
  '2526470-collab',
  'crazyjayhm'
];

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

function fetchUserRepos(username) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${username}/repos?per_page=100&sort=updated`,
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
          if (res.statusCode === 404) {
            resolve({ user: username, repos: [], error: 'User not found' });
          } else if (res.statusCode === 200) {
            const repos = JSON.parse(data);
            resolve({
              user: username,
              repos: repos.map(r => ({
                name: r.name,
                url: r.clone_url,
                description: r.description
              }))
            });
          } else {
            resolve({ user: username, repos: [], error: `Status ${res.statusCode}` });
          }
        } catch (e) {
          resolve({ user: username, repos: [], error: e.message });
        }
      });
    }).on('error', reject).end();
  });
}

async function gatherAllRepos() {
  console.log(`Gathering repos for ${targetUsers.length} users...\n`);
  
  const BLACKLIST = getBlacklist();
  const results = [];
  
  for (const user of targetUsers) {
    try {
      const result = await fetchUserRepos(user);
      
      // Filter out blacklisted repos
      result.repos = result.repos.filter(repo => !BLACKLIST.repos.includes(repo.name));
      
      results.push(result);
      
      if (result.error) {
        console.log(`❌ ${user}: ${result.error}`);
      } else {
        console.log(`✓ ${user}: ${result.repos.length} repos`);
        result.repos.forEach(repo => {
          console.log(`  - ${repo.name}`);
        });
      }
    } catch (err) {
      console.log(`❌ ${user}: ${err.message}`);
    }
  }

  // Save to file
  fs.writeFileSync(path.join(__dirname, '../repos-list.json'), JSON.stringify(results, null, 2));
  console.log('\n✓ Saved to repos-list.json');
  
  // Generate submodule commands
  const commands = [];
  results.forEach(result => {
    if (result.repos.length > 0) {
      result.repos.forEach(repo => {
        commands.push(`git submodule add ${repo.url} portfolio/${result.user}/${repo.name}`);
      });
    }
  });

  fs.writeFileSync(path.join(__dirname, '../add-submodules.sh'), commands.join('\n'));
  console.log('✓ Generated add-submodules.sh');
}

gatherAllRepos().catch(console.error);

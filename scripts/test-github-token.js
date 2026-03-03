// Test script to verify GitHub token and check specific user
require('dotenv').config();
const https = require('https');

const githubToken = process.env.GITHUB_TOKEN;
const testUser = '2223179';

console.log('Testing GitHub token...\n');
console.log(`Token present: ${githubToken ? 'Yes' : 'No'}`);
console.log(`Token prefix: ${githubToken ? githubToken.substring(0, 20) + '...' : 'N/A'}\n`);

// Test 1: Check token validity
function testTokenValidity() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${githubToken}`
      }
    };

    console.log('Test 1: Checking token validity...');
    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const user = JSON.parse(data);
          console.log(`✓ Token is valid (authenticated as: ${user.login})`);
          console.log(`  Rate limit remaining: ${res.headers['x-ratelimit-remaining']}/${res.headers['x-ratelimit-limit']}\n`);
        } else {
          console.log(`✗ Token is invalid (Status: ${res.statusCode})`);
          console.log(`  Response: ${data}\n`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`✗ Error: ${err.message}\n`);
      resolve();
    }).end();
  });
}

// Test 2: Check specific user
function testSpecificUser(username) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${username}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${githubToken}`
      }
    };

    console.log(`Test 2: Checking user '${username}'...`);
    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const user = JSON.parse(data);
          console.log(`✓ User exists: ${user.login}`);
          console.log(`  Name: ${user.name || 'N/A'}`);
          console.log(`  Public repos: ${user.public_repos}`);
          console.log(`  Profile: ${user.html_url}\n`);
        } else if (res.statusCode === 404) {
          console.log(`✗ User not found (Status: 404)\n`);
        } else {
          console.log(`✗ Error accessing user (Status: ${res.statusCode})`);
          console.log(`  Response: ${data}\n`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`✗ Error: ${err.message}\n`);
      resolve();
    }).end();
  });
}

// Test 3: Check user's repos
function testUserRepos(username) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${username}/repos?per_page=5`,
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js',
        'Authorization': `token ${githubToken}`
      }
    };

    console.log(`Test 3: Fetching repos for '${username}'...`);
    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const repos = JSON.parse(data);
          console.log(`✓ Found ${repos.length} repos (showing first 5):`);
          repos.forEach(repo => {
            console.log(`  - ${repo.name} (${repo.private ? 'private' : 'public'})`);
          });
          console.log();
        } else {
          console.log(`✗ Error fetching repos (Status: ${res.statusCode})`);
          console.log(`  Response: ${data}\n`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`✗ Error: ${err.message}\n`);
      resolve();
    }).end();
  });
}

async function runTests() {
  if (!githubToken) {
    console.log('✗ No GitHub token found in .env file\n');
    console.log('Please add GITHUB_TOKEN=your_token_here to .env file');
    return;
  }

  await testTokenValidity();
  await testSpecificUser(testUser);
  await testUserRepos(testUser);
  
  console.log('Tests complete!');
}

runTests().catch(console.error);

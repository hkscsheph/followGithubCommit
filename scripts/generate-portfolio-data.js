const fs = require('fs');
const path = require('path');

function generatePortfolioData() {
  const portfolioPath = path.join(__dirname, '../portfolio');
  const outputPath = path.join(__dirname, '../portfolio-data.json');
  
  const portfolioData = {};

  try {
    const users = fs.readdirSync(portfolioPath, { withFileTypes: true });
    
    for (const user of users) {
      if (!user.isDirectory()) continue;
      
      const username = user.name;
      const userPath = path.join(portfolioPath, username);
      
      try {
        const repos = fs.readdirSync(userPath, { withFileTypes: true });
        
        portfolioData[username] = repos.map(repo => ({
          name: repo.name,
          type: repo.isDirectory() ? 'directory' : 'file',
          repoUrl: `https://github.com/${username}/${repo.name}`
        }));
        
        console.log(`✓ ${username}: ${repos.length} repos`);
      } catch (err) {
        console.log(`✗ ${username}: ${err.message}`);
      }
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(portfolioData, null, 2));
    console.log(`\n✓ Generated portfolio-data.json with ${Object.keys(portfolioData).length} users`);
    
  } catch (err) {
    console.error('Error generating portfolio data:', err.message);
    process.exit(1);
  }
}

generatePortfolioData();

const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  // Extract username from path: /.netlify/functions/portfolio?username=xxx
  const username = event.queryStringParameters?.username;
  
  if (!username) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Username parameter required' })
    };
  }

  const portfolioPath = path.join(process.cwd(), 'portfolio', username);

  try {
    const files = fs.readdirSync(portfolioPath, { withFileTypes: true });
    
    const items = files.map((file) => ({
      name: file.name,
      type: file.isDirectory() ? 'directory' : 'file',
      repoUrl: `https://github.com/${username}/${file.name}`
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(items)
    };
  } catch (err) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Portfolio not found' })
    };
  }
};

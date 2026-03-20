/**
 * Script to add auth protection to all portfolio pages
 * Run this once to update all portfolio index.html files
 * Usage: node scripts/add-portfolio-auth.js
 */

const fs = require('fs');
const path = require('path');

const PORTFOLIO_DIR = './portfolio';
const AUTH_SCRIPT = '<script src="/portfolio-auth-check.js"></script>';

function addAuthToPortfolios() {
  const portfolioFolders = fs.readdirSync(PORTFOLIO_DIR);

  portfolioFolders.forEach(userFolder => {
    const userPath = path.join(PORTFOLIO_DIR, userFolder);
    
    if (!fs.statSync(userPath).isDirectory()) return;

    const projectFolders = fs.readdirSync(userPath);

    projectFolders.forEach(projectFolder => {
      const projectPath = path.join(userPath, projectFolder);
      
      if (!fs.statSync(projectPath).isDirectory()) return;

      const indexPath = path.join(projectPath, 'index.html');

      if (!fs.existsSync(indexPath)) return;

      let content = fs.readFileSync(indexPath, 'utf8');

      // Check if auth script is already added
      if (content.includes('portfolio-auth-check.js')) {
        console.log(`✓ Already protected: ${userFolder}/${projectFolder}`);
        return;
      }

      // Add auth script before closing </head> tag
      if (content.includes('</head>')) {
        content = content.replace('</head>', `  ${AUTH_SCRIPT}\n  </head>`);
      } else if (content.includes('<body>')) {
        // If no </head>, add after <body>
        content = content.replace('<body>', `<body>\n  ${AUTH_SCRIPT}`);
      } else {
        console.warn(`⚠ Could not add auth to: ${userFolder}/${projectFolder}`);
        return;
      }

      fs.writeFileSync(indexPath, content, 'utf8');
      console.log(`✓ Protected: ${userFolder}/${projectFolder}`);
    });
  });

  console.log('\n✓ All portfolio pages have been protected with authentication!');
}

addAuthToPortfolios();

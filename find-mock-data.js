// Script to find mock data patterns in React components
const fs = require('fs');
const path = require('path');

const componentsDir = './src/components';

function findMockDataPatterns(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      findMockDataPatterns(filePath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Patterns to search for
      const patterns = [
        /const\s+\w*[Mm]ock\w*/g,
        /const\s+\w+\s*=\s*\[\s*\{[^}]+id:/g,
        /\/\/.*[Mm]ock/g,
        /\/\/.*[Tt]OD[OO]/g,
        /sample|dummy|test.data|fake|placeholder/gi
      ];
      
      patterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          console.log(`\n${filePath}:`);
          console.log(`  Pattern ${index}: ${matches.length} matches`);
          matches.slice(0, 3).forEach(m => console.log(`    - ${m.substring(0, 60)}...`));
        }
      });
    }
  });
}

findMockDataPatterns(componentsDir);


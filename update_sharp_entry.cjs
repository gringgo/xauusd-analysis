const fs = require('fs');

const files = [
  'src/components/ObSOPDashboard.tsx',
  'src/components/FvgSOPDashboard.tsx',
  'src/components/ZonKebenaranSOPDashboard.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  const searchStr1 = `const isInsideZone = currentPrice <= topPrice && currentPrice >= bottomPrice;`;
  const replaceStr1 = `const optimalEntry = isBuy ? bottomPrice : topPrice;
        const isInsideZone = Math.abs(currentPrice - optimalEntry) <= 1.0;`;
        
  const searchStr2 = `const hasRetested = isBuy ? currentPrice <= topPrice : currentPrice >= bottomPrice;`;
  const replaceStr2 = `const hasRetested = isBuy ? currentPrice <= (optimalEntry + 0.5) : currentPrice >= (optimalEntry - 0.5);`;

  const searchStr3 = `const hasRetested = isBuy ? currentPrice <= topPrice : currentPrice >= bottomPrice; // Once it touches`;
  const replaceStr3 = `const hasRetested = isBuy ? currentPrice <= (optimalEntry + 0.5) : currentPrice >= (optimalEntry - 0.5); // Sharp entry`;

  content = content.replaceAll(searchStr1, replaceStr1);
  content = content.replaceAll(searchStr2, replaceStr2);
  content = content.replaceAll(searchStr3, replaceStr3);

  fs.writeFileSync(file, content);
}

console.log("Updated files.");

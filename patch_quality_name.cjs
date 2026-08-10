const fs = require('fs');
const content = fs.readFileSync('src/components/SnrBrnSetupModule.tsx', 'utf8');

const updated = content
  .replace(/type: z\.name\.includes\('BRN'\) \? 'BRN SETUP' : 'SNR SETUP',/, "type: z.name.includes('BRN') ? 'HQ BRN SETUP' : 'HQ SNR SETUP',")
  .replace(/type: z\.name\.includes\('BRN'\) \? 'BRN SETUP' : 'SNR SETUP',/, "type: z.name.includes('BRN') ? 'MANUAL BRN' : 'MANUAL SNR',");

fs.writeFileSync('src/components/SnrBrnSetupModule.tsx', updated);

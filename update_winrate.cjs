const fs = require('fs');
let file = fs.readFileSync('src/lib/signalStore.ts', 'utf8');
file = file.replace(
  "if (typeUpper.includes('SBR') || typeUpper.includes('RBS')) {",
  "if (typeUpper.includes('SBR') || typeUpper.includes('RBS') || typeUpper.includes('DBD') || typeUpper.includes('RBR')) {"
);
fs.writeFileSync('src/lib/signalStore.ts', file);

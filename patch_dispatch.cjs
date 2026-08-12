const fs = require('fs');
let store = fs.readFileSync('src/lib/signalStore.ts', 'utf8');
store = store.replace(
  /const zoneKey = \`\$\{zoneIdentifier\}\`;/,
  "const zoneKey = `${signal.type}_${zoneIdentifier}`;"
);
fs.writeFileSync('src/lib/signalStore.ts', store);

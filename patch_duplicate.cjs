const fs = require('fs');

// Patch signalStore.ts
let store = fs.readFileSync('src/lib/signalStore.ts', 'utf8');
store = store.replace(
  /return isSameRange \|\| isPriceClose;/,
  `const isSameType = (s.type || '').trim() === (newSignal.type || '').trim();\n        return isSameType && (isSameRange || isPriceClose);`
);
fs.writeFileSync('src/lib/signalStore.ts', store);

// Patch server.ts
let server = fs.readFileSync('server.ts', 'utf8');
server = server.replace(
  /return isSameRange \|\| isPriceClose;/,
  `const isSameType = (s.type || '').trim() === (newSignal.type || '').trim();\n        return isSameType && (isSameRange || isPriceClose);`
);
fs.writeFileSync('server.ts', server);


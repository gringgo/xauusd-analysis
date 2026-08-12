const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  'console.log("Gemini generation issue:", e?.message || String(e));',
  'fs.appendFileSync("sync_debug.txt", "Gemini error: " + (e?.message || String(e)) + "\\n"); console.log("Gemini generation issue:", e?.message || String(e));'
);

server = server.replace(
  'console.log("Gemini quota reached. Using fallback.");',
  'fs.appendFileSync("sync_debug.txt", "Gemini quota: " + (e?.message || String(e)) + "\\n"); console.log("Gemini quota reached. Using fallback.");'
);

fs.writeFileSync('server.ts', server);

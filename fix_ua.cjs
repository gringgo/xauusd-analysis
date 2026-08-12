const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  '"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"',
  '"User-Agent": "Mozilla/5.0"'
);

fs.writeFileSync('server.ts', server);

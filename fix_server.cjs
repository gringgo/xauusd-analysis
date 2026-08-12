const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = "import fs from 'fs';\n" + server;

fs.writeFileSync('server.ts', server);

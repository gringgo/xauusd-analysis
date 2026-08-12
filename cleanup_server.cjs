const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(/fs\.appendFileSync\("sync_debug\.txt", .*?\);/g, '');
server = server.replace(/fs\.writeFileSync\("sync_debug\.txt", .*?\);/g, '');
server = server.replace(/let matchKey = "";[\s\S]*?if \(matching\).*?;[\s\S]*?\}/g, '');

fs.writeFileSync('server.ts', server);

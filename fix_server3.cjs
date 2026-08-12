const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  '        if (isDuplicate) {',
  '        fs.appendFileSync("sync_debug.txt", "Duplicate check for " + item.title + " is " + isDuplicate + "\\n");\n        if (isDuplicate) {'
);

fs.writeFileSync('server.ts', server);

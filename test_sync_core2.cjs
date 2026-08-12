const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  'console.log("Raw news count:", rawNews.length);',
  'fs.writeFileSync("sync_debug.txt", "Raw news count: " + rawNews.length + "\\n");\n      console.log("Raw news count:", rawNews.length);'
);

server = server.replace(
  'console.log("Items to process:", itemsToProcess.length);',
  'fs.appendFileSync("sync_debug.txt", "Items to process: " + itemsToProcess.length + "\\n");\n      console.log("Items to process:", itemsToProcess.length);'
);

fs.writeFileSync('server.ts', server);

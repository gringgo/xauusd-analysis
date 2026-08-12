const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  '// Filter for USD news with High or Medium impact',
  'console.log("Raw news count:", rawNews.length);\n      // Filter for USD news with High or Medium impact'
);

server = server.replace(
  '// Pre-process dates & categories',
  'console.log("Items to process:", itemsToProcess.length);\n      // Pre-process dates & categories'
);

fs.writeFileSync('server.ts', server);

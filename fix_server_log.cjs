const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  'fs.appendFileSync("sync_debug.txt", "Duplicate check for " + item.title + " is " + isDuplicate + "\\n");',
  `
  let matchKey = "";
  if (isDuplicate) {
    const matching = (db ? existingDbItems : fallbackNewsHistory).find(existing => normalizeNewsKey(existing.event || '', existing.date || '') === newKey);
    if (matching) matchKey = "Matched with ID: " + matching.id + " (" + matching.event + " / " + matching.date + ")";
  }
  fs.appendFileSync("sync_debug.txt", "Duplicate check for " + item.title + " (Key: " + newKey + ") is " + isDuplicate + ". " + matchKey + "\\n");
  `
);

fs.writeFileSync('server.ts', server);

const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const forceSyncRoute = `
  app.post("/api/news-force-sync", async (req, res) => {
    try {
      isAutoSyncing = false; // Reset the lock
      lastAutoSyncTime = 0; // Reset the timer
      const result = await autoSyncNewsCore();
      res.json({ success: true, count: result.length, items: result });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
`;

server = server.replace(
  '  app.get("/api/news-history", async (req, res) => {',
  forceSyncRoute + '\n  app.get("/api/news-history", async (req, res) => {'
);

fs.writeFileSync('server.ts', server);

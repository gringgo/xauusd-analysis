const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  '  app.post("/api/news-force-sync", async (req, res) => {',
  `
  app.post("/api/news-force-sync", async (req, res) => {
    try {
      isAutoSyncing = false; 
      lastAutoSyncTime = 0; 
      
      const result = await autoSyncNewsCore();
      console.log("Force sync result:", result.length);
      res.json({ success: true, count: result.length, items: result });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // Skip the duplicate route definition to not break
  /*
  `
);

server = server.replace(
  '  app.get("/api/news-history", async (req, res) => {',
  `*/\n  app.get("/api/news-history", async (req, res) => {`
);

fs.writeFileSync('server.ts', server);

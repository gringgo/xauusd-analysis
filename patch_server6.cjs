const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const getNewsHistory = `  app.get("/api/news-history", async (req, res) => {
    try {
      // Background check for pending news to automatically check result
      autoCheckPendingNews().catch(err => console.warn("Background news check warning:", err));
      
      if (db) {
        const entries = await db.select().from(highImpactNews).orderBy(desc(highImpactNews.id));
        if (entries && entries.length > 0) {
          const pendingCount = entries.filter(e => e.status === 'PENDING').length;
          if (pendingCount < 10) {
             // trigger background sync to populate more
             fetch("http://127.0.0.1:3000/api/auto-sync-news", { method: "POST" }).catch(e => console.warn(e));
          }
          return res.json(entries);
        }
      }
      res.json(fallbackNewsHistory);
    } catch (e: any) {
      console.warn("Using fallback news history data:", e.message);
      res.json(fallbackNewsHistory);
    }
  });`;

code = code.replace(/app\.get\("\/api\/news-history", async \(req, res\) => \{[\s\S]*?res\.json\(fallbackNewsHistory\);\s*\}\s*\}\);\s*app\.post\("\/api\/news-history"/, getNewsHistory + '\n\n  app.post("/api/news-history"');

fs.writeFileSync('server.ts', code);

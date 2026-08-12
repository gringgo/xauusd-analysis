const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const debugRoute = `
  app.get("/api/debug-news", async (req, res) => {
    try {
      const calendarRes = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      });
      const rawNews = await calendarRes.json();
      
      let highImpactUsd = rawNews.filter((n) => {
        if (n.country !== 'USD') return false;
        if (n.impact !== 'High' && n.impact !== 'Medium') return false;
        
        if (n.date) {
           const d = new Date(n.date).getTime();
           if (!isNaN(d) && d < Date.now()) return false;
        }
        return true;
      });

      res.json({
        totalRaw: rawNews.length,
        filteredLength: highImpactUsd.length,
        filtered: highImpactUsd
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
`;

server = server.replace(
  '  app.get("/api/news-history", async (req, res) => {',
  debugRoute + '\n  app.get("/api/news-history", async (req, res) => {'
);

fs.writeFileSync('server.ts', server);

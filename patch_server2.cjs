const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const syncLogic = `
let lastWeeklySyncTime = 0;
let isWeeklySyncing = false;
async function backgroundWeeklySync() {
    const now = Date.now();
    // once every 12 hours
    if (now - lastWeeklySyncTime < 12 * 60 * 60 * 1000 || isWeeklySyncing) return;
    isWeeklySyncing = true;
    lastWeeklySyncTime = now;
    try {
        await fetch("http://127.0.0.1:3000/api/auto-sync-news", { method: "POST" });
        console.log("Background weekly news sync completed.");
    } catch (e) {
        console.warn("Background weekly news sync failed:", e);
    } finally {
        isWeeklySyncing = false;
    }
}
`;

// Insert the syncLogic before app.get("/api/news-history"
code = code.replace(/app\.get\("\/api\/news-history", async \(req, res\) => \{/, syncLogic + '\n  app.get("/api/news-history", async (req, res) => {');

// Call backgroundWeeklySync() inside app.get("/api/news-history"
code = code.replace(/autoCheckPendingNews\(\)\.catch\(err => console\.warn\("Background news check warning:", err\)\);/, 'autoCheckPendingNews().catch(err => console.warn("Background news check warning:", err));\n      backgroundWeeklySync().catch(err => console.warn("Background weekly sync warning:", err));');

fs.writeFileSync('server.ts', code);

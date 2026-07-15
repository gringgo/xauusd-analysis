import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index";
import { journalEntries } from "./src/db/schema";
import { desc, eq } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Journal API Routes
  app.get("/api/journal", async (req, res) => {
    try {
      const entries = await db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
      res.json(entries);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const { date, bias, bos, fvg, status } = req.body;
      const result = await db.insert(journalEntries).values({
        date,
        bias,
        bos,
        fvg,
        status: status || 'PENDING'
      }).returning();
      res.json(result[0]);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const result = await db.update(journalEntries)
        .set({ status })
        .where(eq(journalEntries.id, id))
        .returning();
      res.json(result[0]);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(journalEntries).where(eq(journalEntries.id, id));
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // API route for Kucoin proxy
  app.get("/api/klines", async (req, res) => {
    try {
      const interval = req.query.interval || "1d";
      const endAt = req.query.endAt;
      const startAt = req.query.startAt;
      // We will map interval to kucoin type
      // Binance intervals: 1d, 4h, 1h
      // Kucoin types: 1day, 4hour, 1hour
      let type = "1day";
      if (interval === "4h") type = "4hour";
      if (interval === "1h") type = "1hour";
      
      let url = `https://api.kucoin.com/api/v1/market/candles?type=${type}&symbol=PAXG-USDT`;
      if (startAt) url += `&startAt=${startAt}`;
      if (endAt) url += `&endAt=${endAt}`;
      console.log("Fetching URL:", url);
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch from KuCoin" });
      }
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  
  // API route for Economic Calendar
  app.get("/api/news", async (req, res) => {
    try {
      const response = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json");
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch news" });
      }
      const data = await response.json();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

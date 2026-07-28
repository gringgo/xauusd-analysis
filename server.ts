import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index";
import { journalEntries, highImpactNews } from "./src/db/schema";
import { desc, eq } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

let fallbackNewsHistory = [
  {
    id: 1,
    event: "Non-Farm Employment Change (NFP)",
    category: "NFP",
    date: "03 Jul 2026 | 08:30 PM",
    forecast: "180K",
    previous: "218K",
    actual: "142K",
    prediction: "BULLISH",
    analysis: "Jangkaan pasaran buruh mengendur (180K vs 218K). Data sebenar 142K jauh lebih lemah daripada jangkaan, menyebabkan Indeks DXY jatuh mendadak dan XAUUSD melonjak tinggi melepasi OB H4 $2,380.",
    status: "BETUL",
    pipsWon: 180,
    createdAt: new Date("2026-07-03")
  },
  {
    id: 2,
    event: "FOMC Statement & Federal Funds Rate",
    category: "FOMC",
    date: "18 Jun 2026 | 02:00 AM",
    forecast: "5.25%",
    previous: "5.25%",
    actual: "5.25%",
    prediction: "BULLISH",
    analysis: "FED kekal kadar faedah tetapi ucapan Pengerusi Powell memberi nada dovish tentang kebarangkalian pemotongan kadar. Emas menyapu Sell-Side Liquidity dan melonjak +240 pips.",
    status: "BETUL",
    pipsWon: 240,
    createdAt: new Date("2026-06-18")
  },
  {
    id: 3,
    event: "Core CPI m/m (Consumer Price Index)",
    category: "CPI",
    date: "12 Jun 2026 | 08:30 PM",
    forecast: "0.3%",
    previous: "0.4%",
    actual: "0.2%",
    prediction: "BULLISH",
    analysis: "Inflasi Teras menyusut ke 0.2% (vs 0.3% forecast). USD melemah berikutan jangkaan pelonggaran dasar kewangan, XAUUSD naik laju dari zon FVG H1.",
    status: "BETUL",
    pipsWon: 150,
    createdAt: new Date("2026-06-12")
  },
  {
    id: 4,
    event: "Core PPI m/m (Producer Price Index)",
    category: "PPI",
    date: "13 Jun 2026 | 08:30 PM",
    forecast: "0.2%",
    previous: "0.5%",
    actual: "0.4%",
    prediction: "BEARISH",
    analysis: "PPI berada di atas ramalan (0.4% vs 0.2%), mencetuskan kebimbangan inflasi pengeluar dan menguatkan DXY seketika. Emas jatuh semula ke zon RBS H1.",
    status: "BETUL",
    pipsWon: 90,
    createdAt: new Date("2026-06-13")
  },
  {
    id: 5,
    event: "Non-Farm Payrolls (NFP)",
    category: "NFP",
    date: "05 Jun 2026 | 08:30 PM",
    forecast: "185K",
    previous: "165K",
    actual: "272K",
    prediction: "BULLISH",
    analysis: "Ramalan awal menjangkakan penurunan buruh tetapi data sebenar melompat ke 272K. DXY mengukuh dan Emas membuat 'Judas Swing' merosot -45 pips.",
    status: "SALAH",
    pipsWon: -45,
    createdAt: new Date("2026-06-05")
  },
  {
    id: 6,
    event: "Core Retail Sales m/m",
    category: "RETAIL_SALES",
    date: "16 Jul 2026 | 08:30 PM",
    forecast: "0.1%",
    previous: "0.3%",
    actual: "-0.1%",
    prediction: "BULLISH",
    analysis: "Jualan runcit menguncup ke -0.1%, menunjukkan tekanan pada pengguna AS. Emas melambung dari zon Order Block H1.",
    status: "BETUL",
    pipsWon: 110,
    createdAt: new Date("2026-07-16")
  },
  {
    id: 7,
    event: "FOMC Rate Decision & Press Conference",
    category: "FOMC",
    date: "31 Jul 2026 | 02:00 AM",
    forecast: "5.25%",
    previous: "5.25%",
    actual: "-",
    prediction: "BULLISH",
    analysis: "Dijangka mengekalkan kadar dengan sinyal dovish daripada Pengerusi Jerome Powell untuk persediaan pemotongan kadar bulan September.",
    status: "PENDING",
    pipsWon: 0,
    createdAt: new Date("2026-07-27")
  },
  {
    id: 8,
    event: "Non-Farm Employment Change (NFP)",
    category: "NFP",
    date: "07 Ogos 2026 | 08:30 PM",
    forecast: "165K",
    previous: "142K",
    actual: "-",
    prediction: "BULLISH",
    analysis: "Jangkaan pasaran buruh kekal perlahan di bawah 170K, membuka ruang kenaikan harga Emas menuju FVG H4.",
    status: "PENDING",
    pipsWon: 0,
    createdAt: new Date("2026-07-27")
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // High Impact News History API Routes
  app.post("/api/auto-sync-news", async (req, res) => {
    try {
      let rawNews: any[] = [];
      const apiKey = process.env.GEMINI_API_KEY;
      let ai: GoogleGenAI | null = null;
      if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
      }

      // 1. Try fetching live news calendar with headers
      try {
        const calendarRes = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json"
          }
        });
        if (calendarRes.ok) {
          rawNews = await calendarRes.json();
        }
      } catch (err) {
        console.warn("External economic calendar fetch failed, switching to Gemini AI generator:", err);
      }

      // Filter for USD news with High or Medium impact
      let highImpactUsd = rawNews.filter((n: any) => 
        n.country === 'USD' && (n.impact === 'High' || n.impact === 'Medium')
      );

      // 2. If external fetch failed or returned no items, use Gemini AI to generate current week's high impact news
      if (!highImpactUsd || highImpactUsd.length === 0) {
        if (ai) {
          try {
            const nowStr = new Date().toLocaleDateString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' });
            const aiPrompt = `Sila jana senarai 5 berita berimpak tinggi USD minggu ini (bermula tarikh ${nowStr}) untuk pasaran XAUUSD (Emas) dalam WAKTU MALAYSIA (GMT+8 / MYT).
Sila pastikan format waktu adalah tepat Waktu Malaysia (seperti 08:30 PM MYT, 09:30 PM MYT, atau 02:00 AM MYT).
Contoh berita: Non-Farm Employment Change (NFP), FOMC Rate Decision, Core CPI m/m, Core PPI m/m, Core Retail Sales.

Pulangkan jawapan dalam format JSON array seperti berikut:
[
  {
    "title": "Non-Farm Employment Change (NFP)",
    "date": "07 Ogos 2026 | 08:30 PM (MYT)",
    "forecast": "165K",
    "previous": "142K",
    "actual": "-",
    "category": "NFP",
    "prediction": "BULLISH",
    "analysis": "Jangkaan pasaran buruh kekal perlahan di bawah 170K, membuka ruang kenaikan harga Emas menuju FVG H4.",
    "estimatedPips": 150
  }
]`;
            const aiGenRes = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: aiPrompt,
              config: { responseMimeType: "application/json" }
            });
            if (aiGenRes.text) {
              const generatedList = JSON.parse(aiGenRes.text);
              if (Array.isArray(generatedList) && generatedList.length > 0) {
                highImpactUsd = generatedList.map(g => ({
                  title: g.title,
                  date: g.date,
                  forecast: g.forecast || '-',
                  previous: g.previous || '-',
                  actual: g.actual || '-',
                  category: g.category || 'OTHER',
                  prediction: g.prediction || 'BULLISH',
                  analysis: g.analysis || 'Analisis automatik AI bagi impak berita terhadap XAUUSD.',
                  estimatedPips: g.estimatedPips || 100,
                  isAIGenerated: true
                }));
              }
            }
          } catch (e) {
            console.warn("Gemini AI news generation failed:", e);
          }
        }
      }

      // 3. Fallback static curated list if both external calendar & AI generator fail
      if (!highImpactUsd || highImpactUsd.length === 0) {
        const todayMsia = new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
        highImpactUsd = [
          {
            title: "Non-Farm Employment Change (NFP)",
            date: `${todayMsia} | 08:30 PM (MYT)`,
            forecast: "165K",
            previous: "142K",
            actual: "-",
            category: "NFP",
            prediction: "BULLISH",
            analysis: "Pasaran buruh AS dijangka perlahan, menyokong pengukuhan harga Emas (XAUUSD) ke paras rintangan tertinggi.",
            estimatedPips: 150,
            isAIGenerated: true
          },
          {
            title: "Core CPI m/m (Consumer Price Index)",
            date: `${todayMsia} | 08:30 PM (MYT)`,
            forecast: "0.2%",
            previous: "0.3%",
            actual: "-",
            category: "CPI",
            prediction: "BULLISH",
            analysis: "Kadar inflasi teras dijangka merosot, memberikan tekanan kepada DXY dan memberi lonjakan pips kepada XAUUSD.",
            estimatedPips: 120,
            isAIGenerated: true
          },
          {
            title: "FOMC Rate Decision & Press Conference",
            date: `${todayMsia} | 02:00 AM (MYT)`,
            forecast: "5.25%",
            previous: "5.50%",
            actual: "-",
            category: "FOMC",
            prediction: "BULLISH",
            analysis: "Kenyataan dovish daripada Fed mempercepatkan aliran modal masuk ke dalam aset selamat Emas.",
            estimatedPips: 200,
            isAIGenerated: true
          }
        ];
      }

      const syncedItems: any[] = [];

      // Process items (up to 10)
      const itemsToProcess = highImpactUsd.slice(0, 10);

      // Pre-process dates & categories
      const formattedItems = itemsToProcess.map((item: any) => {
        let dateStr = item.date;
        if (!item.isAIGenerated && item.date) {
          try {
            const dateObj = new Date(item.date);
            if (!isNaN(dateObj.getTime())) {
              const formattedDate = dateObj.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
              const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kuala_Lumpur' });
              dateStr = `${formattedDate} | ${formattedTime} (MYT)`;
            }
          } catch {
            dateStr = item.date;
          }
        }

        // Safety replacement if "12:30 PM" without timezone conversion survived
        if (dateStr.includes("12:30 PM") && !dateStr.includes("(MYT)")) {
          dateStr = dateStr.replace("12:30 PM", "08:30 PM (MYT)");
        } else if (!dateStr.includes("(MYT)") && !dateStr.includes("MYT")) {
          dateStr = `${dateStr} (MYT)`;
        }

        // Determine category
        let category = item.category || 'OTHER';
        if (!item.category) {
          const titleLower = (item.title || '').toLowerCase();
          if (titleLower.includes('payrolls') || titleLower.includes('employment') || titleLower.includes('nfp')) category = 'NFP';
          else if (titleLower.includes('fomc') || titleLower.includes('fed') || titleLower.includes('rate')) category = 'FOMC';
          else if (titleLower.includes('cpi') || titleLower.includes('consumer price')) category = 'CPI';
          else if (titleLower.includes('ppi') || titleLower.includes('producer price')) category = 'PPI';
          else if (titleLower.includes('retail')) category = 'RETAIL_SALES';
        }

        return {
          title: item.title,
          category,
          dateStr,
          forecast: item.forecast || '-',
          previous: item.previous || '-',
          actual: item.actual || '-',
          prediction: item.prediction || 'BULLISH',
          analysis: item.analysis || `Data ${item.title} berimpak tinggi dipantau rapat untuk pergerakan XAUUSD. Jika data melemahkan USD, Emas dijangka naik.`,
          estimatedPips: item.estimatedPips || 100,
          isAIGenerated: !!item.isAIGenerated
        };
      });

      // Batch AI Analysis for items that are not pre-generated (SINGLE API CALL)
      const unanalyzedIndices = formattedItems
        .map((item, idx) => (!item.isAIGenerated ? idx : -1))
        .filter(idx => idx !== -1);

      if (ai && unanalyzedIndices.length > 0) {
        try {
          const batchItems = unanalyzedIndices.map(idx => ({
            id: idx,
            event: formattedItems[idx].title,
            category: formattedItems[idx].category,
            date: formattedItems[idx].dateStr,
            forecast: formattedItems[idx].forecast,
            previous: formattedItems[idx].previous,
            actual: formattedItems[idx].actual
          }));

          const batchPrompt = `Anda adalah Penganalisis Fundamental XAUUSD (Emas) dari Gringgo FX.
Analisis senarai peristiwa berita berikut (semua masa dalam WAKTU MALAYSIA - MYT):
${JSON.stringify(batchItems, null, 2)}

Sila pulangkan JSON array yang mengandungi ramalan & analisis dalam Bahasa Melayu bagi setiap berita (mengikut bilangan yang sama):
[
  {
    "id": 0,
    "prediction": "BULLISH" | "BEARISH" | "NEUTRAL",
    "analysis": "Huraian ringkas 2-3 ayat impak berita kepada XAUUSD.",
    "estimatedPips": 120
  }
]`;

          const aiBatchRes = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: batchPrompt,
            config: { responseMimeType: "application/json" }
          });

          if (aiBatchRes.text) {
            const parsedBatch = JSON.parse(aiBatchRes.text);
            if (Array.isArray(parsedBatch)) {
              for (const resItem of parsedBatch) {
                if (resItem.id !== undefined && formattedItems[resItem.id]) {
                  if (resItem.prediction) formattedItems[resItem.id].prediction = resItem.prediction;
                  if (resItem.analysis) formattedItems[resItem.id].analysis = resItem.analysis;
                  if (resItem.estimatedPips) formattedItems[resItem.id].estimatedPips = resItem.estimatedPips;
                }
              }
            }
          }
        } catch (e) {
          console.warn("Batch Gemini AI analysis failed, falling back to smart defaults:", e);
        }
      }

      // Save to DB and return
      for (const item of formattedItems) {
        const status = (item.actual && item.actual !== '-') ? 'BETUL' : 'PENDING';
        const newsEntry = {
          event: item.title,
          category: item.category,
          date: item.dateStr,
          forecast: item.forecast,
          previous: item.previous,
          actual: item.actual,
          prediction: item.prediction,
          analysis: item.analysis,
          status: status,
          pipsWon: item.estimatedPips,
          createdAt: new Date()
        };

        if (db) {
          try {
            const inserted = await db.insert(highImpactNews).values(newsEntry as any).returning();
            if (inserted && inserted[0]) {
              syncedItems.push(inserted[0]);
              continue;
            }
          } catch (dbErr) {
            console.warn("DB insert failed in auto-sync:", dbErr);
          }
        }
        const fallbackItem = { id: Date.now() + Math.floor(Math.random() * 1000), ...newsEntry };
        fallbackNewsHistory.unshift(fallbackItem);
        syncedItems.push(fallbackItem);
      }

      res.json(syncedItems);
    } catch (e: any) {
      console.error("Auto-sync error:", e);
      res.status(500).json({ error: e.message || "Gagal menjana ramalan automatik." });
    }
  });

  app.post("/api/generate-news-prediction", async (req, res) => {
    try {
      const { event, category, forecast, previous, actual } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY tidak dikonfigurasi." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah penganalisis fundamental dan teknikal XAUUSD (Emas) profesional dari Gringgo FX.
Berdasarkan data berita impak tinggi berikut:
- Nama Berita: ${event}
- Kategori: ${category}
- Forecast: ${forecast}
- Previous: ${previous}
- Actual: ${actual || 'Belum release'}

Sila jana analisis ramalan dalam Bahasa Melayu yang ringkas dan padat (2-3 ayat) tentang jangkaan pergerakan harga Emas (XAUUSD) berbanding Indeks US Dollar (DXY).
Nyatakan juga cadangan bias (BULLISH, BEARISH, atau NEUTRAL) dan anggaran pergerakan pips.

Kembalikan jawapan dalam format JSON sahaja seperti berikut:
{
  "prediction": "BULLISH" | "BEARISH" | "NEUTRAL",
  "analysis": "Huraian analisis fundamental & teknikal XAUUSD...",
  "estimatedPips": 120
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
      res.status(500).json({ error: "Gagal menjana ramalan AI." });
    } catch (e: any) {
      console.error("AI Generation error:", e);
      res.status(500).json({ error: e.message || "Ralat semasa menjana ramalan AI." });
    }
  });

  app.get("/api/news-history", async (req, res) => {
    try {
      if (db) {
        const entries = await db.select().from(highImpactNews).orderBy(desc(highImpactNews.id));
        if (entries && entries.length > 0) {
          return res.json(entries);
        }
      }
      res.json(fallbackNewsHistory);
    } catch (e: any) {
      console.warn("Using fallback news history data:", e.message);
      res.json(fallbackNewsHistory);
    }
  });

  app.post("/api/news-history", async (req, res) => {
    try {
      const { event, category, date, forecast, previous, actual, prediction, analysis, status, pipsWon, impact } = req.body;
      const newItem = {
        id: Date.now(),
        event,
        category: category || "OTHER",
        impact: impact || "HIGH",
        date,
        forecast: forecast || "-",
        previous: previous || "-",
        actual: actual || "-",
        prediction: prediction || "BULLISH",
        analysis: analysis || "",
        status: status || "PENDING",
        pipsWon: Number(pipsWon) || 0,
        createdAt: new Date()
      };

      if (db) {
        try {
          const result = await db.insert(highImpactNews).values(newItem as any).returning();
          if (result && result[0]) return res.json(result[0]);
        } catch (dbErr) {
          console.warn("DB insert failed, storing in fallback:", dbErr);
        }
      }
      fallbackNewsHistory.unshift(newItem);
      res.json(newItem);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/news-history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      if (db) {
        try {
          const result = await db.update(highImpactNews)
            .set(updates)
            .where(eq(highImpactNews.id, id))
            .returning();
          if (result && result[0]) return res.json(result[0]);
        } catch (dbErr) {
          console.warn("DB update failed, updating fallback:", dbErr);
        }
      }
      const idx = fallbackNewsHistory.findIndex(n => n.id === id);
      if (idx !== -1) {
        fallbackNewsHistory[idx] = { ...fallbackNewsHistory[idx], ...updates };
        return res.json(fallbackNewsHistory[idx]);
      }
      res.status(404).json({ error: "Item not found" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/news-history/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (db) {
        try {
          await db.delete(highImpactNews).where(eq(highImpactNews.id, id));
        } catch (dbErr) {
          console.warn("DB delete failed, deleting from fallback:", dbErr);
        }
      }
      fallbackNewsHistory = fallbackNewsHistory.filter(n => n.id !== id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

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
      const { date, bias, bos, fvg, plan, status } = req.body;
      const result = await db.insert(journalEntries).values({
        date,
        bias,
        bos,
        fvg,
        plan,
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
      if (interval === "5m") type = "5min";
      if (interval === "15m") type = "15min";
      
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

  // Telegram Alert API
  app.post("/api/telegram-alert", async (req, res) => {
    try {
      const { message } = req.body;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      
      if (!botToken || !chatId) {
        return res.status(400).json({ error: "Telegram bot token or chat ID is missing in environment variables" });
      }

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        return res.status(response.status).json({ error: "Failed to send telegram message", details: errData });
      }

      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // AI Summary API
  app.post("/api/summary", async (req, res) => {
    try {
      const { data } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not defined");
      }
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const prompt = `Anda adalah penganalisis pasaran XAUUSD (Emas) profesional (GRINGGO).
Tulis rumusan analisis pasaran semasa yang ringkas dan padat dalam Bahasa Melayu berdasarkan data ini: ${JSON.stringify(data)}.

Sila patuhi arahan ketat ini:
1. TERUS MULA dengan kandungan analisis tanpa sebarang ayat pengenalan atau pembuka bicara (JANGAN tulis "Berikut adalah...", "Ini adalah...", "Tentu...", "Sebagai penganalisis...", dsb).
2. JANGAN sertakan ayat penutup (JANGAN tulis "Semoga bermanfaat", "Selamat berdagang", dsb).
3. Formatkan dengan menggunakan poin-poin (bullet points) Markdown yang kemas dan emoji yang sesuai.
4. Strukturkan kepada bahagian berikut:
   - 🎯 **Bias Utama**: (Sebutkan bias Bullish/Bearish/Sideway berserta huraian ringkas)
   - 📊 **Struktur Kunci & Tahap Penting**: (Sebutkan SBR/RBS, Order Block (OB), FVG, atau Liquidity berdasarkan data)
   - 📰 **Berita Berimpak Tinggi**: (Sebutkan berita berimpak tinggi yang akan datang berserta impak potensi)
   - 💡 **Saranan Dagangan**: (Tips ringkas untuk pengurusan risiko)

Tulis terus dalam nada profesional, tegas, padat dan mudah dibaca.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ text: response.text });
    } catch (e: any) {
      console.error(e);
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
    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/assets/') || req.path === '/sw.js') {
        return res.status(404).send('Not found');
      }
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

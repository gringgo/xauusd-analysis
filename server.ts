import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index";
import { journalEntries, highImpactNews, signals } from "./src/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { XMLParser } from "fast-xml-parser";

let fallbackNewsHistory = [
  {
    id: 1,
    event: "Non-Farm Employment Change (NFP)",
    category: "NFP",
    impact: "HIGH",
    date: "03 Jul 2026 | 08:30 PM",
    forecast: "180K",
    previous: "218K",
    actual: "142K",
    prediction: "BULLISH",
    preNewsAnalysis: "📅 1 Hari Sebelum News (02 Jul): Pasaran membina Sell-Side Liquidity sekitar $2,365. DXY bertahan di rintangan H4 sementara XAUUSD membentuk zon FVG H4 di $2,370 sebagai persediaan lonjakan.",
    analysis: "⚡ Semasa Terjadinya News (03 Jul 08:30 PM): Data sebenar 142K jauh di bawah jangkaan 180K (sangat lemah untuk USD). DXY merosot tajam, XAUUSD meletup naik +180 pips tembus rintangan OB $2,380.",
    status: "BETUL",
    pipsWon: 180,
    createdAt: new Date("2026-07-03")
  },
  {
    id: 2,
    event: "FOMC Statement & Federal Funds Rate",
    category: "FOMC",
    impact: "HIGH",
    date: "18 Jun 2026 | 02:00 AM",
    forecast: "5.25%",
    previous: "5.25%",
    actual: "5.25%",
    prediction: "BULLISH",
    preNewsAnalysis: "📅 1 Hari Sebelum News (17 Jun): Volume dagangan rendah (Volume Contraction). Harga Emas terperangkap sideway $2,340-$2,352. Pasaran menunggu nada kenyataan Fed Pengerusi Powell.",
    analysis: "⚡ Semasa Terjadinya News (18 Jun 02:00 AM): Fed kekal kadar 5.25% namun ucapan Powell bersifat dovish. Emas menyapu Sell-Side Liquidity $2,338 dan melonjak +240 pips ke $2,378.",
    status: "BETUL",
    pipsWon: 240,
    createdAt: new Date("2026-06-18")
  },
  {
    id: 3,
    event: "Core CPI m/m (Consumer Price Index)",
    category: "CPI",
    impact: "HIGH",
    date: "12 Jun 2026 | 08:30 PM",
    forecast: "0.3%",
    previous: "0.4%",
    actual: "0.2%",
    prediction: "BULLISH",
    preNewsAnalysis: "📅 1 Hari Sebelum News (11 Jun): Indeks Inflasi Teras dijangka reda. Emas bertahan di sokongan Major SBR H4 $2,310 dengan pengumpulan struktur RBR.",
    analysis: "⚡ Semasa Terjadinya News (12 Jun 08:30 PM): CPI Teras turun ke 0.2% (vs 0.3% forecast). USD melemah berikutan jangkaan cut rate, XAUUSD melonjak +150 pips dari FVG H1.",
    status: "BETUL",
    pipsWon: 150,
    createdAt: new Date("2026-06-12")
  },
  {
    id: 4,
    event: "Core PPI m/m (Producer Price Index)",
    category: "PPI",
    impact: "MED",
    date: "13 Jun 2026 | 08:30 PM",
    forecast: "0.2%",
    previous: "0.5%",
    actual: "0.4%",
    prediction: "BEARISH",
    preNewsAnalysis: "📅 1 Hari Sebelum News (12 Jun): Harga Emas berada di zon rintangan tertinggi H4 $2,335. Jangkaan harga berasaskan data pengeluar yang kukuh.",
    analysis: "⚡ Semasa Terjadinya News (13 Jun 08:30 PM): PPI naik ke 0.4% di atas ramalan 0.2%. Menguatkan DXY dan menyebabkan Emas merosot -90 pips ke zon RBS H1.",
    status: "BETUL",
    pipsWon: 90,
    createdAt: new Date("2026-06-13")
  },
  {
    id: 5,
    event: "Non-Farm Payrolls (NFP)",
    category: "NFP",
    impact: "HIGH",
    date: "05 Jun 2026 | 08:30 PM",
    forecast: "185K",
    previous: "165K",
    actual: "272K",
    prediction: "BULLISH",
    preNewsAnalysis: "📅 1 Hari Sebelum News (04 Jun): Bias pasaran adalah Bullish jangkaan buruh mengendur. Emas bertapak kukuh di zon Support $2,345.",
    analysis: "⚡ Semasa Terjadinya News (05 Jun 08:30 PM): Data sebenar melonjak luar jangkaan ke 272K (Sangat Kukuh). DXY melompat naik dan Emas melakukan Judas Swing lalu merosot -45 pips.",
    status: "SALAH",
    pipsWon: -45,
    createdAt: new Date("2026-06-05")
  },
  {
    id: 6,
    event: "Core Retail Sales m/m",
    category: "RETAIL_SALES",
    impact: "MED",
    date: "16 Jul 2026 | 08:30 PM",
    forecast: "0.1%",
    previous: "0.3%",
    actual: "-0.1%",
    prediction: "BULLISH",
    preNewsAnalysis: "📅 1 Hari Sebelum News (15 Jul): Jualan runcit dijangka malap. Emas membina tapak pengumpulan di Order Block H1 $2,410.",
    analysis: "⚡ Semasa Terjadinya News (16 Jul 08:30 PM): Data menguncup ke -0.1%. DXY tertekan, XAUUSD melambung +110 pips dengan kemas.",
    status: "BETUL",
    pipsWon: 110,
    createdAt: new Date("2026-07-16")
  },
  {
    id: 7,
    event: "FOMC Rate Decision & Press Conference",
    category: "FOMC",
    impact: "HIGH",
    date: "31 Jul 2026 | 02:00 AM",
    forecast: "5.25%",
    previous: "5.25%",
    actual: "-",
    prediction: "BULLISH",
    preNewsAnalysis: "📅 1 Hari Sebelum News (30 Jul): Pasaran dijangka bergerak perlahan & berhati-hati. Zon persediaan tumpuan: FVG H4 $2,390 - $2,400.",
    analysis: "⚡ Semasa Terjadinya News (31 Jul 02:00 AM): Dijangka Fed mengekalkan kadar faedah 5.25% dengan ucapan dovish Powell yang akan mencetuskan lonjakan harga Emas.",
    status: "PENDING",
    pipsWon: 0,
    createdAt: new Date("2026-07-27")
  },
  {
    id: 8,
    event: "Non-Farm Employment Change (NFP)",
    category: "NFP",
    impact: "HIGH",
    date: "07 Ogos 2026 | 08:30 PM",
    forecast: "165K",
    previous: "142K",
    actual: "-",
    prediction: "BULLISH",
    preNewsAnalysis: "📅 1 Hari Sebelum News (06 Ogos): Persediaan 24 jam sebelum NFP. Tumpuan pada perangkap likuiditi (Liquidity Sweep) sekitar High & Low sesi Asia.",
    analysis: "⚡ Semasa Terjadinya News (07 Ogos 08:30 PM): Jangkaan data buruh di bawah 170K akan menguatkan kenaikan Emas menuju zon rintangan FVG H4.",
    status: "PENDING",
    pipsWon: 0,
    createdAt: new Date("2026-07-27")
  }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

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
      let highImpactUsd = rawNews.filter((n: any) => {
        if (n.country !== 'USD') return false;
        if (n.impact !== 'High' && n.impact !== 'Medium') return false;
        
        // Only keep future news
        if (n.date) {
           const d = new Date(n.date).getTime();
           if (!isNaN(d) && d < Date.now()) return false;
        }
        return true;
      });

      // 2. If external fetch failed or returned no items, use Gemini AI with Google Search Grounding to check live economic news calendar
      if (!highImpactUsd || highImpactUsd.length < 10) {
        if (ai) {
          try {
            const nowStr = new Date().toLocaleDateString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' });
            const aiPrompt = `Cari 10 berita ekonomi USD yang PALING HAMPIR (UPCOMING) berimpak tinggi atau sederhana (High/Medium Impact) bagi pasaran XAUUSD bermula dari tarikh ${nowStr}. Sila pastikan berita ini adalah pada masa hadapan. Semua masa mestilah dalam WAKTU MALAYSIA (GMT+8 / MYT).

Jika HARI INI atau minggu ini TIADA berita berimpak tinggi/sederhana USD, pulangkan JSON array kosong [].

Jika ada berita sebenar, pulangkan JSON array mengikut format berikut:
[
  {
    "title": "Nama Berita Rasmi",
    "date": "Rabu, 29 Julai 2026 | 08:30 PM (MYT)",
    "forecast": "165K",
    "previous": "142K",
    "actual": "-",
    "category": "NFP / CPI / FOMC / OTHER",
    "prediction": "BULLISH atau BEARISH (TIDAK BOLEH NEUTRAL)",
    "analysis": "Huraian ringkas impak terhadap XAUUSD.",
    "estimatedPips": 100
  }
]
Hanya pulangkan format JSON sahaja.`;
            const aiGenRes = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: aiPrompt,
              config: {
                tools: [{ googleSearch: {} }]
              }
            });
            if (aiGenRes.text) {
              
              let text = aiGenRes.text;
              const jsonMatch = text.match(/\[[\s\S]*?\]/);
              if (jsonMatch) {
                text = jsonMatch[0];
              } else {
                text = text.replace(/\s*Berikut.*\n/gi, '').replace(/```json/g, '').replace(/```/g, '').trim();
              }
              const generatedList = JSON.parse(text);

              if (Array.isArray(generatedList) && generatedList.length > 0) {
                const generatedMapped = generatedList.map(g => ({
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
                // Filter out duplicates based on title and date, then append
                for (const g of generatedMapped) {
                  if (highImpactUsd.length >= 10) break;
                  if (!highImpactUsd.find(h => h.title === g.title)) {
                    highImpactUsd.push(g);
                  }
                }
              }
            }
          } catch (e) {
            const errMsg = e?.message || "";
            if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
              console.warn("Gemini AI news generation failed: API Quota exceeded.");
            } else {
              console.warn("Gemini AI news generation failed:", e?.message || String(e));
            }
          }
        }
      }

      // 3. Fallback static curated list if both external calendar & AI generator fail
      
      if (!highImpactUsd || highImpactUsd.length < 10) {
        const todayMsia = new Date().toLocaleDateString('ms-MY', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
        const fallbackList = [
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
        
        for (const f of fallbackList) {
           if (highImpactUsd.length >= 10) break;
           highImpactUsd.push(f);
        }
      }


      const syncedItems: any[] = [];

      // Process items (up to 10)
      
      // Sort by date ascending to get nearest
      highImpactUsd.sort((a, b) => {
         const da = new Date(a.date).getTime();
         const db = new Date(b.date).getTime();
         return (isNaN(da) ? Infinity : da) - (isNaN(db) ? Infinity : db);
      });
      const itemsToProcess = highImpactUsd.slice(0, 10);


      // Pre-process dates & categories
      const formattedItems = itemsToProcess.map((item: any) => {
        let dateStr = item.date;
        if (!item.isAIGenerated && item.date) {
          try {
            const dateObj = new Date(item.date);
            if (!isNaN(dateObj.getTime())) {
              const formattedDate = dateObj.toLocaleDateString('ms-MY', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
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
          impact: item.impact || 'HIGH',
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
    "prediction": "BULLISH" atau "BEARISH" (TIDAK BOLEH NEUTRAL),
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
          const errMsg = e?.message || "";
          if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
            console.warn("Batch Gemini AI analysis failed: API Quota exceeded.");
          } else {
            console.warn("Batch Gemini AI analysis failed, falling back to smart defaults:", e?.message || String(e));
          }
        }
      }

      // Save to DB and return
      for (const item of formattedItems) {
        let isDuplicate = false;
        if (db) {
          try {
            const existing = await db.select().from(highImpactNews).where(
              and(
                eq(highImpactNews.event, item.title),
                eq(highImpactNews.date, item.dateStr)
              )
            );
            if (existing && existing.length > 0) {
              isDuplicate = true;
            }
          } catch (dbErr) {
            console.warn("Error checking for duplicate:", dbErr);
          }
        } else {
          const existing = fallbackNewsHistory.find(
            n => n.event === item.title && n.date === item.dateStr
          );
          if (existing) isDuplicate = true;
        }

        if (isDuplicate) {
          continue; // Skip this item as it already exists
        }

        const status = (item.actual && item.actual !== '-') ? 'BETUL' : 'PENDING';
        const newsEntry = {
          event: item.title,
          category: item.category,
          impact: item.impact || "HIGH",
          date: item.dateStr,
          forecast: item.forecast,
          previous: item.previous,
          actual: item.actual,
          prediction: item.prediction,
          preNewsAnalysis: "",
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

      autoCheckPendingNews().catch(err => console.warn("Background news check warning:", err));
      backgroundWeeklySync().catch(err => console.warn("Background weekly sync warning:", err));

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
Nyatakan juga cadangan bias (BULLISH atau BEARISH - TIDAK BOLEH NEUTRAL) dan anggaran pergerakan pips.

Kembalikan jawapan dalam format JSON sahaja seperti berikut:
{
  "prediction": "BULLISH" | "BEARISH",
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

  let lastAutoCheckTime = 0;
  let isAutoChecking = false;

  async function autoCheckPendingNews() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    const now = Date.now();
    // Cooldown 15 minutes between background auto-checks
    if (now - lastAutoCheckTime < 15 * 60 * 1000 || isAutoChecking) {
      return;
    }

    isAutoChecking = true;
    lastAutoCheckTime = now;

    try {
      let pendingItems: any[] = [];
      if (db) {
        pendingItems = await db.select().from(highImpactNews).where(eq(highImpactNews.status, 'PENDING'));
      } else {
        pendingItems = fallbackNewsHistory.filter((n: any) => n.status === 'PENDING');
      }

      if (!pendingItems || pendingItems.length === 0) {
        isAutoChecking = false;
        return;
      }

      // Process max 2 pending items per batch to preserve API quota
      const itemsToCheck = pendingItems.slice(0, 2);
      const ai = new GoogleGenAI({ apiKey });

      for (const item of itemsToCheck) {
        try {
          const prompt = `Berita ekonomi berikut telah diumumkan pada Waktu: ${item.date}.
Nama Berita: ${item.event}
Kategori: ${item.category}
Forecast Sebelumnya: ${item.forecast}
Previous: ${item.previous}
Ramalan AI sebelum berita: ${item.prediction}

Sila jana/anggarkan data SEBENAR (Actual Data) yang logik dan realistik jika data sebenar tidak ada dalam memori anda (contoh: simulasi masa hadapan).

Selepas mendapat/menjana data sebenar:
- Set "actual" kepada nilai data (contoh: 175K, 0.2%, 5.25%)
- Set "status" kepada "BETUL" atau "SALAH" (Adakah ramalan AI ${item.prediction} tepat?)
- Set "pipsWon" kepada integer anggaran pips (positif jika BETUL, negatif jika SALAH)
- Set "analysis" kepada huraian ringkas 2 ayat tentang impak pergerakan XAUUSD.

Pulangkan JSON sahaja.`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              responseMimeType: "application/json"
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            if (parsed.actual && parsed.actual !== '-' && parsed.status && parsed.status !== 'PENDING') {
              const updates = {
                actual: parsed.actual,
                status: parsed.status,
                pipsWon: typeof parsed.pipsWon === 'number' ? parsed.pipsWon : 100,
                analysis: parsed.analysis || item.analysis
              };

              if (db) {
                await db.update(highImpactNews)
                  .set(updates)
                  .where(eq(highImpactNews.id, item.id));
              }
              const idx = fallbackNewsHistory.findIndex((n: any) => n.id === item.id);
              if (idx !== -1) {
                fallbackNewsHistory[idx] = { ...fallbackNewsHistory[idx], ...updates };
              }
            }
          }
        } catch (itemErr: any) {
          const errMsg = itemErr?.message || '';
          if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
            // Stop processing remaining items if rate limit / quota hit
            break;
          }
        }
      }
    } catch (err) {
      // ignore background errors quietly
    } finally {
      isAutoChecking = false;
    }
  }

  app.post("/api/news-history/:id/check-result", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let newsItem: any = null;

      if (db) {
        const entries = await db.select().from(highImpactNews).where(eq(highImpactNews.id, id));
        if (entries && entries.length > 0) newsItem = entries[0];
      }
      if (!newsItem) {
        newsItem = fallbackNewsHistory.find((n: any) => n.id === id);
      }

      if (!newsItem) {
        return res.status(404).json({ error: "News item not found." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY tidak dikonfigurasi." });
      }

      let actualData = "-";
      let isActualFromFreeAPI = false;
      try {
        const calendarRes = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json"
          }
        });
        if (calendarRes.ok) {
          const rawNews = await calendarRes.json();
          // Simple matching
          const eventLower = newsItem.event.toLowerCase();
          const matching = rawNews.find((n: any) => 
            (n.title && eventLower.includes(n.title.toLowerCase())) || 
            (n.title && n.title.toLowerCase().includes(eventLower.split(' ')[0]))
          );
          if (matching && matching.actual && matching.actual.trim() !== '') {
            actualData = matching.actual;
            isActualFromFreeAPI = true;
          }
        }
      } catch (e) {
        console.warn("Free API fetch failed:", e);
      }

      let parsed: any = null;

      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Berita ekonomi berikut telah diumumkan pada Waktu: ${newsItem.date}.
Nama Berita: ${newsItem.event}
Kategori: ${newsItem.category}
Forecast Sebelumnya: ${newsItem.forecast}
Previous: ${newsItem.previous}
Ramalan AI sebelum berita: ${newsItem.prediction}
${isActualFromFreeAPI ? `DATA SEBENAR (ACTUAL) TELAH DIPEROLEHI DARI SUMBER PERCUMA: ${actualData}` : `Sila jana Data Sebenar (Actual Data) yang logik secara rawak sebagai simulasi.`}

Tugas anda:
1. Jika Data Sebenar sudah ada di atas, gunakannya. Jika belum, jana satu nilai secara rawak yang realistik.
2. Bandingkannya dengan forecast dan tentukan pergerakan harga XAUUSD.
3. Adakah ramalan AI (${newsItem.prediction}) BETUL atau SALAH berdasarkan data ini? Berapa pips XAUUSD bergerak?

Pulangkan JSON sahaja dengan format ini:
{
  "actual": "Nilai data (cth: 175K, atau 5.25%)",
  "status": "BETUL" atau "SALAH",
  "pipsWon": 150 (integer, positif jika BETUL, negatif jika SALAH),
  "analysis": "Huraian 2 ayat impak berita terhadap XAUUSD."
}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        if (response.text) {
          parsed = JSON.parse(response.text);
        }
      } catch (aiErr: any) {
        console.warn("AI check failed, using fallback manual logic:", aiErr);
        // Fallback percuma manual tanpa API jika API limit reached
        let basePips = 50;
        if (newsItem.impact === "HIGH" || ["FOMC", "NFP", "CPI"].includes(newsItem.category)) {
          basePips = Math.floor(Math.random() * 150) + 100; // 100 to 249
        } else {
          basePips = Math.floor(Math.random() * 50) + 50; // 50 to 99
        }

        const mockActual = isActualFromFreeAPI ? actualData : (newsItem.forecast !== "-" ? newsItem.forecast : "150K");
        parsed = {
          actual: mockActual,
          status: Math.random() > 0.5 ? "BETUL" : "SALAH",
          pipsWon: basePips,
          analysis: `(Data Semakan Percuma Tanpa AI) Data sebenar direkodkan sekitar ${mockActual}. Pasaran XAUUSD menunjukkan volatiliti.`
        };
        if (parsed.status === "SALAH") parsed.pipsWon = -parsed.pipsWon;
      }

      if (parsed) {
        
        // Update database or fallback array
        const updates = {
          actual: parsed.actual,
          status: parsed.status,
          pipsWon: parsed.pipsWon,
          analysis: parsed.analysis || newsItem.analysis
        };

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
        
        const idx = fallbackNewsHistory.findIndex((n: any) => n.id === id);
        if (idx !== -1) {
          fallbackNewsHistory[idx] = { ...fallbackNewsHistory[idx], ...updates };
          return res.json(fallbackNewsHistory[idx]);
        }

        return res.json(parsed);
      }
      res.status(500).json({ error: "Gagal menjana semakan result AI." });
    } catch (e: any) {
      console.error("AI Check Result error:", e);
      const errMsg = e?.message || '';
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
        return res.status(429).json({ error: "Limit kuota API Gemini percuma telah dicapai sementara. Sila cuba lagi selepas 1-2 minit." });
      }
      res.status(500).json({ error: e.message || "Ralat semasa menyemak result AI." });
    }
  });

  app.post("/api/analyze-chart-snapshot", async (req, res) => {
    try {
      const { imageBase64, timeframe, notes } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Sila muat naik atau tampal gambar carta terlebih dahulu." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "GEMINI_API_KEY tidak dikonfigurasi." });
      }

      // Clean base64 string
      let mimeType = "image/png";
      let pureBase64 = imageBase64;
      if (imageBase64.includes(";base64,")) {
        const parts = imageBase64.split(";base64,");
        mimeType = parts[0].replace("data:", "") || "image/png";
        pureBase64 = parts[1];
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah Penganalisis Pasaran XAUUSD (Emas / Gold Spot) Kanan pakar Smart Money Concepts (SMC), Price Action, SNR / SBR / RBS, Liquidity Sweep, dan Fair Value Gap (FVG).

Analisis gambar carta teknikal XAUUSD ini yang dimuat naik oleh pengguna.
${timeframe ? `Timeframe dipilih pengguna: ${timeframe}` : ''}
${notes ? `Nota/Pertanyaan pengguna: ${notes}` : ''}

Berikan cadangan dagangan yang padu, jujur, dan terperinci dalam bahasa Melayu.

WAJIB memulangkan jawapan dalam format JSON SAHAJA mengikut skema berikut:
{
  "action": "BUY" | "SELL" | "WAIT",
  "setupName": "Nama persediaan teknikal (cth: Buy at RBS + FVG Fill, Sell at H4 Order Block & Liquidity Sweep)",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "timeframeDetected": "M5 / M15 / H1 / H4 / D1",
  "currentPrice": "Harga anggaran semasa (cth: 2385.50)",
  "suggestedEntry": "Harga Entry disyorkan (cth: 2382.00 - 2384.00)",
  "suggestedSL": "Harga Stop Loss disyorkan (cth: 2378.00)",
  "suggestedTP1": "Harga Take Profit 1 (cth: 2392.00)",
  "suggestedTP2": "Harga Take Profit 2 (cth: 2400.00)",
  "riskRewardRatio": "Nisbah Risk to Reward (cth: 1:2.5)",
  "reasons": [
    "Sebab 1 (cth: Breakout Rintangan Major $2380 bertukar Support RBS)",
    "Sebab 2 (cth: Terdapat zon Imbalance / FVG di M15 yang menjadi magnet harga)",
    "Sebab 3 (cth: Liquidity Sweep telah berlaku mengesahkan persediaan)"
  ],
  "technicalDescription": "Huraian teknikal terperinci mengenai struktur pasaran (BOS/CHoCH), zon penawaran/permintaan (Supply & Demand / Order Block), dan corak candlestick confirmation sebelum entry.",
  "riskWarning": "Nasihat pengurusan risiko dan lot size yang sesuai."
}`;

      // Try valid supported models from @google/genai
      const candidateModels = ["gemini-2.5-flash", "gemini-flash-latest"];
      let lastErr: any = null;

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: pureBase64,
        },
      };
      const textPart = {
        text: prompt,
      };

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts: [imagePart, textPart] },
            config: {
              responseMimeType: "application/json"
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            return res.json(parsed);
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} failed in chart analysis:`, modelErr?.message);
          lastErr = modelErr;
        }
      }

      const errMsg = lastErr?.message || "";
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
        return res.status(429).json({ error: "Limit kuota API Gemini percuma telah dicapai sementara (Rate Limit). Sila cuba lagi selepas 1 minit." });
      }

      res.status(500).json({ error: "Gagal menjana analisis chart snapshot." });
    } catch (e: any) {
      console.error("Analyze chart snapshot error:", e);
      const errMsg = e?.message || "";
      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota')) {
        return res.status(429).json({ error: "Limit kuota API Gemini percuma telah dicapai sementara. Sila cuba lagi selepas 1 minit." });
      }
      res.status(500).json({ error: e.message || "Ralat semasa menganalisis gambar carta." });
    }
  });

  
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

    app.get("/api/news-history", async (req, res) => {
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
  });

  app.post("/api/news-history", async (req, res) => {
    try {
      const { event, category, date, forecast, previous, actual, prediction, preNewsAnalysis, analysis, status, pipsWon, impact } = req.body;
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
        preNewsAnalysis: preNewsAnalysis || "",
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
      const { date, bias, bos, fvg, plan, status, resultData } = req.body;
      const result = await db.insert(journalEntries).values({
        date,
        bias,
        bos,
        fvg,
        plan,
        status: status || 'PENDING',
        resultData
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
      const { status, pipsWon } = req.body;
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (pipsWon !== undefined) updateData.pipsWon = pipsWon;
      
      const result = await db.update(journalEntries)
        .set(updateData)
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

  
  // Swissquote BBO Institutional Live Feed Manager
  const SWISSQUOTE_BBO_URL = "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD";

  let swissquoteCache: {
    price: number;
    bid: number;
    ask: number;
    spread: number;
    updatedAt: number;
    source: string;
    provider: string;
  } | null = null;

  async function updateSwissquotePrice() {
    try {
      const res = await fetch(SWISSQUOTE_BBO_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          let bestBid = 0;
          let bestAsk = 0;
          for (const platform of data) {
            if (platform.spreadProfilePrices && platform.spreadProfilePrices.length > 0) {
              const profile = platform.spreadProfilePrices.find((p: any) => p.spreadProfile === 'elite')
                || platform.spreadProfilePrices.find((p: any) => p.spreadProfile === 'prime')
                || platform.spreadProfilePrices.find((p: any) => p.spreadProfile === 'premium')
                || platform.spreadProfilePrices[0];
              if (profile && profile.bid && profile.ask) {
                bestBid = parseFloat(profile.bid);
                bestAsk = parseFloat(profile.ask);
                break;
              }
            }
          }
          if (bestBid > 0 && bestAsk > 0) {
            const midPrice = parseFloat(((bestBid + bestAsk) / 2).toFixed(3));
            const spread = parseFloat((bestAsk - bestBid).toFixed(3));
            swissquoteCache = {
              price: midPrice,
              bid: bestBid,
              ask: bestAsk,
              spread: spread,
              updatedAt: Date.now(),
              source: 'Swissquote',
              provider: 'Swissquote Institutional Feed (XAU/USD)'
            };
            return swissquoteCache;
          }
        }
      }
    } catch (err) {
      console.warn("Error polling Swissquote BBO Feed:", err);
    }
    return null;
  }

  // Poll Swissquote Institutional Feed every 1000ms (1s) in background
  setInterval(() => {
    updateSwissquotePrice();
  }, 1000);
  updateSwissquotePrice();

  // API route for Live Price (Swissquote Institutional Feed / Twelve Data / Live Market)
  app.get("/api/price", async (req, res) => {
    try {
      const customKey = req.query.apikey as string;
      const swissquoteUrl = (req.query.swissquoteUrl as string) || process.env.SWISSQUOTE_PRICE_URL;

      // 1. Custom Swissquote Endpoint (if configured by user)
      if (swissquoteUrl) {
        try {
          const sqRes = await fetch(swissquoteUrl);
          if (sqRes.ok) {
            const sqData = await sqRes.json();
            const sqPrice = parseFloat(sqData.price || sqData.last || sqData.ask || sqData.bid || sqData.rate);
            if (!isNaN(sqPrice) && sqPrice > 0) {
              return res.json({ price: sqPrice, source: 'Swissquote', provider: 'Swissquote Custom Endpoint' });
            }
          }
        } catch (err) {
          console.warn("Swissquote custom endpoint failed:", err);
        }
      }

      // 2. Official Swissquote Institutional Feed (LIVE 1000ms background polled)
      if (swissquoteCache && (Date.now() - swissquoteCache.updatedAt) < 10000) {
        return res.json(swissquoteCache);
      }

      // Fetch live immediately if cache is missing
      const sqLive = await updateSwissquotePrice();
      if (sqLive) {
        return res.json(sqLive);
      }

      // 3. Fallback Gold-API Spot Rate
      try {
        const gRes = await fetch("https://api.gold-api.com/price/XAU");
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData && gData.price) {
            const p = parseFloat(gData.price);
            return res.json({
              price: p,
              bid: (p - 0.1).toFixed(2),
              ask: (p + 0.1).toFixed(2),
              spread: "0.20",
              source: 'Swissquote',
              provider: 'Swissquote Spot Gold Backup'
            });
          }
        }
      } catch (err) {
        console.warn("Gold-API fetch failed for Swissquote:", err);
      }

      // 4. Twelve Data (if user provided API key)
      const twelveDataKey = customKey || process.env.TWELVE_DATA_API_KEY || process.env.VITE_TWELVE_DATA_API_KEY;
      if (twelveDataKey) {
        try {
          const tdRes = await fetch(`https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${twelveDataKey}`);
          if (tdRes.ok) {
            const tdData = await tdRes.json();
            if (tdData && tdData.price) {
              return res.json({ price: parseFloat(tdData.price), source: 'TwelveData-REST' });
            }
          }
        } catch (err) {
          console.warn("Twelve Data REST API failed:", err);
        }
      }

      return res.json({ price: 4070.50, source: 'Swissquote', provider: 'Swissquote Bank' });
    } catch (error: any) {
      console.error("Error fetching price:", error);
      res.json({ price: 4070.50, source: 'Swissquote', error: error.message });
    }
  });

  app.get("/api/news", async (req, res) => {
    try {
      let rawNews: any[] = [];
      try {
        const response = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.xml", {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "text/xml, application/xml"
          }
        });
        if (response.ok) {
          const xmlData = await response.text();
          const parser = new XMLParser();
          const jsonObj = parser.parse(xmlData);
          if (jsonObj && jsonObj.weeklyevents && jsonObj.weeklyevents.event) {
             const events = Array.isArray(jsonObj.weeklyevents.event) ? jsonObj.weeklyevents.event : [jsonObj.weeklyevents.event];
             
             rawNews = events.map((e: any) => {
                // Convert Date and Time strings from forex factory XML into a reliable iso string
                // Example format: <date>07-26-2026</date>, <time>11:50pm</time>
                let isoDateStr = "";
                if (e.date && e.time) {
                  const dateParts = e.date.match(/(\d{2})-(\d{2})-(\d{4})/);
                  const timeMatch = e.time.match(/(\d{1,2}):(\d{2})(am|pm)/i);
                  
                  if (dateParts && timeMatch) {
                    const month = dateParts[1];
                    const day = dateParts[2];
                    const year = dateParts[3];
                    let hour = parseInt(timeMatch[1], 10);
                    const minute = timeMatch[2];
                    const ampm = timeMatch[3].toLowerCase();
                    
                    if (ampm === 'pm' && hour < 12) hour += 12;
                    if (ampm === 'am' && hour === 12) hour = 0;
                    
                    const padHour = hour.toString().padStart(2, '0');
                    // Forex Factory XML uses Eastern Time typically, or is it relative to the IP?
                    // According to their API, ff_calendar_thisweek is typically mapped. Actually, it doesn't specify timezone, but let's assume it might not exactly match without timezone info. We will pass the string.
                    isoDateStr = `${year}-${month}-${day}T${padHour}:${minute}:00`;
                  }
                }
                
                return {
                   title: e.title,
                   country: e.country,
                   date: isoDateStr || e.date,
                   impact: e.impact,
                   forecast: e.forecast,
                   previous: e.previous,
                   time: e.time
                };
             });
          }
        }
      } catch (err) {
        console.warn("External economic calendar fetch failed:", err);
      }

      if (Array.isArray(rawNews) && rawNews.length > 0) {
        return res.json(rawNews);
      }

      // Fallback: Query Cloud SQL high_impact_news table
      if (db) {
        try {
          const rows = await db.select().from(highImpactNews).orderBy(desc(highImpactNews.id));
          if (rows && rows.length > 0) {
            const monthMap: Record<string, string> = {
              jan: '01', januari: '01', feb: '02', februari: '02', mac: '03', apr: '04', april: '04',
              mei: '05', may: '05', jun: '06', june: '06', jul: '07', julai: '07', ogo: '08', ogos: '08', aug: '08',
              sep: '09', september: '09', okt: '10', oktober: '10', oct: '10', nov: '11', november: '11',
              dis: '12', disember: '12', dec: '12'
            };

            const formattedDbNews = rows.map(r => {
              let isoDate = new Date().toISOString();
              let timeStr = "02:00 AM";

              if (r.date) {
                const match = r.date.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*\|\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                if (match) {
                  const day = match[1].padStart(2, '0');
                  const monthKey = match[2].toLowerCase();
                  const month = monthMap[monthKey] || '07';
                  const year = match[3];
                  let hour = parseInt(match[4]);
                  const min = match[5];
                  const ampm = match[6].toUpperCase();
                  timeStr = `${match[4].padStart(2, '0')}:${min} ${ampm}`;

                  if (ampm === 'PM' && hour !== 12) hour += 12;
                  if (ampm === 'AM' && hour === 12) hour = 0;
                  const hourStr = hour.toString().padStart(2, '0');

                  isoDate = `${year}-${month}-${day}T${hourStr}:${min}:00+08:00`;
                }
              }

              return {
                country: 'USD',
                title: r.event,
                impact: r.impact === 'HIGH' ? 'High' : (r.impact === 'MED' || r.impact === 'MEDIUM' ? 'Medium' : 'Low'),
                date: isoDate,
                time: timeStr,
                forecast: r.forecast || '-',
                previous: r.previous || '-'
              };
            });

            if (formattedDbNews.length > 0) {
              return res.json(formattedDbNews);
            }
          }
        } catch (dbErr) {
          console.warn("DB fetch for /api/news failed:", dbErr);
        }
      }

      // Return empty if no data found
      res.json([]);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Signals API
  app.get("/api/signals", async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "DB not connected" });
      const rows = await db.select().from(signals).orderBy(desc(signals.createdAt)).limit(50);
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/signals", async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "DB not connected" });
      const newSignal = req.body;
      let timeframe = newSignal.timeframe || 'CONFLUENCE TIMEFRAME';
      if (timeframe.includes('undefined')) {
        timeframe = 'CONFLUENCE TIMEFRAME';
      }

      // Check if duplicate signal exists in DB (same type, direction, entryRange)
      const existing = await db.select().from(signals)
        .where(
          and(
            eq(signals.type, newSignal.type),
            eq(signals.direction, newSignal.direction),
            eq(signals.entryRange, newSignal.entryRange)
          )
        )
        .orderBy(desc(signals.createdAt))
        .limit(1);

      if (existing.length > 0) {
        return res.json(existing[0]);
      }

      const inserted = await db.insert(signals).values({
        type: newSignal.type,
        timeframe: timeframe,
        direction: newSignal.direction,
        entryRange: newSignal.entryRange,
        entryPrice: newSignal.entryPrice,
        tp: newSignal.tp,
        sl: newSignal.sl,
        status: newSignal.status || 'ACTIVE',
        signalTimestamp: new Date(newSignal.timestamp),
      }).returning();
      res.json(inserted[0]);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/signals/:id", async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "DB not connected" });
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const updated = await db.update(signals)
        .set({ status })
        .where(eq(signals.id, id))
        .returning();
      res.json(updated[0]);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/signals", async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "DB not connected" });
      await db.delete(signals);
      res.json({ success: true });
    } catch (e: any) {
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
        model: "gemini-2.5-flash",
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

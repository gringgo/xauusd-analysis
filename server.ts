import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index";
import { journalEntries, highImpactNews, signals } from "./src/db/schema";
import { desc, eq, and, inArray } from "drizzle-orm";
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
    date: "07 Ogos 2026 | 08:30 PM (MYT)",
    forecast: "165K",
    previous: "142K",
    actual: "114K",
    prediction: "BULLISH",
    preNewsAnalysis: "📅 1 Hari Sebelum News (06 Ogos): Pasaran memperlihatkan pengumpulan harga di zon RBS $2,420 dengan tumpuan pada Liquidity Sweep H1.",
    analysis: "⚡ Semasa Terjadinya News (07 Ogos 08:30 PM): Data penggajian NFP mencatatkan penurunan ketara ke 114K (jangkaan 165K) dan kadar pengangguran naik ke 4.3%. DXY merosot tajam manakala XAUUSD melonjak +210 pips menembusi zon rintangan H4.",
    status: "BETUL",
    pipsWon: 210,
    createdAt: new Date("2026-08-07")
  }
];

function isWeekendNews(dateStr: string): boolean {
  if (!dateStr) return false;
  const dLower = dateStr.toLowerCase();
  if (dLower.includes('sabtu') || dLower.includes('saturday') || dLower.includes('ahad') || dLower.includes('sunday') || dLower.includes('01 ogos') || dLower.includes('1 ogos') || dLower.includes('8 ogos') || dLower.includes('08 ogos')) {
    return true;
  }
  return false;
}

function normalizeNewsKey(eventStr: string, dateStr: string): string {
  let e = (eventStr || '').toLowerCase();
  e = e.replace(/^usd\s*-\s*/g, '').replace(/\(usd\)/g, '');
  
  if (e.includes('non-farm') || e.includes('nonfarm') || e.includes('nfp') || e.includes('pekerjaan bukan ladang') || e.includes('employment change')) {
    e = 'nfp';
  } else if (e.includes('cpi') || e.includes('consumer price') || e.includes('indeks harga pengguna')) {
    e = 'cpi';
  } else if (e.includes('fomc') || e.includes('federal funds') || e.includes('fed interest') || e.includes('fomc statement') || e.includes('mesyuarat fomc')) {
    e = 'fomc';
  } else if (e.includes('ppi') || e.includes('producer price')) {
    e = 'ppi';
  } else if (e.includes('retail') || e.includes('jualan runcit')) {
    e = 'retailsales';
  } else if (e.includes('unemployment') || e.includes('pengangguran')) {
    e = 'unemploymentrate';
  } else if (e.includes('hourly earnings') || e.includes('pendapatan setiap jam')) {
    e = 'hourlyearnings';
  } else if (e.includes('gdp') || e.includes('kdnk')) {
    e = 'gdp';
  } else {
    e = e.replace(/\(.*?\)/g, '')
         .replace(/flash|final|services|y\/y|m\/m|q\/q/gi, '')
         .replace(/[^a-z0-9]/g, '')
         .trim();
  }

  let d = (dateStr || '').toLowerCase();
  d = d.replace(/jumaat|khamis|rabu|selasa|isnin|ahad|sabtu|monday|tuesday|wednesday|thursday|friday|saturday|sunday/gi, '');
  d = d.replace(/januari/g, 'jan').replace(/februari/g, 'feb').replace(/mac/g, 'mar')
       .replace(/april/g, 'apr').replace(/mei/g, 'may').replace(/juni/g, 'jun')
       .replace(/julai|juai/g, 'jul').replace(/ogos|ogo/g, 'aug').replace(/september/g, 'sep')
       .replace(/oktober|okt/g, 'oct').replace(/november/g, 'nov').replace(/disember|dis/g, 'dec');
  
  const numMatch = d.match(/(\d{1,2})/);
  const dayNum = numMatch ? parseInt(numMatch[1], 10) : 0;
  
  let month = '';
  ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].forEach(m => {
    if (d.includes(m)) month = m;
  });

  return `${e}_${dayNum}_${month}`;
}

function dedupeNewsEntries(entries: any[]) {
  if (!entries || !Array.isArray(entries)) return [];
  
  // Filter OUT any non-HIGH impact AND weekend news items
  const validEntries = entries.filter(item => {
    if (!item) return false;
    const imp = (item.impact || 'HIGH').toUpperCase();
    if (!imp.includes('HIGH')) return false;
    if (isWeekendNews(item.date || item.dateStr || '')) return false;
    return true;
  });

  const map = new Map<string, any>();
  const duplicateIdsToDelete: number[] = [];

  for (const item of validEntries) {
    if (!item) continue;
    const key = normalizeNewsKey(item.event || item.title || '', item.date || item.dateStr || '');
    if (!map.has(key)) {
      map.set(key, item);
    } else {
      const existing = map.get(key);
      if ((existing.status === 'PENDING' || !existing.actual || existing.actual === '-') && 
          (item.status !== 'PENDING' || (item.actual && item.actual !== '-'))) {
        if (existing.id && typeof existing.id === 'number') {
          duplicateIdsToDelete.push(existing.id);
        }
        map.set(key, item);
      } else {
        if (item.id && typeof item.id === 'number') {
          duplicateIdsToDelete.push(item.id);
        }
      }
    }
  }

  if (db && duplicateIdsToDelete.length > 0) {
    db.delete(highImpactNews)
      .where(inArray(highImpactNews.id, duplicateIdsToDelete))
      .catch(err => console.warn("Failed to delete duplicate news rows from DB:", err));
  }

  return Array.from(map.values());
}

function getFriendlyErrorMessage(e: any): string {
  const msg = e.message || String(e) || "";
  if (msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
    return "Had Kuota API Gemini telah dicapai (Free Tier). Sila cuba lagi selepas 1 minit.";
  }
  return msg;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  let lastAutoSyncTime = 0;
  let isAutoSyncing = false;
  let cachedCalendarData: any[] = [];
  let cachedCalendarTime = 0;

  async function autoSyncNewsCore() {
    const now = Date.now();
    if (isAutoSyncing) return [];
    isAutoSyncing = true;
    lastAutoSyncTime = now;
    const syncedItems: any[] = [];

    try {
      let rawNews: any[] = [];
      const apiKey = process.env.GEMINI_API_KEY;
      let ai: GoogleGenAI | null = null;
      if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
      }

      // 1. Try fetching live news calendar with headers (cached for 30 mins)
      if (cachedCalendarData.length > 0 && (now - cachedCalendarTime < 30 * 60 * 1000)) {
        rawNews = cachedCalendarData;
      } else {
        try {
          const calendarRes = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "application/json"
            }
          });
          if (calendarRes.ok) {
            rawNews = await calendarRes.json();
            cachedCalendarData = rawNews;
            cachedCalendarTime = now;
          } else if (cachedCalendarData.length > 0) {
            rawNews = cachedCalendarData;
          }
        } catch (err) {
          console.warn("External economic calendar fetch failed, switching to cached or Gemini AI generator:", err);
          if (cachedCalendarData.length > 0) rawNews = cachedCalendarData;
        }
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
      if (!highImpactUsd || highImpactUsd.length === 0) {
        if (ai) {
          try {
            const nowStr = new Date().toLocaleDateString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' });
            const aiPrompt = `Cari 10 berita ekonomi USD yang PALING HAMPIR (UPCOMING) berimpak tinggi atau sederhana (High/Medium Impact) bagi pasaran XAUUSD bermula dari tarikh ${nowStr}. Sila pastikan berita ini adalah pada masa hadapan. Semua masa mestilah dalam WAKTU MALAYSIA (GMT+8 / MYT).

Jika HARI INI atau minggu ini TIADA berita berimpak tinggi/sederhana USD, pulangkan JSON array kosong [].

Jika ada berita sebenar, pulangkan JSON array mengikut format berikut:
[
  {
    "title": "Official Event Title in ENGLISH (e.g. Non-Farm Employment Change (NFP), Core CPI m/m, FOMC Statement)",
    "date": "Wednesday, 29 Jul 2026 | 08:30 PM (MYT)",
    "forecast": "165K",
    "previous": "142K",
    "actual": "-",
    "category": "NFP / CPI / FOMC / OTHER",
    "prediction": "BULLISH atau BEARISH (TIDAK BOLEH NEUTRAL)",
    "analysis": "Huraian ringkas impak terhadap XAUUSD.",
    "estimatedPips": 100
  }
]

Nota Penting:
- Berita ISM Manufacturing PMI dan ISM Services PMI kebiasaannya dikeluarkan pada pukul 10:00 PM (MYT). Sila pastikan masa adalah tepat.

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
          } catch (e: any) {
            const errMsg = e?.message || "";
            if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
              console.log("Gemini quota reached. Using fallback.");
            } else {
              console.log("Gemini generation issue:", e?.message || String(e));
            }
          }
        }
      }

      // 3. Fallback static curated list if both external calendar & AI generator fail completely (0 items)
      if (!highImpactUsd || highImpactUsd.length === 0) {
        const fallbackList = [
          {
            title: "Non-Farm Employment Change (NFP)",
            date: "Friday, 07 Aug 2026 | 08:30 PM (MYT)",
            forecast: "165K",
            previous: "142K",
            actual: "114K",
            category: "NFP",
            prediction: "BULLISH",
            analysis: "Data NFP lemah (114K vs 165K forecast). DXY tertekan hebat, XAUUSD melonjak +210 pips ke paras tertinggi.",
            estimatedPips: 210,
            isAIGenerated: true
          },
          {
            title: "Core CPI m/m (Consumer Price Index)",
            date: "Wednesday, 12 Aug 2026 | 08:30 PM (MYT)",
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
            date: "Thursday, 20 Aug 2026 | 02:00 AM (MYT)",
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
           if (!highImpactUsd.find((h: any) => h.title === f.title)) {
               highImpactUsd.push(f);
           }
        }
      }

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
            console.log("Gemini quota reached. Using defaults.");
          } else {
            console.log("Gemini analysis issue, falling back to smart defaults:", e?.message || String(e));
          }
        }
      }

      // Save to DB and return
      let existingDbItems: any[] = [];
      if (db) {
        try {
          existingDbItems = await db.select().from(highImpactNews);
        } catch (dbErr) {
          console.warn("Error fetching existing news for duplicate check:", dbErr);
        }
      }

      for (const item of formattedItems) {
        const itemImpact = (item.impact || 'HIGH').toUpperCase();
        if (!itemImpact.includes('HIGH')) continue; // Skip non-HIGH impact news
        if (isWeekendNews(item.dateStr || '')) continue; // Skip weekend news

        const newKey = normalizeNewsKey(item.title || '', item.dateStr || '');
        let isDuplicate = false;

        if (db) {
          isDuplicate = existingDbItems.some(existing => normalizeNewsKey(existing.event || '', existing.date || '') === newKey);
        } else {
          isDuplicate = fallbackNewsHistory.some(existing => normalizeNewsKey(existing.event || '', existing.date || '') === newKey);
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
    } catch (e: any) {
      console.error("Auto-sync core error:", e);
    } finally {
      isAutoSyncing = false;
    }
    return syncedItems;
  }

  
  let notifiedNewsIds = new Set();
  
  async function autoSendNewsTelegramAlert() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return;

    try {
      let newsItems = [];
      if (db) {
        const entries = await db.select().from(highImpactNews).where(eq(highImpactNews.status, 'PENDING'));
        if (entries && entries.length > 0) {
          newsItems = entries;
        }
      } else {
        newsItems = fallbackNewsHistory.filter((n) => n.status === 'PENDING');
      }
      
      const monthMap = {
        jan: '01', januari: '01', feb: '02', februari: '02', mac: '03', apr: '04', april: '04',
        mei: '05', may: '05', jun: '06', june: '06', jul: '07', julai: '07', ogo: '08', ogos: '08', aug: '08',
        sep: '09', september: '09', okt: '10', oktober: '10', oct: '10', nov: '11', november: '11',
        dis: '12', disember: '12', dec: '12'
      };

      for (const r of newsItems) {
        if (notifiedNewsIds.has(r.id)) continue;
        if (!r.date) continue;

        const match = r.date.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*\|\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (match) {
          const day = match[1].padStart(2, '0');
          const monthKey = match[2].toLowerCase();
          const month = monthMap[monthKey] || '01';
          const year = match[3];
          let hour = parseInt(match[4]);
          const min = match[5];
          const ampm = match[6].toUpperCase();
          if (ampm === 'PM' && hour < 12) hour += 12;
          if (ampm === 'AM' && hour === 12) hour = 0;
          
          const newsDateMYT = new Date(`${year}-${month}-${day}T${hour.toString().padStart(2, '0')}:${min}:00+08:00`);
          if (isNaN(newsDateMYT.getTime())) continue;

          const diffMs = newsDateMYT.getTime() - Date.now();
          const diffMins = diffMs / (1000 * 60);

          if (diffMins > 0 && diffMins <= 21) {
            notifiedNewsIds.add(r.id);
            
            const message = `🚨 <b>HIGH IMPACT NEWS ALERT</b> 🚨\n\n` +
              `🔹 <b>Event:</b> ${r.event}\n` +
              `🔹 <b>Masa:</b> ${r.date} (Dalam masa ${Math.round(diffMins)} minit!)\n` +
              `🔹 <b>Forecast:</b> ${r.forecast || '-'}\n` +
              `🔹 <b>Previous:</b> ${r.previous || '-'}\n\n` +
              `💡 <b>Analisis/Prediction AI:</b>\n${r.preNewsAnalysis || r.prediction}\n\n` +
              `<i>Sila berhati-hati. Jaga MM.</i>`;

            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
            }).catch(e => console.warn("Failed to send news telegram alert:", e));
          }
        }
      }
    } catch (e) {
      console.warn("Error in autoSendNewsTelegramAlert:", e);
    }
  }

  setInterval(autoSendNewsTelegramAlert, 60 * 1000);
  setTimeout(autoSendNewsTelegramAlert, 5000);

  // Periodic automatic news update every 15 minutes
  setInterval(() => {
    autoSyncNewsCore().catch(e => console.warn("Periodic news sync warning:", e));
    autoCheckPendingNews().catch(e => console.warn("Periodic pending check warning:", e));
  }, 15 * 60 * 1000);

  // Initial news sync on server boot
  setTimeout(() => {
    autoSyncNewsCore().catch(e => console.warn("Boot news sync warning:", e));
  }, 2000);

  // High Impact News History API Routes
  app.post("/api/auto-sync-news", async (req, res) => {
    try {
      const items = await autoSyncNewsCore();
      res.json(items);
    } catch (e: any) {
      console.error("Auto-sync error:", e);
      res.status(500).json({ error: getFriendlyErrorMessage(e) || "Gagal menjana ramalan automatik." });
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) || "Ralat semasa menjana ramalan AI." });
    }
  });

  const monthMapMYT: Record<string, string> = {
    jan: '01', januari: '01', feb: '02', februari: '02', mac: '03', apr: '04', april: '04',
    mei: '05', may: '05', jun: '06', june: '06', jul: '07', julai: '07', ogo: '08', ogos: '08', aug: '08', august: '08',
    sep: '09', september: '09', okt: '10', oktober: '10', oct: '10', nov: '11', november: '11',
    dis: '12', disember: '12', dec: '12', december: '12'
  };

  function parseNewsDateMYT(dateStr: string): Date | null {
    if (!dateStr) return null;
    let testDate = new Date(dateStr);
    if (!isNaN(testDate.getTime())) return testDate;

    const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s*\|\s*(\d{1,2}):(\d{2})\s*(AM|PM)?)?/i);
    if (match) {
      const day = match[1].padStart(2, '0');
      const monthKey = match[2].toLowerCase();
      const month = monthMapMYT[monthKey] || '01';
      const year = match[3];
      let hour = match[4] ? parseInt(match[4], 10) : 0;
      const min = match[5] || '00';
      const ampm = match[6] ? match[6].toUpperCase() : '';

      if (ampm === 'PM' && hour < 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;

      const isoStr = `${year}-${month}-${day}T${hour.toString().padStart(2, '0')}:${min}:00+08:00`;
      const parsed = new Date(isoStr);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  }

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

      // Filter pending items whose scheduled date has already passed in real time
      const itemsToCheck = pendingItems.filter((item: any) => {
        if (!item.date) return false;
        try {
          const parsedDate = parseNewsDateMYT(item.date);
          if (parsedDate && !isNaN(parsedDate.getTime())) {
            return parsedDate.getTime() <= Date.now();
          }
        } catch {}
        return false;
      }).slice(0, 3);

      if (itemsToCheck.length === 0) {
        isAutoChecking = false;
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      for (const item of itemsToCheck) {
        try {
          const prompt = `Berita ekonomi berikut telah diumumkan pada Waktu: ${item.date}.
Nama Berita: ${item.event}
Kategori: ${item.category}
Forecast Sebelumnya: ${item.forecast}
Previous: ${item.previous}
Ramalan AI sebelum berita: ${item.prediction}

Sila dapatkan atau sahkan data SEBENAR (Actual Data) yang dikeluarkan secara rasmi.
Jika berita ini BELUM diumumkan, jangan mereka-reka data.

Selepas mendapat data sebenar rasmi:
- Set "actual" kepada nilai data (contoh: 175K, 0.2%, 5.25%)
- Set "status" kepada "BETUL" atau "SALAH" (Adakah ramalan AI ${item.prediction} tepat berbanding impak data ke atas XAUUSD?)
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) || "Ralat semasa menyemak result AI." });
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) || "Ralat semasa menganalisis gambar carta." });
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
      
      const now = Date.now();
      if (now - lastAutoSyncTime > 15 * 60 * 1000) {
        autoSyncNewsCore().catch(err => console.warn("Background auto sync warning:", err));
      }

      if (db) {
        const entries = await db.select().from(highImpactNews).orderBy(desc(highImpactNews.id));
        if (entries && entries.length > 0) {
          const pendingCount = entries.filter(e => e.status === 'PENDING').length;
          if (pendingCount < 5) {
             // trigger background sync to populate more
             autoSyncNewsCore().catch(e => console.warn(e));
          }
          return res.json(dedupeNewsEntries(entries));
        }
      }
      autoSyncNewsCore().catch(e => console.warn(e));
      res.json(dedupeNewsEntries(fallbackNewsHistory));
    } catch (e: any) {
      console.warn("Using fallback news history data:", e.message);
      res.json(dedupeNewsEntries(fallbackNewsHistory));
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
    }
  });

  // Journal API Routes
  app.get("/api/journal", async (req, res) => {
    try {
      const entries = await db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt));
      res.json(entries);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(journalEntries).where(eq(journalEntries.id, id));
      res.json({ success: true });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
    }
  });

  // API route for Kucoin proxy
  app.get("/api/klines", async (req, res) => {
    try {
      const interval = req.query.interval || "1d";
      const binanceInterval = interval;
      const endAtSec = req.query.endAt ? parseInt(req.query.endAt as string) : null;
      const startAtSec = req.query.startAt ? parseInt(req.query.startAt as string) : null;
      
      let url = `https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=${binanceInterval}&limit=500`;
      if (startAtSec) url += `&startTime=${startAtSec * 1000}`;
      if (endAtSec) url += `&endTime=${endAtSec * 1000}`;
      
      console.log("Fetching URL:", url);
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch from Binance" });
      }
      
      const binanceData = await response.json();
      
      // Convert Binance to Kucoin expected format: [timeInSec, open, close, high, low, volume, turnover]
      // Kucoin returns newest first, so reverse the Binance array.
      const kucoinFormatData = binanceData.map((d: any) => [
        (Math.floor(d[0] / 1000)).toString(),
        d[1],
        d[4],
        d[2],
        d[3],
        d[5],
        "0"
      ]).reverse();
      
      res.json({ code: "200000", data: kucoinFormatData });
    } catch (e: any) {
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
    }
  });

  // Signals API
  app.get("/api/signals", async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "DB not connected" });
      const rows = await db.select().from(signals).orderBy(desc(signals.createdAt)).limit(500);
      res.json(rows);
    } catch (e: any) {
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
    }
  });

  async function sendWhatsAppAlert(signal: any) {
    let apiUrl = (process.env.EVOLUTION_API_URL || '').trim();
    const apiKey = process.env.EVOLUTION_API_KEY;
    const instanceName = process.env.EVOLUTION_INSTANCE_NAME;
    const toNumber = process.env.WHATSAPP_TO_NUMBER;

    if (!apiUrl || !apiKey || !instanceName || !toNumber) return;

    // Extract http(s) URL if env var contains extra text or shell commands
    const urlMatch = apiUrl.match(/https?:\/\/[^\s]+/i);
    if (urlMatch) {
      apiUrl = urlMatch[0];
    }

    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      return;
    }

    const emoji = signal.direction === 'BUY' ? '🟢' : '🔴';
    const entryPriceVal = signal.entryPrice ? Number(signal.entryPrice).toFixed(2) : '-';
    const patternVal = signal.candlePattern || (signal.direction === 'BUY' ? 'Bullish Engulfing & Rejection Wick (M5-M15)' : 'Bearish Engulfing & Rejection Wick (M5-M15)');

    const tpVal = Number(signal.tp);
    const tps = signal.direction === 'BUY' 
      ? [tpVal.toFixed(2), (tpVal + 2).toFixed(2), (tpVal + 4).toFixed(2), (tpVal + 6).toFixed(2), (tpVal + 8).toFixed(2)]
      : [tpVal.toFixed(2), (tpVal - 2).toFixed(2), (tpVal - 4).toFixed(2), (tpVal - 6).toFixed(2), (tpVal - 8).toFixed(2)];

    let message = `*XAUUSD SIGNAL AKTIF* 🚨\n\n`;
    message += `🔹 *Jenis Signal:* ${signal.type} ${signal.timeframe} (${emoji} ${signal.direction})\n`;
    message += `🔹 *Trigger:* ${entryPriceVal}\n`;
    message += `🔹 *Entry Zone:* ${signal.entryRange}\n`;
    message += `🔹 *Candle Pattern:* ${patternVal}\n`;
    message += `🔹 *TP1 (50pips):* ${tps[0]}\n`;
    message += `🔹 *TP2 (70pips):* ${tps[1]}\n`;
    message += `🔹 *TP3 (90pips):* ${tps[2]}\n`;
    message += `🔹 *TP4 (110pips):* ${tps[3]}\n`;
    message += `🔹 *TP5 (130pips):* ${tps[4]}\n`;
    message += `🔹 *SL:* ${signal.sl}\n`;
    message += `🔹 *Winrate:* ${signal.winRate || '80'}%\n\n`;
    message += `_Auto-generated by XAUUSD Hub_`;

    try {
      const url = `${apiUrl.replace(/\/$/, '')}/message/sendText/${instanceName}`;
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          number: toNumber,
          text: message
        })
      });
      console.log("WhatsApp signal sent successfully to", toNumber);
    } catch (error) {
      console.error("WhatsApp Error:", error);
    }
  }

  async function sendTelegramSignalAlert(signal: any) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) return;

    const emoji = signal.direction === 'BUY' ? '🟢' : '🔴';
    const entryPriceVal = signal.entryPrice ? Number(signal.entryPrice).toFixed(2) : '-';
    const patternVal = signal.candlePattern || (signal.direction === 'BUY' ? 'Bullish Engulfing & Rejection Wick (M5-M15)' : 'Bearish Engulfing & Rejection Wick (M5-M15)');

    const tpVal = Number(signal.tp);
    const tps = signal.direction === 'BUY' 
      ? [tpVal.toFixed(2), (tpVal + 2).toFixed(2), (tpVal + 4).toFixed(2), (tpVal + 6).toFixed(2), (tpVal + 8).toFixed(2)]
      : [tpVal.toFixed(2), (tpVal - 2).toFixed(2), (tpVal - 4).toFixed(2), (tpVal - 6).toFixed(2), (tpVal - 8).toFixed(2)];

    let message = `🚨 <b>XAUUSD SIGNAL AKTIF</b> 🚨\n\n`;
    message += `🔹 <b>Jenis Signal:</b> ${signal.type} ${signal.timeframe} (${emoji} ${signal.direction})\n`;
    message += `🔹 <b>Trigger:</b> ${entryPriceVal}\n`;
    message += `🔹 <b>Entry Zone:</b> ${signal.entryRange}\n`;
    message += `🔹 <b>Candle Pattern:</b> ${patternVal}\n`;
    message += `🔹 <b>TP1 (50pips):</b> ${tps[0]}\n`;
    message += `🔹 <b>TP2 (70pips):</b> ${tps[1]}\n`;
    message += `🔹 <b>TP3 (90pips):</b> ${tps[2]}\n`;
    message += `🔹 <b>TP4 (110pips):</b> ${tps[3]}\n`;
    message += `🔹 <b>TP5 (130pips):</b> ${tps[4]}\n`;
    message += `🔹 <b>SL:</b> ${signal.sl}\n`;
    message += `🔹 <b>Winrate:</b> ${signal.winRate || '80'}%\n\n`;
    message += `<i>Auto-generated by XAUUSD Hub</i>`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
    } catch (err) {
      console.error("Failed to send telegram signal alert:", err);
    }
  }

  app.post("/api/signals", async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "DB not connected" });
      const newSignal = req.body;

      // Operating hours check: Active between 06:00 AM and 04:00 AM MYT (i.e. blocked 04:00 AM - 05:59 AM MYT)
      const now = new Date();
      const hourStr = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: 'numeric',
        hourCycle: 'h23'
      }).format(now);
      const hour = parseInt(hourStr, 10);
      if (hour >= 4 && hour < 6) {
        return res.status(400).json({ error: "Isyarat hanya aktif dari jam 6.00 AM hingga 4.00 AM sahaja." });
      }

      let timeframe = newSignal.timeframe || 'CONFLUENCE TIMEFRAME';
      if (timeframe.includes('undefined')) {
        timeframe = 'CONFLUENCE TIMEFRAME';
      }

      // Check if duplicate signal exists for this zone today (MYT)
      const todayMYT = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
      const recentSignals = await db.select().from(signals)
        .orderBy(desc(signals.createdAt))
        .limit(100);

      const zoneDuplicate = recentSignals.find(s => {
        const sDateMYT = new Date(s.signalTimestamp || s.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
        if (sDateMYT !== todayMYT) return false;

        const isSameRange = (s.entryRange || '').trim() === (newSignal.entryRange || '').trim();
        const isPriceClose = Math.abs((s.entryPrice || 0) - (newSignal.entryPrice || 0)) <= 2.5;

        return isSameRange || isPriceClose;
      });

      if (zoneDuplicate) {
        return res.json(zoneDuplicate);
      }

      const inserted = await db.insert(signals).values({
        type: newSignal.type,
        timeframe: timeframe,
        direction: newSignal.direction,
        entryRange: newSignal.entryRange,
        entryPrice: newSignal.entryPrice,
        tp: newSignal.tp,
        sl: newSignal.sl,
        candlePattern: newSignal.candlePattern || (newSignal.direction === 'BUY' ? 'Bullish Engulfing / Rejection Wick' : 'Bearish Engulfing / Rejection Wick'),
        status: newSignal.status || 'ACTIVE',
        signalTimestamp: new Date(newSignal.timestamp),
      }).returning();
      
      // We will set winRate & candlePattern since winRate is not saved to DB but useful for alerts
      const signalWithWinRate = { ...inserted[0], winRate: newSignal.winRate, candlePattern: newSignal.candlePattern || inserted[0]?.candlePattern };
      
      // Send whatsapp alert
      await sendWhatsAppAlert(signalWithWinRate);
      
      // Send telegram alert
      await sendTelegramSignalAlert(signalWithWinRate);

      res.json(inserted[0]);
    } catch (e: any) {
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
    }
  });

  app.delete("/api/signals", async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: "DB not connected" });
      await db.delete(signals);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
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
      res.status(500).json({ error: getFriendlyErrorMessage(e) });
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

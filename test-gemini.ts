import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
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
            console.log(aiGenRes.text);
}
test();

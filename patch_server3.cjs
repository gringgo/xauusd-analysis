const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the filter part
const oldFilter = `let highImpactUsd = rawNews.filter((n: any) => 
        n.country === 'USD' && (n.impact === 'High' || n.impact === 'Medium')
      );`;

const newFilter = `let highImpactUsd = rawNews.filter((n: any) => {
        if (n.country !== 'USD') return false;
        if (n.impact !== 'High' && n.impact !== 'Medium') return false;
        
        // Only keep future news
        if (n.date) {
           const d = new Date(n.date).getTime();
           if (!isNaN(d) && d < Date.now()) return false;
        }
        return true;
      });`;

code = code.replace(oldFilter, newFilter);

// We should also modify the AI prompt to ask for "BERIKUTNYA" (upcoming) 10 items instead of "minggu ini".
const oldPrompt = "Semak takwim ekonomi rasmi (Forex Factory / Economic Calendar) untuk berita berimpak tinggi atau sederhana (High/Medium Impact) bagi USD minggu ini (bermula tarikh ${nowStr}) untuk pasaran XAUUSD (Emas) dalam WAKTU MALAYSIA (GMT+8 / MYT).";
const newPrompt = "Cari 10 berita ekonomi USD yang PALING HAMPIR (UPCOMING) berimpak tinggi atau sederhana (High/Medium Impact) bagi pasaran XAUUSD bermula dari tarikh ${nowStr}. Sila pastikan berita ini adalah pada masa hadapan. Semua masa mestilah dalam WAKTU MALAYSIA (GMT+8 / MYT).";
code = code.replace(oldPrompt, newPrompt);

// Make sure we take the top 10 items regardless.
const oldSlice = "const itemsToProcess = highImpactUsd.slice(0, 10);";
const newSlice = `
      // Sort by date ascending to get nearest
      highImpactUsd.sort((a, b) => {
         const da = new Date(a.date).getTime();
         const db = new Date(b.date).getTime();
         return (isNaN(da) ? Infinity : da) - (isNaN(db) ? Infinity : db);
      });
      const itemsToProcess = highImpactUsd.slice(0, 10);
`;
code = code.replace(oldSlice, newSlice);

fs.writeFileSync('server.ts', code);

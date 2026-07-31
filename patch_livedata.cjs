const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

const parseMalayDateCode = `
const parseMalayDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    try {
      const cleaned = dateStr.replace(/\(MYT\)/g, '').trim();
      const parts = cleaned.split('|');
      if (parts.length < 2) {
        const ms = new Date(dateStr).getTime();
        return isNaN(ms) ? 0 : ms;
      }
      
      let [datePart, timePart] = parts;
      datePart = datePart.trim();
      datePart = datePart.replace(/^[a-zA-Z]+,\\s*/, '');
      timePart = timePart.trim();

      const months: Record<string, string> = {
        'Januari': 'Jan', 'Februari': 'Feb', 'Mac': 'Mar', 'Mei': 'May',
        'Julai': 'Jul', 'Ogos': 'Aug', 'Ogo': 'Aug', 'Oktober': 'Oct', 'Okt': 'Oct',
        'Disember': 'Dec', 'Dis': 'Dec'
      };

      let englishDatePart = datePart;
      for (const [my, en] of Object.entries(months)) {
        if (datePart.includes(my)) {
          englishDatePart = datePart.replace(my, en);
          break;
        }
      }

      const finalDateStr = \`\${englishDatePart} \${timePart} GMT+0800\`;
      const ms = new Date(finalDateStr).getTime();
      return isNaN(ms) ? 0 : ms;
    } catch (e) {
      return 0;
    }
  };
`;

// Insert the parseMalayDateCode after getNewsTradeSuggestion
code = code.replace(/export function getNewsTradeSuggestion[\s\S]*?return \{\s*action: 'NEUTRAL',\s*suggestion: 'NEUTRAL',\s*estimatedPips: 0,\s*reason: 'Tiada ramalan yang jelas.'\s*\};\s*\}/, match => match + '\n' + parseMalayDateCode);


// Now replace the fetch logic in getLiveAnalysis
const oldFetchRegex = /let liveNewsData = \[\];[\s\S]*?formattedNews = \[\{ time: "-", event: "Tiada news USD berimpak tinggi hari ini", impact: "-" \}\];\s*\}/;

const newFetchLogic = `
  let formattedNews: any[] = [];
  try {
    const newsRes = await fetchWithTimeout('/api/news-history');
    if (newsRes.ok) {
      const allNews = await newsRes.json();
      
      if (Array.isArray(allNews)) {
         // Filter pending only
         const pendingNews = allNews.filter(n => n.status === 'PENDING');
         
         // Sort by nearest upcoming
         const now = Date.now();
         pendingNews.sort((a, b) => {
            const diffA = Math.abs(parseMalayDate(a.date) - now);
            const diffB = Math.abs(parseMalayDate(b.date) - now);
            return diffA - diffB;
         });

         // Always get 10 items
         const upcoming10 = pendingNews.slice(0, 10);

         formattedNews = upcoming10.map(n => {
            // Already has full format: "Jumaat, 31 Jul 2026 | 08:30 PM (MYT)"
            // We'll separate the time and date for display.
            const parts = n.date.split('|');
            const displayTime = parts.length > 1 ? parts[1].replace('(MYT)', '').trim() : n.date;

            return {
              time: displayTime,
              dateISO: new Date(parseMalayDate(n.date)).toISOString(),
              event: n.event || n.title,
              impact: (n.impact || 'HIGH').toUpperCase(),
              forecast: n.forecast || '-',
              previous: n.previous || '-',
              action: n.prediction === 'BULLISH' ? 'BUY' : n.prediction === 'BEARISH' ? 'SELL' : 'NEUTRAL',
              suggestion: n.prediction === 'BULLISH' ? 'BUY XAUUSD' : n.prediction === 'BEARISH' ? 'SELL XAUUSD' : 'NEUTRAL',
              estimatedPips: \`~\${n.estimatedPips || 150} PIPS\`,
              reason: n.analysis || ''
            };
         });
      }
    }
  } catch (e) {
    console.error("Failed to fetch live news:", e);
  }

  if (formattedNews.length === 0) {
    formattedNews = [{ time: "-", event: "Tiada berita menunggu/pending.", impact: "INFO", forecast: "-", previous: "-", action: "NEUTRAL", suggestion: "TIADA TRADE", estimatedPips: "0 PIPS", reason: "Sila klik butang Auto-Sync AI." }];
  }
`;

code = code.replace(oldFetchRegex, newFetchLogic);

fs.writeFileSync('src/liveData.ts', code);

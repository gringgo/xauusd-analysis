const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const newCode = `
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

        const match = r.date.match(/(\\d{1,2})\\s+([A-Za-z]+)\\s+(\\d{4})\\s*\\|\\s*(\\d{1,2}):(\\d{2})\\s*(AM|PM)/i);
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
          
          const newsDateMYT = new Date(\`\${year}-\${month}-\${day}T\${hour.toString().padStart(2, '0')}:\${min}:00+08:00\`);
          if (isNaN(newsDateMYT.getTime())) continue;

          const diffMs = newsDateMYT.getTime() - Date.now();
          const diffMins = diffMs / (1000 * 60);

          if (diffMins > 0 && diffMins <= 21) {
            notifiedNewsIds.add(r.id);
            
            const message = \`🚨 <b>HIGH IMPACT NEWS ALERT</b> 🚨\\n\\n\` +
              \`🔹 <b>Event:</b> \${r.event}\\n\` +
              \`🔹 <b>Masa:</b> \${r.date} (Dalam masa \${Math.round(diffMins)} minit!)\\n\` +
              \`🔹 <b>Forecast:</b> \${r.forecast || '-'}\\n\` +
              \`🔹 <b>Previous:</b> \${r.previous || '-'}\\n\\n\` +
              \`💡 <b>Analisis/Prediction AI:</b>\\n\${r.preNewsAnalysis || r.prediction}\\n\\n\` +
              \`<i>Sila berhati-hati. Jaga MM.</i>\`;

            const url = \`https://api.telegram.org/bot\${botToken}/sendMessage\`;
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
`;

const updated = content.replace(/\/\/ Periodic automatic news update every 15 minutes/, newCode + '\n  // Periodic automatic news update every 15 minutes');
fs.writeFileSync('server.ts', updated);

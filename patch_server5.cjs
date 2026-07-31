const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const fallbackRegex = /if \(!highImpactUsd \|\| highImpactUsd\.length < 10\) \{\s*const todayMsia[\s\S]*?\];\s*\}/;

const newFallback = `
      if (!highImpactUsd || highImpactUsd.length < 10) {
        const todayMsia = new Date().toLocaleDateString('ms-MY', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
        const fallbackList = [
          {
            title: "Non-Farm Employment Change (NFP)",
            date: \`\${todayMsia} | 08:30 PM (MYT)\`,
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
            date: \`\${todayMsia} | 08:30 PM (MYT)\`,
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
            date: \`\${todayMsia} | 02:00 AM (MYT)\`,
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
`;

code = code.replace(fallbackRegex, newFallback);
fs.writeFileSync('server.ts', code);

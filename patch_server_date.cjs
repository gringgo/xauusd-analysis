const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const interval = req\.query\.interval \|\| "1d";/,
  `const interval = req.query.interval || "1d";
      const endAt = req.query.endAt;
      const startAt = req.query.startAt;`
);

code = code.replace(
  /const response = await fetch\(\`https:\/\/api\.kucoin\.com\/api\/v1\/market\/candles\?type=\$\{type\}&symbol=PAXG-USDT\`\);/,
  `let url = \`https://api.kucoin.com/api/v1/market/candles?type=\${type}&symbol=PAXG-USDT\`;
      if (startAt) url += \`&startAt=\${startAt}\`;
      if (endAt) url += \`&endAt=\${endAt}\`;
      const response = await fetch(url);`
);

fs.writeFileSync('server.ts', code);

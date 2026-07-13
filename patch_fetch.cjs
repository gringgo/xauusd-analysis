const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

code = code.replace(
  /const \[d1Res, h4Res, h1Res\] = await Promise\.all\(\[[^\]]*\]\);/,
  `const [d1Res, h4Res, h1Res] = await Promise.all([
    fetch("https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=1d&limit=30"),
    fetch("https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=4h&limit=30"),
    fetch("https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=1h&limit=30")
  ]);

  if (!d1Res.ok) throw new Error("D1 fetch failed: " + d1Res.status);
  if (!h4Res.ok) throw new Error("H4 fetch failed: " + h4Res.status);
  if (!h1Res.ok) throw new Error("H1 fetch failed: " + h1Res.status);`
);

fs.writeFileSync('src/liveData.ts', code);

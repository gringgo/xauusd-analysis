const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

// Replace fetch section
code = code.replace(
  /const \[d1Res, h4Res, h1Res\] = await Promise\.all\(\[[\s\S]*?\]\);[\s\S]*?const d1 = parseCandles\(d1Raw\);/m,
  `const [d1Res, h4Res, h1Res] = await Promise.all([
    fetch("https://api.kucoin.com/api/v1/market/candles?type=1day&symbol=PAXG-USDT"),
    fetch("https://api.kucoin.com/api/v1/market/candles?type=4hour&symbol=PAXG-USDT"),
    fetch("https://api.kucoin.com/api/v1/market/candles?type=1hour&symbol=PAXG-USDT")
  ]);

  if (!d1Res.ok) throw new Error("D1 fetch failed: " + d1Res.status);
  if (!h4Res.ok) throw new Error("H4 fetch failed: " + h4Res.status);
  if (!h1Res.ok) throw new Error("H1 fetch failed: " + h1Res.status);
  
  const d1Raw = await d1Res.json();
  const h4Raw = await h4Res.json();
  const h1Raw = await h1Res.json();

  const d1 = parseCandles(d1Raw.data.slice(0, 30).reverse());
  const h4 = parseCandles(h4Raw.data.slice(0, 30).reverse());
  const h1 = parseCandles(h1Raw.data.slice(0, 30).reverse());`
);

// Replace parseCandles
code = code.replace(
  /function parseCandles\(data: any\[\]\) \{[\s\S]*?\}/m,
  `function parseCandles(data: any[]) {
  return data.map((d: any) => ({
    time: parseInt(d[0]) * 1000,
    open: parseFloat(d[1]),
    close: parseFloat(d[2]),
    high: parseFloat(d[3]),
    low: parseFloat(d[4])
  }));
}`
);

// Remove the `const h1 = parseCandles(h1Raw);` etc leftovers
code = code.replace(/const h4 = parseCandles\(h4Raw\);\s*const h1 = parseCandles\(h1Raw\);/m, "");

fs.writeFileSync('src/liveData.ts', code);

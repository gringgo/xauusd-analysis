const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

code = code.replace(
  /fetchWithTimeout\("\/api\/kucoin\/api\/v1\/market\/candles\?type=(1day|4hour|1hour)&symbol=PAXG-USDT"\)/g,
  function(match, p1) {
    let interval = "1d";
    if (p1 === "4hour") interval = "4h";
    if (p1 === "1hour") interval = "1h";
    return 'fetchWithTimeout("/api/klines?interval=' + interval + '")';
  }
);

fs.writeFileSync('src/liveData.ts', code);

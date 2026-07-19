const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

const sbrFunc = `
function findSBR_RBS(candles: any[], currentPrice: number) {
  const swings: any[] = [];
  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i];
    const isHigh = c.high > candles[i-1].high && c.high > candles[i-2].high && c.high > candles[i+1].high && c.high > candles[i+2].high;
    const isLow = c.low < candles[i-1].low && c.low < candles[i-2].low && c.low < candles[i+1].low && c.low < candles[i+2].low;
    if (isHigh) swings.push({ type: 'HIGH', val: c.high, index: i });
    if (isLow) swings.push({ type: 'LOW', val: c.low, index: i });
  }

  let sbr = null;
  let rbs = null;

  const brokenLows = swings.filter(s => s.type === 'LOW').reverse();
  for (const low of brokenLows) {
    let broken = false;
    for (let j = low.index + 1; j < candles.length; j++) {
      if (candles[j].close < low.val) {
        broken = true;
        break;
      }
    }
    if (broken && currentPrice <= low.val) {
      sbr = low.val;
      break;
    }
  }

  const brokenHighs = swings.filter(s => s.type === 'HIGH').reverse();
  for (const high of brokenHighs) {
    let broken = false;
    for (let j = high.index + 1; j < candles.length; j++) {
      if (candles[j].close > high.val) {
        broken = true;
        break;
      }
    }
    if (broken && currentPrice >= high.val) {
      rbs = high.val;
      break;
    }
  }

  return {
    sbr: sbr ? sbr.toFixed(2) : null,
    rbs: rbs ? rbs.toFixed(2) : null
  };
}
`;

// Find where to insert it, before findLiquidity
code = code.replace(/function findLiquidity/, match => sbrFunc + "\n" + match);

// Insert into the payload at the bottom
code = code.replace(/fvg: \{/, match => "sbr_rbs: {\n      h4: findSBR_RBS(h4, currentPrice),\n      h1: findSBR_RBS(h1, currentPrice)\n    },\n    " + match);

fs.writeFileSync('src/liveData.ts', code);

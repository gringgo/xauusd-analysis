const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

// Insert new helper functions below existing ones
const insertPos = code.indexOf('function findOrderBlock(candles: any[])');

const newFunctions = `
function findBothFVGs(candles: any[]) {
  let bullish = null;
  let bearish = null;
  for (let i = candles.length - 1; i >= 2; i--) {
    const c1 = candles[i - 2];
    const c2 = candles[i - 1];
    const c3 = candles[i];
    if (!bullish && c3.low > c1.high) {
      const avgPrice = (c3.low + c1.high) / 2;
      bullish = { direction: "BULLISH", top: c3.low, bottom: c1.high, candleIndex: i - 1, winRate: getWinRate(avgPrice) };
    }
    if (!bearish && c3.high < c1.low) {
      const avgPrice = (c1.low + c3.high) / 2;
      bearish = { direction: "BEARISH", top: c1.low, bottom: c3.high, candleIndex: i - 1, winRate: getWinRate(avgPrice) };
    }
    if (bullish && bearish) break;
  }
  return { bullish, bearish };
}

function findBothOrderBlocks(candles: any[]) {
  let bullish = null;
  let bearish = null;
  for (let i = candles.length - 1; i >= 2; i--) {
    const c1 = candles[i - 2];
    const c3 = candles[i];
    if (!bullish && c3.low > c1.high) {
      let obIndex = i - 2;
      while (obIndex >= 0 && candles[obIndex].close >= candles[obIndex].open) obIndex--;
      if (obIndex >= 0) {
        const avgPrice = (candles[obIndex].high + candles[obIndex].low) / 2;
        bullish = { direction: "BULLISH", top: candles[obIndex].high, bottom: candles[obIndex].low, type: "OB (Order Block)", winRate: getWinRate(avgPrice) };
      }
    }
    if (!bearish && c3.high < c1.low) {
      let obIndex = i - 2;
      while (obIndex >= 0 && candles[obIndex].close <= candles[obIndex].open) obIndex--;
      if (obIndex >= 0) {
        const avgPrice = (candles[obIndex].high + candles[obIndex].low) / 2;
        bearish = { direction: "BEARISH", top: candles[obIndex].high, bottom: candles[obIndex].low, type: "OB (Order Block)", winRate: getWinRate(avgPrice) };
      }
    }
    if (bullish && bearish) break;
  }
  return { bullish, bearish };
}

`;

code = code.slice(0, insertPos) + newFunctions + code.slice(insertPos);

fs.writeFileSync('src/liveData.ts', code);

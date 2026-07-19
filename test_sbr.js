function findSBR_RBS(candles, currentPrice) {
  const swings = [];
  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i];
    const isHigh = c.high > candles[i-1].high && c.high > candles[i-2].high && c.high > candles[i+1].high && c.high > candles[i+2].high;
    const isLow = c.low < candles[i-1].low && c.low < candles[i-2].low && c.low < candles[i+1].low && c.low < candles[i+2].low;
    if (isHigh) swings.push({ type: 'HIGH', val: c.high, index: i });
    if (isLow) swings.push({ type: 'LOW', val: c.low, index: i });
  }

  let sbr = null;
  let rbs = null;

  // For SBR: We need a swing LOW that was broken by a later candle closing below it, 
  // and the current price is below it (so it acts as resistance now)
  // Actually, price might be testing it. Let's just find the most recent broken low.
  const brokenLows = swings.filter(s => s.type === 'LOW').reverse();
  for (const low of brokenLows) {
    let broken = false;
    for (let j = low.index + 1; j < candles.length; j++) {
      if (candles[j].close < low.val) {
        broken = true;
        break;
      }
    }
    // If it's broken, and current price is below the low (so it is above us as resistance)
    if (broken && currentPrice <= low.val) {
      sbr = low.val;
      break;
    }
  }

  // For RBS: We need a swing HIGH that was broken by a later candle closing above it,
  // and the current price is above it (so it acts as support now)
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

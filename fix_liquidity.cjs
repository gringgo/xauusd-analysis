const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

const newFindLiquidity = `function findLiquidity(d1: any[], h4: any[], h1: any[], currentPrice: number) {
  const pdh = d1.length > 1 ? d1[d1.length - 2].high : currentPrice + 10;
  const pdl = d1.length > 1 ? d1[d1.length - 2].low : currentPrice - 10;
  
  const h4Swings: any[] = [];
  for (let i = 2; i < h4.length - 2; i++) {
    const c = h4[i];
    const isHigh = c.high > h4[i-1].high && c.high > h4[i-2].high && c.high > h4[i+1].high && c.high > h4[i+2].high;
    const isLow = c.low < h4[i-1].low && c.low < h4[i-2].low && c.low < h4[i+1].low && c.low < h4[i+2].low;
    if (isHigh) h4Swings.push({ type: 'HIGH', val: c.high, label: 'H4 Swing High' });
    if (isLow) h4Swings.push({ type: 'LOW', val: c.low, label: 'H4 Swing Low' });
  }

  const h1Swings: any[] = [];
  for (let i = 2; i < h1.length - 2; i++) {
    const c = h1[i];
    const isHigh = c.high > h1[i-1].high && c.high > h1[i-2].high && c.high > h1[i+1].high && c.high > h1[i+2].high;
    const isLow = c.low < h1[i-1].low && c.low < h1[i-2].low && c.low < h1[i+1].low && c.low < h1[i+2].low;
    if (isHigh) h1Swings.push({ type: 'HIGH', val: c.high, label: 'H1 Swing High' });
    if (isLow) h1Swings.push({ type: 'LOW', val: c.low, label: 'H1 Swing Low' });
  }

  const allSwings = [...h4Swings, ...h1Swings];
  
  const buySideSwings = allSwings.filter(s => s.type === 'HIGH' && s.val > currentPrice).sort((a,b) => a.val - b.val);
  const sellSideSwings = allSwings.filter(s => s.type === 'LOW' && s.val < currentPrice).sort((a,b) => b.val - a.val);

  let buySide = [];
  if (pdh > currentPrice) {
    buySide.push({ price: pdh.toFixed(2), label: "PDH (Previous Day High)" });
  } else {
    buySide.push({ price: pdh.toFixed(2), label: "PDH (Mitigated)" });
  }
  
  for (const swing of buySideSwings) {
    if (buySide.length >= 4) break;
    const isDuplicate = buySide.some(b => Math.abs(parseFloat(b.price) - swing.val) < 2);
    if (!isDuplicate) {
        buySide.push({ price: swing.val.toFixed(2), label: swing.label });
    }
  }

  if (buySide.length === 1) {
     buySide.push({ price: (parseFloat(buySide[0].price) + 10).toFixed(2), label: "Resistance" });
  }

  let sellSide = [];
  if (pdl < currentPrice) {
    sellSide.push({ price: pdl.toFixed(2), label: "PDL (Previous Day Low)" });
  } else {
    sellSide.push({ price: pdl.toFixed(2), label: "PDL (Mitigated)" });
  }
  
  for (const swing of sellSideSwings) {
    if (sellSide.length >= 4) break;
    const isDuplicate = sellSide.some(b => Math.abs(parseFloat(b.price) - swing.val) < 2);
    if (!isDuplicate) {
        sellSide.push({ price: swing.val.toFixed(2), label: swing.label });
    }
  }

  if (sellSide.length === 1) {
     sellSide.push({ price: (parseFloat(sellSide[0].price) - 10).toFixed(2), label: "Support" });
  }

  return { 
    buySide: buySide.sort((a,b) => parseFloat(a.price) - parseFloat(b.price)), 
    sellSide: sellSide.sort((a,b) => parseFloat(b.price) - parseFloat(a.price)) 
  };
}`;

const oldRegex = /function findLiquidity\([\s\S]*?return \{\s*buySide: buySide\.sort\(\(a,b\) => parseFloat\(a\.price\) - parseFloat\(b\.price\)\),\s*sellSide: sellSide\.sort\(\(a,b\) => parseFloat\(b\.price\) - parseFloat\(a\.price\)\)\s*\};\s*\}/m;
code = code.replace(oldRegex, newFindLiquidity);
code = code.replace(/liquidity: findLiquidity\(d1, h4, currentPrice\)/g, 'liquidity: findLiquidity(d1, h4, h1, currentPrice)');

fs.writeFileSync('src/liveData.ts', code);

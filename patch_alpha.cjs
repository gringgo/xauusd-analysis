const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

// Replace generateAlphaConfluence
code = code.replace(
  /function generateAlphaConfluence[\s\S]*?return filtered\.slice\(0, 3\); \/\/ Max 3 zones\n\}/,
  `function generateAlphaConfluence(h4Candles: any[], h1Candles: any[], snr: any, liquidity: any) {
  const confluences = [];
  
  const h4Ob = findBothOrderBlocks(h4Candles);
  const h1Ob = findBothOrderBlocks(h1Candles);
  const h4Fvg = findBothFVGs(h4Candles);
  const h1Fvg = findBothFVGs(h1Candles);

  // Helper to find overlaps
  const getOverlap = (top1: number, bot1: number, top2: number, bot2: number) => {
    const top = Math.min(top1, top2);
    const bot = Math.max(bot1, bot2);
    if (top >= bot) return { top, bottom: bot };
    return null;
  };

  // 1. BULLISH SCENARIOS
  const bullZones = [];
  if (h4Ob.bullish) bullZones.push({ type: 'OB', label: 'H4 OB', top: h4Ob.bullish.top, bot: h4Ob.bullish.bottom });
  if (h1Ob.bullish) bullZones.push({ type: 'OB', label: 'H1 OB', top: h1Ob.bullish.top, bot: h1Ob.bullish.bottom });
  if (h4Fvg.bullish) bullZones.push({ type: 'FVG', label: 'H4 FVG', top: h4Fvg.bullish.top, bot: h4Fvg.bullish.bottom });
  if (h1Fvg.bullish) bullZones.push({ type: 'FVG', label: 'H1 FVG', top: h1Fvg.bullish.top, bot: h1Fvg.bullish.bottom });

  for (let i = 0; i < bullZones.length; i++) {
    for (let j = i + 1; j < bullZones.length; j++) {
      const z1 = bullZones[i];
      const z2 = bullZones[j];
      const overlap = getOverlap(z1.top, z1.bot, z2.top, z2.bot);
      
      if (overlap) {
        let stars = 2;
        let elements = [z1.label, z2.label];
        
        const rbsLines = [snr?.h4?.rbs, snr?.h1?.rbs, snr?.h8?.rbs].filter(x => x);
        for (const rbs of rbsLines) {
          const p = parseFloat(rbs.price);
          if (p <= overlap.top + 2 && p >= overlap.bottom - 2) {
            stars += 1;
            elements.push(\`RBS (\${p.toFixed(2)})\`);
            break; 
          }
        }
        
        const sslLines = liquidity?.sellSide || [];
        for (const ssl of sslLines) {
          const p = parseFloat(ssl.price);
          if (p <= overlap.top + 3 && p >= overlap.bottom - 3) {
            stars += 1;
            elements.push(\`SSL Sweep (\${p.toFixed(2)})\`);
            break;
          }
        }

        confluences.push({
          type: 'BULLISH',
          top: overlap.top,
          bottom: overlap.bottom,
          stars,
          elements: Array.from(new Set(elements))
        });
      }
    }
  }

  // 2. BEARISH SCENARIOS
  const bearZones = [];
  if (h4Ob.bearish) bearZones.push({ type: 'OB', label: 'H4 OB', top: h4Ob.bearish.top, bot: h4Ob.bearish.bottom });
  if (h1Ob.bearish) bearZones.push({ type: 'OB', label: 'H1 OB', top: h1Ob.bearish.top, bot: h1Ob.bearish.bottom });
  if (h4Fvg.bearish) bearZones.push({ type: 'FVG', label: 'H4 FVG', top: h4Fvg.bearish.top, bot: h4Fvg.bearish.bottom });
  if (h1Fvg.bearish) bearZones.push({ type: 'FVG', label: 'H1 FVG', top: h1Fvg.bearish.top, bot: h1Fvg.bearish.bottom });

  for (let i = 0; i < bearZones.length; i++) {
    for (let j = i + 1; j < bearZones.length; j++) {
      const z1 = bearZones[i];
      const z2 = bearZones[j];
      const overlap = getOverlap(z1.top, z1.bot, z2.top, z2.bot);
      
      if (overlap) {
        let stars = 2;
        let elements = [z1.label, z2.label];
        
        const sbrLines = [snr?.h4?.sbr, snr?.h1?.sbr, snr?.h8?.sbr].filter(x => x);
        for (const sbr of sbrLines) {
          const p = parseFloat(sbr.price);
          if (p <= overlap.top + 2 && p >= overlap.bottom - 2) {
            stars += 1;
            elements.push(\`SBR (\${p.toFixed(2)})\`);
            break;
          }
        }
        
        const bslLines = liquidity?.buySide || [];
        for (const bsl of bslLines) {
          const p = parseFloat(bsl.price);
          if (p <= overlap.top + 3 && p >= overlap.bottom - 3) {
            stars += 1;
            elements.push(\`BSL Sweep (\${p.toFixed(2)})\`);
            break;
          }
        }

        confluences.push({
          type: 'BEARISH',
          top: overlap.top,
          bottom: overlap.bottom,
          stars,
          elements: Array.from(new Set(elements))
        });
      }
    }
  }

  const filtered = [];
  confluences.sort((a, b) => b.stars - a.stars);
  
  for (const conf of confluences) {
    const isDup = filtered.find(f => f.type === conf.type && Math.abs(f.top - conf.top) < 3 && Math.abs(f.bottom - conf.bottom) < 3);
    if (!isDup) {
      filtered.push(conf);
    }
  }

  return filtered.slice(0, 3);
}`
);

// Then replace the call to it
code = code.replace(
  'const computedAlpha = generateAlphaConfluence(computedOrderBlock, computedFvg, computedSbrRbs, computedLiquidity);',
  'const computedAlpha = generateAlphaConfluence(h4Visible, h1Visible, computedSbrRbs, computedLiquidity);'
);

fs.writeFileSync('src/liveData.ts', code);

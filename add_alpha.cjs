const fs = require('fs');
let file = fs.readFileSync('src/liveData.ts', 'utf8');

const alphaFunc = `
function generateAlphaConfluence(ob: any, fvg: any, snr: any, liquidity: any) {
  const confluences = [];

  // Helper to find overlaps
  const getOverlap = (top1, bot1, top2, bot2) => {
    const top = Math.min(top1, top2);
    const bot = Math.max(bot1, bot2);
    if (top >= bot) return { top, bottom: bot };
    return null;
  };

  // 1. BULLISH SCENARIOS
  const bullZones = [];
  if (ob?.h4?.direction === 'BULLISH') bullZones.push({ type: 'OB', label: 'H4 OB', top: ob.h4.top, bot: ob.h4.bottom });
  if (ob?.h1?.direction === 'BULLISH') bullZones.push({ type: 'OB', label: 'H1 OB', top: ob.h1.top, bot: ob.h1.bottom });
  if (fvg?.h4?.direction === 'BULLISH') bullZones.push({ type: 'FVG', label: 'H4 FVG', top: fvg.h4.top, bot: fvg.h4.bottom });
  if (fvg?.h1?.direction === 'BULLISH') bullZones.push({ type: 'FVG', label: 'H1 FVG', top: fvg.h1.top, bot: fvg.h1.bottom });

  // Compare Bull Zones to find intersections
  for (let i = 0; i < bullZones.length; i++) {
    for (let j = i + 1; j < bullZones.length; j++) {
      const z1 = bullZones[i];
      const z2 = bullZones[j];
      const overlap = getOverlap(z1.top, z1.bot, z2.top, z2.bot);
      
      if (overlap) {
        let stars = 2;
        let elements = [z1.label, z2.label];
        
        // Check SNR (RBS) inside this overlap
        const rbsLines = [snr?.h4?.rbs, snr?.h1?.rbs, snr?.h8?.rbs].filter(x => x);
        for (const rbs of rbsLines) {
          const p = parseFloat(rbs.price);
          // If RBS is within or very close to the zone (2 pips buffer)
          if (p <= overlap.top + 2 && p >= overlap.bottom - 2) {
            stars += 1;
            elements.push(\`RBS (\${p.toFixed(2)})\`);
            break; // only add SNR star once per overlap
          }
        }
        
        // Check Liquidity (SSL) near this overlap
        const sslLines = liquidity?.sellSide || [];
        for (const ssl of sslLines) {
          const p = parseFloat(ssl.price);
          // If SSL is just below or inside the zone (good for sweep)
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
  if (ob?.h4?.direction === 'BEARISH') bearZones.push({ type: 'OB', label: 'H4 OB', top: ob.h4.top, bot: ob.h4.bottom });
  if (ob?.h1?.direction === 'BEARISH') bearZones.push({ type: 'OB', label: 'H1 OB', top: ob.h1.top, bot: ob.h1.bottom });
  if (fvg?.h4?.direction === 'BEARISH') bearZones.push({ type: 'FVG', label: 'H4 FVG', top: fvg.h4.top, bot: fvg.h4.bottom });
  if (fvg?.h1?.direction === 'BEARISH') bearZones.push({ type: 'FVG', label: 'H1 FVG', top: fvg.h1.top, bot: fvg.h1.bottom });

  for (let i = 0; i < bearZones.length; i++) {
    for (let j = i + 1; j < bearZones.length; j++) {
      const z1 = bearZones[i];
      const z2 = bearZones[j];
      const overlap = getOverlap(z1.top, z1.bot, z2.top, z2.bot);
      
      if (overlap) {
        let stars = 2;
        let elements = [z1.label, z2.label];
        
        // Check SNR (SBR)
        const sbrLines = [snr?.h4?.sbr, snr?.h1?.sbr, snr?.h8?.sbr].filter(x => x);
        for (const sbr of sbrLines) {
          const p = parseFloat(sbr.price);
          if (p <= overlap.top + 2 && p >= overlap.bottom - 2) {
            stars += 1;
            elements.push(\`SBR (\${p.toFixed(2)})\`);
            break;
          }
        }
        
        // Check Liquidity (BSL)
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

  // Deduplicate and filter overlapping zones to pick highest stars
  const filtered = [];
  confluences.sort((a, b) => b.stars - a.stars); // highest stars first
  
  for (const conf of confluences) {
    // Avoid very similar zones
    const isDup = filtered.find(f => f.type === conf.type && Math.abs(f.top - conf.top) < 3 && Math.abs(f.bottom - conf.bottom) < 3);
    if (!isDup) {
      filtered.push(conf);
    }
  }

  return filtered.slice(0, 3); // Max 3 zones
}
`;

file = file.replace("function generateAnalysis", alphaFunc + "\nfunction generateAnalysis");

file = file.replace(
  "const computedAnalysis = generateAnalysis(computedSbrRbs, computedLiquidity, computedOrderBlock, computedFvg, currentPrice);",
  "const computedAnalysis = generateAnalysis(computedSbrRbs, computedLiquidity, computedOrderBlock, computedFvg, currentPrice);\n    const computedAlpha = generateAlphaConfluence(computedOrderBlock, computedFvg, computedSbrRbs, computedLiquidity);"
);

file = file.replace(
  "tradingPlan: {",
  "alphaConfluence: computedAlpha,\n    tradingPlan: {"
);

fs.writeFileSync('src/liveData.ts', file);

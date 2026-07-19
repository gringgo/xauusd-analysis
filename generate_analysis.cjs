const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

const analysisFunc = `
function generateAnalysis(sbr_rbs, liquidity, orderBlock, fvg, currentPrice) {
  let narrative = "Analisis Pasaran Hari Ini berdasarkan konsep Smart Money:\\n\\n";
  
  // SBR / RBS
  narrative += "1. SBR & RBS (Support/Resistance):\\n";
  if (sbr_rbs.h4.sbr || sbr_rbs.h1.sbr) {
    narrative += \`   - Terdapat rintangan kukuh di kawasan \${sbr_rbs.h4.sbr || ''} \${sbr_rbs.h1.sbr ? '(' + sbr_rbs.h1.sbr + ')' : ''} (SBR).\\n\`;
  }
  if (sbr_rbs.h4.rbs || sbr_rbs.h1.rbs) {
    narrative += \`   - Sokongan kuat ditemui di sekitar \${sbr_rbs.h4.rbs || ''} \${sbr_rbs.h1.rbs ? '(' + sbr_rbs.h1.rbs + ')' : ''} (RBS).\\n\`;
  }
  if (!sbr_rbs.h4.sbr && !sbr_rbs.h1.sbr && !sbr_rbs.h4.rbs && !sbr_rbs.h1.rbs) {
    narrative += "   - Tiada paras SBR/RBS yang jelas buat masa ini.\\n";
  }

  // Liquidity
  narrative += "\\n2. LIQUIDITY (Kecairan):\\n";
  const buySideLiq = liquidity.buySide.slice(0, 2).map(l => l.price).join(', ');
  const sellSideLiq = liquidity.sellSide.slice(0, 2).map(l => l.price).join(', ');
  if (buySideLiq) narrative += \`   - Buy-Side Liquidity (BSL) menanti di atas pada paras \${buySideLiq}. Ini adalah target potensi jika harga naik.\\n\`;
  if (sellSideLiq) narrative += \`   - Sell-Side Liquidity (SSL) berada di paras \${sellSideLiq}. Harga mungkin akan turun memburu liquidity ini jika berlaku penolakan.\\n\`;

  // Order Block
  narrative += "\\n3. ORDER BLOCK (OB):\\n";
  if (orderBlock.h4) {
    narrative += \`   - H4 mempunyai OB \${orderBlock.h4.direction} di zone \${orderBlock.h4.range}.\\n\`;
  }
  if (orderBlock.h1) {
    narrative += \`   - H1 mempunyai OB \${orderBlock.h1.direction} di zone \${orderBlock.h1.range}.\\n\`;
  }
  if (!orderBlock.h4 && !orderBlock.h1) {
    narrative += "   - Tiada Order Block H4 atau H1 yang ditemui buat masa sekarang.\\n";
  }

  // FVG
  narrative += "\\n4. FAIR VALUE GAP (FVG):\\n";
  if (fvg.h4) {
    narrative += \`   - Terdapat lekukan FVG \${fvg.h4.direction} di timeframe H4 pada \${fvg.h4.range}.\\n\`;
  }
  if (fvg.h1) {
    narrative += \`   - FVG \${fvg.h1.direction} di H1 dikesan sekitar \${fvg.h1.range}.\\n\`;
  }
  if (!fvg.h4 && !fvg.h1) {
    narrative += "   - Harga tidak meninggalkan FVG yang ketara di H4/H1.\\n";
  }

  // Trading Suggestion
  narrative += "\\nCADANGAN & TINDAKAN:\\n";
  let suggestBuy = false;
  let suggestSell = false;
  
  if ((orderBlock.h4?.direction === 'BULLISH' || fvg.h4?.direction === 'BULLISH') || (sbr_rbs.h4?.rbs)) suggestBuy = true;
  if ((orderBlock.h4?.direction === 'BEARISH' || fvg.h4?.direction === 'BEARISH') || (sbr_rbs.h4?.sbr)) suggestSell = true;

  if (suggestBuy && !suggestSell) {
    narrative += "   - Pasaran kelihatan cenderung untuk BUY. Cari peluang masuk entry (BUY) apabila harga retrace ke kawasan RBS, OB Bullish, atau FVG Bullish.\\n";
    narrative += "   - Pastikan terdapat rejection (seperti pin bar atau engulfing) di zone tersebut sebelum entry.\\n";
    narrative += \`   - Target TP pertama anda di Buy-Side Liquidity (\${buySideLiq || 'Rintangan terdekat'}).\\n\`;
  } else if (suggestSell && !suggestBuy) {
    narrative += "   - Pasaran kelihatan cenderung untuk SELL. Tunggu harga pullback ke kawasan SBR, OB Bearish, atau FVG Bearish untuk peluang SELL.\\n";
    narrative += "   - Jangan kejar harga, pastikan ada confirmation (rejection/engulfing) di kawasan premium ini.\\n";
    narrative += \`   - Target TP pertama di Sell-Side Liquidity (\${sellSideLiq || 'Sokongan terdekat'}).\\n\`;
  } else {
    narrative += "   - Pasaran mungkin dalam keadaan sideway atau mencari arah. Sila perhatikan reaksi harga di zone SBR/RBS terdekat.\\n";
    narrative += "   - Tunggu harga masuk ke zone Order Block atau FVG (H1/H4) yang terdekat dan lihat jika ada sebarang reaksi (rejection/engulfing) sebelum entry.\\n";
    narrative += "   - Sentiasa gunakan Stop Loss (SL) yang ketat di luar zone OB/FVG.\\n";
  }
  
  return narrative;
}
`;

code = code.replace(/function generateAnalysis/, 'function _removed_generateAnalysis'); // Just in case
code = code.replace(/function findSBR_RBS/, analysisFunc + "\nfunction findSBR_RBS");


const updatePayload = `
    const computedLiquidity = findLiquidity(d1, h4, h1, currentPrice);
    const computedOrderBlock = {
      h4: h4Ob ? { direction: h4Ob.direction, range: \`\${h4Ob.bottom.toFixed(2)} - \${h4Ob.top.toFixed(2)}\` } : null,
      h1: h1Ob ? { direction: h1Ob.direction, range: \`\${h1Ob.bottom.toFixed(2)} - \${h1Ob.top.toFixed(2)}\` } : null
    };
    const computedFvg = {
      direction: fvg.direction,
      timeframe: fvgTimeframe,
      range: \`\${fvg.bottom.toFixed(2)} - \${fvg.top.toFixed(2)}\`,
      h4: h4Fvg ? { direction: h4Fvg.direction, range: \`\${h4Fvg.bottom.toFixed(2)} - \${h4Fvg.top.toFixed(2)}\` } : null,
      h1: h1Fvg ? { direction: h1Fvg.direction, range: \`\${h1Fvg.bottom.toFixed(2)} - \${h1Fvg.top.toFixed(2)}\` } : null,
      notes: [
        "Kawasan ini berpotensi jadi S/R.",
        "Tunggu reaksi harga di sini."
      ]
    };
    const computedSbrRbs = {
      h4: findSBR_RBS(h4, currentPrice),
      h1: findSBR_RBS(h1, currentPrice)
    };
    const computedAnalysis = generateAnalysis(computedSbrRbs, computedLiquidity, computedOrderBlock, computedFvg, currentPrice);
`;

const replacePayloadRegex = /liquidity: findLiquidity\(d1, h4, h1, currentPrice\),[\s\S]*?sbr_rbs: \{[\s\S]*?\},[\s\S]*?fvg: \{[\s\S]*?\},/;

code = code.replace(/return \{\n    date: dateStr,/, updatePayload + "\n  return {\n    date: dateStr,");

code = code.replace(replacePayloadRegex, `liquidity: computedLiquidity,
    orderBlock: computedOrderBlock,
    sbr_rbs: computedSbrRbs,
    fvg: computedFvg,
    dailyAnalysis: computedAnalysis,`);


fs.writeFileSync('src/liveData.ts', code);

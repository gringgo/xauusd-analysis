const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

const obFunc = `
function findOrderBlock(candles: any[]) {
  for (let i = candles.length - 1; i >= 2; i--) {
    const c1 = candles[i - 2];
    const c3 = candles[i];

    // Bullish FVG move
    if (c3.low > c1.high) {
      // search backwards from i-2 for the last bearish candle (close < open)
      let obIndex = i - 2;
      while (obIndex >= 0 && candles[obIndex].close >= candles[obIndex].open) {
        obIndex--;
      }
      if (obIndex >= 0) {
        return { direction: "BULLISH", top: candles[obIndex].high, bottom: candles[obIndex].low, type: "OB (Order Block)" };
      }
    }
    // Bearish FVG move
    if (c3.high < c1.low) {
      // search backwards for the last bullish candle (close > open)
      let obIndex = i - 2;
      while (obIndex >= 0 && candles[obIndex].close <= candles[obIndex].open) {
        obIndex--;
      }
      if (obIndex >= 0) {
        return { direction: "BEARISH", top: candles[obIndex].high, bottom: candles[obIndex].low, type: "OB (Order Block)" };
      }
    }
  }
  return null;
}
`;

// insert findOrderBlock after findFVG
code = code.replace(/function findFVG\([\s\S]*?return null;\s*\}/, match => match + obFunc);

// find h4Fvg and h1Fvg definitions and add OB
code = code.replace(/const h4Fvg = findFVG\(h4\);/, "const h4Fvg = findFVG(h4);\n  const h4Ob = findOrderBlock(h4);");
code = code.replace(/const h1Fvg = findFVG\(h1\);/, "const h1Fvg = findFVG(h1);\n  const h1Ob = findOrderBlock(h1);");

// add OB to returned payload inside fvg: {} block or create a new orderBlock: {} block
// Since fvg is right before bos, let's add orderBlock right before it.
const obPayload = `
    orderBlock: {
      h4: h4Ob ? { direction: h4Ob.direction, range: \`\${h4Ob.bottom.toFixed(2)} - \${h4Ob.top.toFixed(2)}\` } : null,
      h1: h1Ob ? { direction: h1Ob.direction, range: \`\${h1Ob.bottom.toFixed(2)} - \${h1Ob.top.toFixed(2)}\` } : null
    },`;

code = code.replace(/fvg: \{/, obPayload + "\n    fvg: {");

fs.writeFileSync('src/liveData.ts', code);

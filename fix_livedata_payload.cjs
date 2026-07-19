const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

const newComputedOrderBlock = `    const computedOrderBlock = {
      h4: h4Ob ? { direction: h4Ob.direction, top: h4Ob.top, bottom: h4Ob.bottom, range: \`\${h4Ob.bottom.toFixed(2)} - \${h4Ob.top.toFixed(2)}\` } : null,
      h1: h1Ob ? { direction: h1Ob.direction, top: h1Ob.top, bottom: h1Ob.bottom, range: \`\${h1Ob.bottom.toFixed(2)} - \${h1Ob.top.toFixed(2)}\` } : null
    };`;

code = code.replace(/const computedOrderBlock = \{[\s\S]*?    \};/, newComputedOrderBlock);

const newComputedFvg = `    const computedFvg = {
      direction: fvg.direction,
      timeframe: fvgTimeframe,
      range: \`\${fvg.bottom.toFixed(2)} - \${fvg.top.toFixed(2)}\`,
      h4: h4Fvg ? { direction: h4Fvg.direction, top: h4Fvg.top, bottom: h4Fvg.bottom, range: \`\${h4Fvg.bottom.toFixed(2)} - \${h4Fvg.top.toFixed(2)}\` } : null,
      h1: h1Fvg ? { direction: h1Fvg.direction, top: h1Fvg.top, bottom: h1Fvg.bottom, range: \`\${h1Fvg.bottom.toFixed(2)} - \${h1Fvg.top.toFixed(2)}\` } : null,
      notes: [
        "Kawasan ini berpotensi jadi S/R.",
        "Tunggu reaksi harga di sini."
      ]
    };`;
code = code.replace(/const computedFvg = \{[\s\S]*?    \};/, newComputedFvg);

fs.writeFileSync('src/liveData.ts', code);

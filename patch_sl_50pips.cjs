const fs = require('fs');

// Patch AlphaConfluenceDashboard.tsx
let alphaCode = fs.readFileSync('src/components/AlphaConfluenceDashboard.tsx', 'utf8');

// Update isInvalidated to 5.0
alphaCode = alphaCode.replace(
  /const isInvalidated = isBuy \? currentPrice < \(bottomPrice - 1\.5\) : currentPrice > \(topPrice \+ 1\.5\);/,
  "const isInvalidated = isBuy ? currentPrice < (bottomPrice - 5.0) : currentPrice > (topPrice + 5.0);"
);

// Update sl in dispatchNewSignal to 5.0
alphaCode = alphaCode.replace(
  /sl: isBuy \? bottomPrice - 1\.5 : topPrice \+ 1\.5,/,
  "sl: isBuy ? optimalEntry - 5.0 : optimalEntry + 5.0,"
);

// Update UI Cadangan SL
alphaCode = alphaCode.replace(
  /<div className="text-\[10px\] text-gray-300 font-bold mb-0\.5 uppercase">Cadangan SL<\/div>/,
  '<div className="text-[10px] text-gray-300 font-bold mb-0.5 uppercase">Cadangan SL (50 Pips)</div>'
);

alphaCode = alphaCode.replace(
  /\{isBuy \? \(conf\.bottom - 1\.5\)\.toFixed\(2\) : \(conf\.top \+ 1\.5\)\.toFixed\(2\)\}/,
  "{isBuy ? (conf.bottom - 5.0).toFixed(2) : (conf.top + 5.0).toFixed(2)}"
);

fs.writeFileSync('src/components/AlphaConfluenceDashboard.tsx', alphaCode);

// Patch server.ts for SL (50pips) label
let serverCode = fs.readFileSync('server.ts', 'utf8');

serverCode = serverCode.replace(
  /message \+= `🔹 \*SL:\* \$\{actualSl\}\\n`;/g,
  "message += `🔹 *SL (50pips):* ${actualSl}\\n`;"
);

serverCode = serverCode.replace(
  /message \+= `🔹 <b>SL:<\/b> \$\{actualSl\}\\n`;/g,
  "message += `🔹 <b>SL (50pips):</b> ${actualSl}\\n`;"
);

fs.writeFileSync('server.ts', serverCode);

console.log("Patched SL to 50 pips (5.0 points) successfully.");

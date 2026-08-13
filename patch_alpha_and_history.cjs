const fs = require('fs');

// Patch AlphaConfluenceDashboard.tsx
let alphaCode = fs.readFileSync('src/components/AlphaConfluenceDashboard.tsx', 'utf8');

// Update dispatchNewSignal inside AlphaConfluenceDashboard.tsx
alphaCode = alphaCode.replace(
  /tp: isBuy \? optimalEntry \+ 5\.0 : optimalEntry - 5\.0,/,
  "tp: isBuy ? optimalEntry + 4.0 : optimalEntry - 4.0,"
);

fs.writeFileSync('src/components/AlphaConfluenceDashboard.tsx', alphaCode);

// Patch SignalHistoryDashboard.tsx
let historyCode = fs.readFileSync('src/components/SignalHistoryDashboard.tsx', 'utf8');

// Ensure tp1 is standard 4.0 (40 pips)
historyCode = historyCode.replace(
  /const tp1 = \(signal\.type && signal\.type\.includes\('ALPHA'\) && signal\.tp\) \? signal\.tp : \(isBuy \? entry \+ 4\.0 : entry - 4\.0\);/,
  "const tp1 = isBuy ? entry + 4.0 : entry - 4.0;"
);

// Remove the conditional wrapper that hid TP1-TP7 bar for ALPHA
historyCode = historyCode.replace(
  /\{!\(signal\.type && signal\.type\.includes\('ALPHA'\)\) && \(/,
  "{"
);

// Update MAIN TARGET label
historyCode = historyCode.replace(
  /\{signal\.type && signal\.type\.includes\('ALPHA'\) \? \(\s*<div className="text-\[9px\] text-emerald-400 font-bold mb-0\.5">MAIN TARGET \(50 PIPS\)<\/div>\s*\) : \(\s*<div className="text-\[9px\] text-emerald-400 font-bold mb-0\.5">MAIN TARGET \(TP1: 40 PIPS\)<\/div>\s*\)\}/,
  '<div className="text-[9px] text-emerald-400 font-bold mb-0.5">MAIN TARGET (TP1: 40 PIPS)</div>'
);

fs.writeFileSync('src/components/SignalHistoryDashboard.tsx', historyCode);

console.log("Patched Alpha and History dashboards successfully.");

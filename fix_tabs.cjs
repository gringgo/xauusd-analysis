const fs = require('fs');
let file = fs.readFileSync('src/components/SignalHistoryDashboard.tsx', 'utf8');
file = file.replace(
  "const uniqueTypes = Array.from(new Set(signals.map(s => s.type)));",
  "const predefinedTypes = ['ORDER BLOCK', 'FVG', 'SBR', 'RBS', 'DBD', 'RBR', 'ZON KEBENARAN'];\n  const dynamicTypes = Array.from(new Set(signals.map(s => s.type)));\n  const uniqueTypes = Array.from(new Set([...predefinedTypes, ...dynamicTypes]));"
);
fs.writeFileSync('src/components/SignalHistoryDashboard.tsx', file);

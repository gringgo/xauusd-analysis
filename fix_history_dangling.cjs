const fs = require('fs');
let code = fs.readFileSync('src/components/SignalHistoryDashboard.tsx', 'utf8');

code = code.replace(
  /\{\s*<div className="bg-\[\#111\] p-2 rounded border border-gray-800\/60 text-\[10px\]">/,
  '<div className="bg-[#111] p-2 rounded border border-gray-800/60 text-[10px]">'
);

fs.writeFileSync('src/components/SignalHistoryDashboard.tsx', code);

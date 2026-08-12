const fs = require('fs');
let code = fs.readFileSync('src/components/SignalHistoryDashboard.tsx', 'utf8');

// Update labels
code = code.replace(
  /<div className="text-\[9px\] text-emerald-400 font-bold mb-0\.5">MAIN TARGET \(TP1: 40 PIPS\)<\/div>/,
  `{signal.type && signal.type.includes('ALPHA') ? (
                          <div className="text-[9px] text-emerald-400 font-bold mb-0.5">MAIN TARGET (50 PIPS)</div>
                        ) : (
                          <div className="text-[9px] text-emerald-400 font-bold mb-0.5">MAIN TARGET (TP1: 40 PIPS)</div>
                        )}`
);

// Conditionally render the Multi-Level bar
code = code.replace(
  /\{\/\* TP1 - TP7 Multi-Level Targets Bar \*\/\}/,
  `{/* TP1 - TP7 Multi-Level Targets Bar */}
                    {!(signal.type && signal.type.includes('ALPHA')) && (`
);

code = code.replace(
  /<div className="bg-emerald-950\/20 border border-gray-800 p-1 rounded">\s*<div className="text-\[8px\] text-emerald-400 font-bold">TP7 \(100p\)<\/div>\s*<div className="text-gray-200 font-bold">\$\{tp7\.toFixed\(2\)\}<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
  `<div className="bg-emerald-950/20 border border-gray-800 p-1 rounded">
                          <div className="text-[8px] text-emerald-400 font-bold">TP7 (100p)</div>
                          <div className="text-gray-200 font-bold">\${tp7.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                    )}`
);

fs.writeFileSync('src/components/SignalHistoryDashboard.tsx', code);

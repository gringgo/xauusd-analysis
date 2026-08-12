const fs = require('fs');

let code = fs.readFileSync('src/components/SignalHistoryDashboard.tsx', 'utf8');

// I'll replace the closing div properly.
code = code.replace(
  /<div className="bg-yellow-950\/30 border border-yellow-800\/50 p-1 rounded">\s*<div className="text-\[8px\] text-yellow-400 font-bold">TP7 \(100p\)<\/div>\s*<div className="text-yellow-300 font-bold">\$\{tp7\.toFixed\(2\)\}<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/,
  `<div className="bg-yellow-950/30 border border-yellow-800/50 p-1 rounded">
                          <div className="text-[8px] text-yellow-400 font-bold">TP7 (100p)</div>
                          <div className="text-yellow-300 font-bold">\${tp7.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                    )}
                  </div>`
);

fs.writeFileSync('src/components/SignalHistoryDashboard.tsx', code);

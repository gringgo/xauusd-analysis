const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const analysisSection = `
            {/* ANALISIS HARI INI */}
            {data.dailyAnalysis && (
              <div className="border border-[#b49a45] rounded bg-[#0a0a0a] md:col-span-2 lg:col-span-3">
                <div className="border-b border-[#b49a45] px-3 py-1 bg-[#1a1a1a]">
                  <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">💡 ANALISIS MAXX HARI INI</span>
                </div>
                <div className="p-4 text-gray-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {data.dailyAnalysis}
                </div>
              </div>
            )}
`;

code = code.replace(/\{\/\* LIQUIDITY \*\/\}/, analysisSection + "\n\n            {/* LIQUIDITY */}");
fs.writeFileSync('src/App.tsx', code);

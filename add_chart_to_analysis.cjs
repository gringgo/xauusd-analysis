const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
            {/* ANALISIS HARI INI */}
            {data.dailyAnalysis && (
              <div className="border border-[#b49a45] rounded bg-[#0a0a0a] md:col-span-2 lg:col-span-3">
                <div className="border-b border-[#b49a45] px-3 py-1 bg-[#1a1a1a]">
                  <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">💡 ANALISIS MAXX HARI INI</span>
                </div>
                
                {/* MAXX ANALYSIS CHART */}
                <div className="p-3">
                   <LightweightChart 
                     title="ANALYSIS CHART (H1)" 
                     subtitle="SBR/RBS, Liq, OB, FVG"
                     data={data.charts.h1.rawCandles}
                     heightClass="h-[250px] sm:h-[300px]"
                     markers={{
                       sbr: data.sbr_rbs?.h1?.sbr || data.sbr_rbs?.h4?.sbr,
                       rbs: data.sbr_rbs?.h1?.rbs || data.sbr_rbs?.h4?.rbs,
                       buySideLiq: data.liquidity?.buySide?.map(l => l.price),
                       sellSideLiq: data.liquidity?.sellSide?.map(l => l.price),
                       ob: data.orderBlock?.h1 || data.orderBlock?.h4,
                       fvg: data.fvg?.h1 || data.fvg?.h4
                     }}
                   />
                </div>

                <div className="p-4 pt-0 text-gray-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                  {data.dailyAnalysis}
                </div>
              </div>
            )}
`;

code = code.replace(/\{\/\* ANALISIS HARI INI \*\/\}[\s\S]*?\{\/\* LIQUIDITY \*\/\}/, replacement + "\n\n            {/* LIQUIDITY */}");

fs.writeFileSync('src/App.tsx', code);

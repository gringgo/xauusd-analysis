const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const sbrSection = `
            {/* SBR & RBS */}
            <div className="border border-[#b49a45] rounded bg-[#0a0a0a]">
              <div className="border-b border-[#b49a45] px-3 py-1">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">SBR & RBS (Support/Resistance)</span>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="font-bold text-[#ef4444] text-xs sm:text-sm mb-2">H4 SBR/RBS</div>
                    {data.sbr_rbs?.h4?.sbr && (
                      <div className="text-gray-300 text-xs sm:text-sm mb-1">
                        SBR: <span className="font-bold text-white">{data.sbr_rbs.h4.sbr}</span>
                      </div>
                    )}
                    {data.sbr_rbs?.h4?.rbs && (
                      <div className="text-gray-300 text-xs sm:text-sm">
                        RBS: <span className="font-bold text-white">{data.sbr_rbs.h4.rbs}</span>
                      </div>
                    )}
                    {!data.sbr_rbs?.h4?.sbr && !data.sbr_rbs?.h4?.rbs && (
                      <div className="text-gray-500 text-xs italic">Tiada di H4</div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-[#22c55e] text-xs sm:text-sm mb-2">H1 SBR/RBS</div>
                    {data.sbr_rbs?.h1?.sbr && (
                      <div className="text-gray-300 text-xs sm:text-sm mb-1">
                        SBR: <span className="font-bold text-white">{data.sbr_rbs.h1.sbr}</span>
                      </div>
                    )}
                    {data.sbr_rbs?.h1?.rbs && (
                      <div className="text-gray-300 text-xs sm:text-sm">
                        RBS: <span className="font-bold text-white">{data.sbr_rbs.h1.rbs}</span>
                      </div>
                    )}
                    {!data.sbr_rbs?.h1?.sbr && !data.sbr_rbs?.h1?.rbs && (
                      <div className="text-gray-500 text-xs italic">Tiada di H1</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
`;

code = code.replace(/\{\/\* LIQUIDITY \*\/\}/, sbrSection + "\n\n            {/* LIQUIDITY */}");
fs.writeFileSync('src/App.tsx', code);

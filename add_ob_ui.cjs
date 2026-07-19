const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const obSection = `
            {/* ORDER BLOCK */}
            <div className="border border-[#b49a45] rounded bg-[#0a0a0a]">
              <div className="border-b border-[#b49a45] px-3 py-1">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">ORDER BLOCK (OB)</span>
              </div>
              <div className="p-3">
                <div className="flex flex-col gap-3">
                  {data.orderBlock && data.orderBlock.h4 && (
                    <div>
                      <div className={\`font-bold text-xs sm:text-sm mb-1 tracking-wide \${data.orderBlock.h4.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}\`}>
                        {data.orderBlock.h4.direction} OB (H4)
                      </div>
                      <div className="bg-[#4c1d95] text-white px-2 py-1 text-xs sm:text-sm font-bold inline-block rounded-sm shadow-lg shadow-purple-900/20">
                        {data.orderBlock.h4.range}
                      </div>
                    </div>
                  )}
                  {data.orderBlock && data.orderBlock.h1 && (
                    <div>
                      <div className={\`font-bold text-xs sm:text-sm mb-1 tracking-wide \${data.orderBlock.h1.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}\`}>
                        {data.orderBlock.h1.direction} OB (H1)
                      </div>
                      <div className="bg-[#4c1d95] text-white px-2 py-1 text-xs sm:text-sm font-bold inline-block rounded-sm shadow-lg shadow-purple-900/20">
                        {data.orderBlock.h1.range}
                      </div>
                    </div>
                  )}
                  {(!data.orderBlock || (!data.orderBlock.h4 && !data.orderBlock.h1)) && (
                    <div className="text-gray-400 text-xs sm:text-sm italic">
                      Tiada Order Block yang jelas ditemui pada H4/H1.
                    </div>
                  )}
                </div>
              </div>
            </div>
`;

code = code.replace(/\{\/\* FVG \*\/\}/, obSection + "\n            {/* FVG */}");
fs.writeFileSync('src/App.tsx', code);

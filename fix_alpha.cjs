const fs = require('fs');

const alphaSection = `
            {/* ALPHA CONFLUENCE */}
            {(viewMode === 'ALL' || activeSection === 'sec-alpha') && (
              <div id="sec-alpha" className="scroll-mt-6 border border-[#ffcc00]/40 rounded-xl bg-[#0a0a0a] shadow-[0_0_20px_rgba(255,204,0,0.15)] overflow-hidden">
                <div className="border-b border-[#ffcc00]/30 bg-gradient-to-r from-[#111] via-[#1a1500] to-[#111] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-yellow-950/80 border border-yellow-500/50 text-[#ffcc00] font-black text-xs animate-pulse">
                      🎯
                    </div>
                    <div>
                      <span className="text-[#ffcc00] font-black text-xs sm:text-sm tracking-wide">MODUL ALPHA CONFLUENCE (ZON SNIPER)</span>
                      <p className="text-[10px] text-gray-400">Pencarian Zon Pertindihan Kebarangkalian Tinggi (High Probability)</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {(!data.alphaConfluence || data.alphaConfluence.length === 0) ? (
                    <div className="text-gray-400 text-xs italic p-4 bg-black/40 rounded border border-gray-800 text-center">
                      <span className="text-lg block mb-2">⏳</span>
                      Tiada Setup High Probability (Confluence) buat masa ini. Sila tunggu, jangan FOMO!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.alphaConfluence.map((conf: any, idx: number) => (
                        <div key={idx} className={\`p-4 rounded-xl border \${conf.type === 'BULLISH' ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}\`}>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={\`font-black text-lg \${conf.type === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}\`}>
                                  {conf.type === 'BULLISH' ? 'BUY ZONE' : 'SELL ZONE'}
                                </span>
                                <span className="flex items-center gap-0.5 text-[#ffcc00] text-sm">
                                  {Array.from({length: conf.stars}).map((_, i) => <span key={i}>⭐</span>)}
                                </span>
                              </div>
                              <div className="text-[#ffcc00] font-mono font-black text-2xl tracking-wider">
                                {conf.bottom.toFixed(2)} - {conf.top.toFixed(2)}
                              </div>
                            </div>
                            
                            <div className={\`flex-shrink-0 flex items-center justify-center p-3 rounded-lg border \${conf.type === 'BULLISH' ? 'bg-emerald-900/40 border-emerald-500/30' : 'bg-rose-900/40 border-rose-500/30'}\`}>
                              <div className="text-center">
                                <div className="text-[10px] text-gray-300 font-bold mb-0.5 uppercase">Cadangan SL</div>
                                <div className="font-mono font-black text-white">
                                  {conf.type === 'BULLISH' ? (conf.bottom - 1.5).toFixed(2) : (conf.top + 1.5).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-white/10 pt-3">
                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Pertindihan Bukti (Confluence Elements):</div>
                            <div className="flex flex-wrap gap-2">
                              {conf.elements.map((el: string, i: number) => (
                                <span key={i} className="px-2.5 py-1 rounded bg-black/60 border border-white/10 text-xs font-bold text-gray-200">
                                  ✓ {el}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
`;

let app = fs.readFileSync('src/App.tsx', 'utf8');

const rightColumnWrapperStartRegex = /(<div className=\{\`\$\{viewMode === 'FOCUS' && !\['sec-alpha', 'sec-bias-plan', 'sec-manual-setup', 'sec-ob', 'sec-fvg', 'sec-snr', 'sec-snd', 'sec-liquidity', 'sec-bos'\]\.includes\(activeSection\) \? 'hidden' : viewMode === 'FOCUS' \? 'col-span-12 flex flex-col gap-3 lg:gap-4' : 'lg:col-span-5 xl:col-span-4 flex flex-col gap-3 lg:gap-4'\}\`>)\n/;

app = app.replace(rightColumnWrapperStartRegex, "$1\n" + alphaSection);

fs.writeFileSync('src/App.tsx', app);

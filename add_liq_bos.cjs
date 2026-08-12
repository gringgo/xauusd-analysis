const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const newSections = `
            {/* ZON LIQUIDITY (PERANGKAP) */}
            {(viewMode === 'ALL' || activeSection === 'sec-liquidity') && (
              <div id="sec-liquidity" className="scroll-mt-6 border border-blue-500/40 rounded-xl bg-[#0a0a0a] shadow-xl shadow-black/80 overflow-hidden">
                <div className="border-b border-blue-500/30 bg-gradient-to-r from-[#111] via-[#051122] to-[#111] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-500/50 text-blue-300 font-black text-xs">
                      💧
                    </div>
                    <div>
                      <span className="text-[#ffcc00] font-black text-xs sm:text-sm tracking-wide">ZON LIQUIDITY (PERANGKAP)</span>
                      <p className="text-[10px] text-gray-400">Sasaran Sapuan (Stop Hunt) Runcit</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {data.liquidity && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* BUY SIDE LIQUIDITY */}
                      <div className="border border-rose-500/30 bg-rose-950/10 rounded-lg p-3">
                        <div className="text-rose-400 font-black text-xs mb-2 border-b border-rose-500/20 pb-1 flex items-center justify-between">
                          <span>📈 BUY SIDE LIQUIDITY (BSL)</span>
                          <span className="text-[10px] text-rose-300/60 font-medium">Zon Stop Loss Seller</span>
                        </div>
                        <ul className="space-y-2">
                          {data.liquidity.buySide?.map((l: any, i: number) => (
                            <li key={i} className="flex items-center justify-between bg-black/40 p-2 rounded border border-rose-500/10">
                              <span className="text-xs text-rose-300 font-bold">{l.label}</span>
                              <span className="text-white font-mono font-black">{l.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* SELL SIDE LIQUIDITY */}
                      <div className="border border-emerald-500/30 bg-emerald-950/10 rounded-lg p-3">
                        <div className="text-emerald-400 font-black text-xs mb-2 border-b border-emerald-500/20 pb-1 flex items-center justify-between">
                          <span>📉 SELL SIDE LIQUIDITY (SSL)</span>
                          <span className="text-[10px] text-emerald-300/60 font-medium">Zon Stop Loss Buyer</span>
                        </div>
                        <ul className="space-y-2">
                          {data.liquidity.sellSide?.map((l: any, i: number) => (
                            <li key={i} className="flex items-center justify-between bg-black/40 p-2 rounded border border-emerald-500/10">
                              <span className="text-xs text-emerald-300 font-bold">{l.label}</span>
                              <span className="text-white font-mono font-black">{l.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 bg-black/40 p-2.5 rounded border border-gray-800/80 leading-relaxed italic">
                    💡 <strong className="text-gray-300">Nota Trader:</strong> Zon Liquidity bukanlah zon untuk Entry! Ia adalah zon sasaran (target) di mana harga biasanya akan pergi untuk 'sapu' Stop Loss trader runcit sebelum membuat 'Fakeout' dan berpatah balik semula. Biarkan Liquidity disapu dahulu sebelum mencari Setup di zon OB/FVG berdekatan.
                  </div>
                </div>
              </div>
            )}

            {/* BREAK OF STRUCTURE (BOS) */}
            {(viewMode === 'ALL' || activeSection === 'sec-bos') && (
              <div id="sec-bos" className="scroll-mt-6 border border-cyan-500/40 rounded-xl bg-[#0a0a0a] shadow-xl shadow-black/80 overflow-hidden">
                <div className="border-b border-cyan-500/30 bg-gradient-to-r from-[#111] via-[#05151a] to-[#111] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-black text-xs">
                      📈
                    </div>
                    <div>
                      <span className="text-[#ffcc00] font-black text-xs sm:text-sm tracking-wide">BREAK OF STRUCTURE (BOS)</span>
                      <p className="text-[10px] text-gray-400">Pengesahan Trend & Penerusan</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  {data.bos && (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className={\`flex-1 p-3 rounded-lg border \${data.bos.type === 'BULLISH' ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/40'} w-full\`}>
                          <div className="text-[10px] font-bold text-gray-400 mb-1 uppercase">Status Struktur Semasa</div>
                          <div className={\`text-lg sm:text-xl font-black \${data.bos.type === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}\`}>
                            {data.bos.status}
                          </div>
                        </div>
                        <div className="flex-1 p-3 rounded-lg border border-cyan-500/20 bg-cyan-950/10 w-full">
                          <div className="text-[10px] font-bold text-gray-400 mb-1 uppercase">Pola Struktur</div>
                          <div className="text-lg sm:text-xl font-black text-cyan-400 font-mono tracking-wider">
                            {data.bos.structure}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 border border-gray-800 rounded-lg p-3">
                        <div className="text-xs font-bold text-gray-300 mb-2 border-b border-gray-800 pb-2">
                          ⚠️ Amaran Perubahan Arah (Change of Character / ChoCh):
                        </div>
                        <ul className="list-disc pl-4 space-y-1.5 mt-2">
                          {data.bos.changeBiasConditions?.map((cond, i) => (
                            <li key={i} className="text-[11px] text-gray-400 leading-tight">
                              {cond}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  <div className="mt-4 text-[10px] text-gray-400 bg-black/40 p-2.5 rounded border border-gray-800/80 leading-relaxed italic">
                    💡 <strong className="text-gray-300">Nota Trader:</strong> BOS (Break of Structure) berfungsi sebagai pengesahan bahawa trend pasaran semasa masih kukuh. Selagi paras penentu (ChoCh) tidak ditembusi, kita kekal mencari peluang entry ke arah trend struktur tersebut.
                  </div>
                </div>
              </div>
            )}
`;

file = file.replace(
  "{/* ORDER BLOCK & FVG */}",
  newSections + "\n\n            {/* ORDER BLOCK & FVG */}"
);

// We also need to fix activeSection filter in RIGHT COLUMN focus mode
file = file.replace(
  "['sec-bias-plan', 'sec-manual-setup', 'sec-ob', 'sec-fvg', 'sec-snr', 'sec-snd', 'sec-liquidity', 'sec-liquidity-bos']",
  "['sec-bias-plan', 'sec-manual-setup', 'sec-ob', 'sec-fvg', 'sec-snr', 'sec-snd', 'sec-liquidity', 'sec-bos']"
);

fs.writeFileSync('src/App.tsx', file);

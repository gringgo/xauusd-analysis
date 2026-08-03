const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const sbrRbsCode = `
            {/* SBR & RBS (Support/Resistance & SND Structure) */}
            {(viewMode === 'ALL' || activeSection === 'sec-sbr-rbs') && (
              <div id="sec-sbr-rbs" className="scroll-mt-6 border border-[#b49a45]/40 rounded-xl bg-[#0a0a0a] shadow-xl shadow-black/80 overflow-hidden">
                {/* Card Header */}
                <div className="border-b border-[#b49a45]/30 bg-gradient-to-r from-[#14120a] via-[#111111] to-[#0d131a] px-4 py-3 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#ffcc00]/10 border border-[#ffcc00]/30 text-[#ffcc00] font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <h3 className="text-white font-black text-sm tracking-wide flex items-center gap-2">
                        SBR & RBS <span className="text-gray-300 font-medium text-[11px] hidden sm:inline">(Support/Resistance & SND Structure)</span>
                      </h3>
                      <p className="text-[10px] text-gray-400">Peta Struktur RBR (Rally-Base-Rally) & DBD (Drop-Base-Drop)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] bg-red-950/80 text-red-300 border border-red-800/60 px-2 py-0.5 rounded font-extrabold">
                      SELL @ DBD / SBR
                    </span>
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded font-extrabold">
                      BUY @ RBR / RBS
                    </span>
                  </div>
                </div>

                <div className="p-4 border-b border-gray-800/80 bg-[#111]">
                  <SbrRbsVisualDiagram />
                </div>

                {/* Main Content Grid: H4 vs H1 */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* H4 TIMEFRAME */}
                  <div className="bg-[#0e0e0e] border border-gray-800/80 rounded-xl p-3.5 space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <span className="text-[#ffcc00] font-black text-xs tracking-wider flex items-center gap-1.5">
                        📊 TIMEFRAME H4
                      </span>
                      <span className="text-[10px] text-gray-400 bg-black px-2 py-0.5 rounded border border-gray-800 font-mono">
                        Major SNR
                      </span>
                    </div>

                    {/* H4 SBR */}
                    {data.sbr_rbs?.h4?.sbr ? (
                      <div className="bg-gradient-to-r from-red-950/40 via-black to-[#0a0a0a] border border-red-900/50 rounded-lg p-2.5 space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center flex-wrap gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black bg-red-600 text-white px-2 py-0.5 rounded shadow">
                              🔻 SELL SIGNAL
                            </span>
                            <span className="text-xs font-bold text-red-300">
                              DBD / SBR (H4)
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                            WinRate: {data.sbr_rbs.h4.sbr.winRate}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[11px] text-gray-400">Paras Entry SBR:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-extrabold text-sm text-white bg-black px-2 py-0.5 rounded border border-red-900/60">
                              {data.sbr_rbs.h4.sbr.price}
                            </span>
                            <QuickCopyBtn text={data.sbr_rbs.h4.sbr.price} />
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">
                          {data.sbr_rbs.h4.sbr.description || 'Support H4 tembus → bertukar jadi Resistance. Cari Rejection Sell.'}
                        </p>
                      </div>
                    ) : null}

                    {/* H4 RBS */}
                    {data.sbr_rbs?.h4?.rbs ? (
                      <div className="bg-gradient-to-r from-emerald-950/40 via-black to-[#0a0a0a] border border-emerald-900/50 rounded-lg p-2.5 space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center flex-wrap gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black bg-emerald-600 text-white px-2 py-0.5 rounded shadow">
                              🟢 BUY SIGNAL
                            </span>
                            <span className="text-xs font-bold text-emerald-300">
                              RBR / RBS (H4)
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                            WinRate: {data.sbr_rbs.h4.rbs.winRate}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[11px] text-gray-400">Paras Entry RBS:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-extrabold text-sm text-white bg-black px-2 py-0.5 rounded border border-emerald-900/60">
                              {data.sbr_rbs.h4.rbs.price}
                            </span>
                            <QuickCopyBtn text={data.sbr_rbs.h4.rbs.price} />
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">
                          {data.sbr_rbs.h4.rbs.description || 'Resistance H4 tembus → bertukar jadi Support. Cari Rejection Buy.'}
                        </p>
                      </div>
                    ) : null}

                    {!data.sbr_rbs?.h4?.sbr && !data.sbr_rbs?.h4?.rbs && (
                      <div className="text-gray-500 text-xs italic text-center py-4 bg-black/40 rounded-lg border border-dashed border-gray-800">
                        Tiada persilangan SBR/RBS yang jelas di H4 buat masa ini.
                      </div>
                    )}
                  </div>

                  {/* H1 TIMEFRAME */}
                  <div className="bg-[#0e0e0e] border border-gray-800/80 rounded-xl p-3.5 space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                      <span className="text-[#4da6ff] font-black text-xs tracking-wider flex items-center gap-1.5">
                        📈 TIMEFRAME H1
                      </span>
                      <span className="text-[10px] text-gray-400 bg-black px-2 py-0.5 rounded border border-gray-800 font-mono">
                        Precision SNR
                      </span>
                    </div>

                    {/* H1 SBR */}
                    {data.sbr_rbs?.h1?.sbr ? (
                      <div className="bg-gradient-to-r from-red-950/40 via-black to-[#0a0a0a] border border-red-900/50 rounded-lg p-2.5 space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center flex-wrap gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black bg-red-600 text-white px-2 py-0.5 rounded shadow">
                              🔻 SELL SIGNAL
                            </span>
                            <span className="text-xs font-bold text-red-300">
                              DBD / SBR (H1)
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                            WinRate: {data.sbr_rbs.h1.sbr.winRate}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[11px] text-gray-400">Paras Entry SBR:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-extrabold text-sm text-white bg-black px-2 py-0.5 rounded border border-red-900/60">
                              {data.sbr_rbs.h1.sbr.price}
                            </span>
                            <QuickCopyBtn text={data.sbr_rbs.h1.sbr.price} />
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">
                          {data.sbr_rbs.h1.sbr.description || 'Support H1 tembus → bertukar jadi Resistance. Cari Rejection Sell.'}
                        </p>
                      </div>
                    ) : null}

                    {/* H1 RBS */}
                    {data.sbr_rbs?.h1?.rbs ? (
                      <div className="bg-gradient-to-r from-emerald-950/40 via-black to-[#0a0a0a] border border-emerald-900/50 rounded-lg p-2.5 space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center flex-wrap gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black bg-emerald-600 text-white px-2 py-0.5 rounded shadow">
                              🟢 BUY SIGNAL
                            </span>
                            <span className="text-xs font-bold text-emerald-300">
                              RBR / RBS (H1)
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                            WinRate: {data.sbr_rbs.h1.rbs.winRate}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-[11px] text-gray-400">Paras Entry RBS:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-extrabold text-sm text-white bg-black px-2 py-0.5 rounded border border-emerald-900/60">
                              {data.sbr_rbs.h1.rbs.price}
                            </span>
                            <QuickCopyBtn text={data.sbr_rbs.h1.rbs.price} />
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-400 italic">
                          {data.sbr_rbs.h1.rbs.description || 'Resistance H1 tembus → bertukar jadi Support. Cari Rejection Buy.'}
                        </p>
                      </div>
                    ) : null}

                    {!data.sbr_rbs?.h1?.sbr && !data.sbr_rbs?.h1?.rbs && (
                      <div className="text-gray-500 text-xs italic text-center py-4 bg-black/40 rounded-lg border border-dashed border-gray-800">
                        Tiada persilangan SBR/RBS yang jelas di H1 buat masa ini.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
`;

code = code.replace('<ConfluenceScore data={data} />', sbrRbsCode + '\n            <ConfluenceScore data={data} />');

if (!code.includes('import { SbrRbsVisualDiagram }')) {
  code = code.replace("import React", "import { SbrRbsVisualDiagram } from './components/SbrRbsVisualDiagram';\nimport React");
}

code = code.replace(/!\['sec-bias-plan', 'sec-ob-fvg', 'sec-liquidity'/, "!['sec-bias-plan', 'sec-ob-fvg', 'sec-sbr-rbs', 'sec-liquidity'");

fs.writeFileSync('src/App.tsx', code);

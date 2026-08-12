const fs = require('fs');

const content = fs.readFileSync('src/App.tsx', 'utf-8');

// Find the start and end of the block
const startMarker = '{/* SBR & RBS (Support/Resistance & SND Structure) */}';
const endMarker = '{/* ORDER BLOCK & FVG */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers");
  process.exit(1);
}

const beforeBlock = content.slice(0, startIndex);
const afterBlock = content.slice(endIndex);

// Generate SNR Block
let snrBlock = `            {/* SNR: SBR & RBS (Support/Resistance) */}
            {(viewMode === 'ALL' || activeSection === 'sec-snr') && (
              <div id="sec-snr" className="scroll-mt-6 border border-amber-500/40 rounded-xl bg-[#0a0a0a] shadow-xl shadow-black/80 overflow-hidden">
                <div className="border-b border-amber-500/30 bg-gradient-to-r from-[#14120a] via-[#111111] to-[#0d131a] px-4 py-3 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <h3 className="text-white font-black text-sm tracking-wide flex items-center gap-2">
                        MODUL SNR <span className="text-gray-300 font-medium text-[11px] hidden sm:inline">(SBR & RBS)</span>
                      </h3>
                      <p className="text-[10px] text-gray-400">Peta Struktur Support & Resistance</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-b border-gray-800/80 bg-[#111] flex flex-col gap-6">
                  <StructureSOPDashboard sbrRbsData={data.sbr_rbs} currentPrice={data.currentPrice} filterType="SNR" />
                  <SbrRbsVisualDiagram filterType="SNR" />
                </div>
              </div>
            )}
`;

// Generate SND Block
let sndBlock = `
            {/* SND: DBD & RBR (Supply/Demand) */}
            {(viewMode === 'ALL' || activeSection === 'sec-snd') && (
              <div id="sec-snd" className="scroll-mt-6 border border-purple-500/40 rounded-xl bg-[#0a0a0a] shadow-xl shadow-black/80 overflow-hidden">
                <div className="border-b border-purple-500/30 bg-gradient-to-r from-[#140a12] via-[#111111] to-[#100d1a] px-4 py-3 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-500 font-bold text-xs">
                      🔥
                    </div>
                    <div>
                      <h3 className="text-white font-black text-sm tracking-wide flex items-center gap-2">
                        MODUL SND <span className="text-gray-300 font-medium text-[11px] hidden sm:inline">(DBD & RBR)</span>
                      </h3>
                      <p className="text-[10px] text-gray-400">Peta Struktur Drop-Base-Drop & Rally-Base-Rally</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-b border-gray-800/80 bg-[#111] flex flex-col gap-6">
                  <StructureSOPDashboard sbrRbsData={data.sbr_rbs} currentPrice={data.currentPrice} filterType="SND" />
                  <SbrRbsVisualDiagram filterType="SND" />
                </div>
              </div>
            )}
`;

fs.writeFileSync('src/App.tsx', beforeBlock + snrBlock + sndBlock + '\n            ' + afterBlock);
console.log("Done");

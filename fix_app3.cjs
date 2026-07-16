const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="p-4 overflow-y-auto flex-1">[\s\S]*?<\/div>\n            \n            <div className="p-4 border-t border-gray-800 bg-\[#111\] flex justify-between items-center text-sm">/m;

const replacement = `<div className="p-4 overflow-y-auto flex-1">
              {journal.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p>Tiada rekod jurnal setakat ini.</p>
                  <p className="text-sm mt-2">Buka Pelan Dagangan harian dan tekan "Simpan Jurnal".</p>
                </div>
              ) : (
                <>
                  <JournalAnalytics journal={journal} />
                  <div className="space-y-4">
                    {journal.map((entry) => (
                      <div key={entry.id} className="border border-gray-800 bg-black rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-white text-lg">{entry.date}</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={\`text-xs px-2 py-0.5 rounded font-bold \${entry.bias === 'BULLISH' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}\`}>
                              {entry.bias}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded font-bold bg-gray-800 text-gray-300">
                              {entry.bos}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-900/50 text-blue-400">
                              {entry.fvg}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            value={entry.status}
                            onChange={(e) => updateJournalStatus(entry.id, e.target.value)}
                            className={\`text-sm font-bold px-3 py-1.5 rounded outline-none cursor-pointer \${
                              entry.status === 'WIN' ? 'bg-[#22c55e] text-black' : 
                              entry.status === 'LOSS' ? 'bg-[#ef4444] text-white' : 
                              'bg-gray-700 text-white'
                            }\`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="WIN">WIN 🏆</option>
                            <option value="LOSS">LOSS ❌</option>
                          </select>
                          <button onClick={() => deleteJournalEntry(entry.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-800 rounded transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-[#111] flex justify-between items-center text-sm">`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', code);

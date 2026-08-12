const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

// Add Print Icon if not there
if (!file.includes('Printer,')) {
  file = file.replace("Download,", "Download, Printer,");
}

const newHeader = `
            <div id="journal-modal-content" className="bg-[#0a0a0a] border-2 border-[#b49a45] rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_0_30px_rgba(180,154,69,0.2)] overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#111]">
                <div className="flex items-center gap-2 text-[#ffcc00] font-bold text-lg">
                  <BookOpen className="w-5 h-5" />
                  JURNAL TRADING GRINGGO
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  {journal.length > 0 && (
                    <>
                      <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cetak / PDF</span>
                      </button>
                      <button onClick={exportJournalToCSV} className="flex items-center gap-1.5 bg-[#b49a45]/20 hover:bg-[#b49a45]/40 text-[#ffcc00] px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-[#b49a45]/40">
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Eksport CSV</span>
                      </button>
                    </>
                  )}
                  <button onClick={() => setShowJournal(false)} className="text-gray-400 hover:text-white transition-colors ml-1">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
`;

file = file.replace(
  /<div className="bg-\[#0a0a0a\] border-2 border-\[#b49a45\] rounded-xl w-full max-w-2xl max-h-\[80vh\] flex flex-col shadow-\[0_0_30px_rgba\(180,154,69,0\.2\)\] overflow-hidden">[\s\S]*?<button onClick=\{\(\) => setShowJournal\(false\)\} className="text-gray-400 hover:text-white transition-colors">\s*<X className="w-6 h-6" \/>\s*<\/button>\s*<\/div>\s*<\/div>/,
  newHeader
);

fs.writeFileSync('src/App.tsx', file);

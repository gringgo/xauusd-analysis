const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const exportFunctions = `
  const exportJournalToCSV = () => {
    if (journal.length === 0) return;
    const headers = ['ID', 'Tarikh', 'Arah (Bias)', 'Pelan', 'Harga (Entry)', 'Status', 'Pips', 'Nota'];
    const rows = journal.map(j => [
      j.id,
      j.date,
      j.bias,
      j.plan,
      j.planData?.range || '-',
      j.status,
      j.pipsWon || 0,
      j.notes || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\\n" 
      + rows.map(e => e.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(",")).join("\\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", \`jurnal_trading_\${new Date().toISOString().slice(0,10)}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;

// Insert the functions before "return (" of App component
// We can find "const deleteJournalEntry" and insert there
if (!file.includes('exportJournalToCSV')) {
  file = file.replace(
    /const deleteJournalEntry = async \(id: number\) => \{[\s\S]*?\};\n/,
    match => match + "\\n" + exportFunctions
  );
}

// Add the Download Icon if not there
if (!file.includes('Download,')) {
  file = file.replace("BookOpen,", "BookOpen, Download,");
}

// Add the buttons to the Modal Header
const newHeader = `
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#111]">
              <div className="flex items-center gap-2 text-[#ffcc00] font-bold text-lg">
                <BookOpen className="w-5 h-5" />
                JURNAL TRADING GRINGGO
              </div>
              <div className="flex items-center gap-3">
                {journal.length > 0 && (
                  <button onClick={exportJournalToCSV} className="hidden sm:flex items-center gap-1.5 bg-[#b49a45]/20 hover:bg-[#b49a45]/40 text-[#ffcc00] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-[#b49a45]/40">
                    <Download className="w-3.5 h-3.5" />
                    Eksport CSV
                  </button>
                )}
                <button onClick={() => setShowJournal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
`;

file = file.replace(
  /<div className="flex justify-between items-center p-4 border-b border-gray-800 bg-\[#111\]">[\s\S]*?<\/button>\s*<\/div>/,
  newHeader
);

fs.writeFileSync('src/App.tsx', file);

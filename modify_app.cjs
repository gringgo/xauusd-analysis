const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add JournalAnalytics Component
const journalAnalyticsCode = `
const JournalAnalytics = ({ journal }: { journal: any[] }) => {
  const completed = journal.filter(j => j.status === 'WIN' || j.status === 'LOSS');
  const wins = journal.filter(j => j.status === 'WIN').length;
  const losses = journal.filter(j => j.status === 'LOSS').length;
  const winRate = completed.length > 0 ? ((wins / completed.length) * 100).toFixed(1) : '0.0';
  
  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4 flex flex-col items-center justify-center">
        <div className="text-gray-400 text-xs sm:text-sm mb-1 font-bold">Kadar Kemenangan (Win Rate)</div>
        <div className="text-2xl sm:text-3xl font-black text-white">{winRate}%</div>
        <div className="text-xs text-gray-500 mt-1">{wins} Win / {losses} Loss</div>
      </div>
      <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4 flex flex-col items-center justify-center">
        <div className="text-gray-400 text-xs sm:text-sm mb-1 font-bold">Nisbah R:R Purata</div>
        <div className="text-2xl sm:text-3xl font-black text-[#4da6ff]">1:2</div>
        <div className="text-xs text-gray-500 mt-1">Anggaran strategi</div>
      </div>
      <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4 flex flex-col items-center justify-center">
        <div className="text-gray-400 text-xs sm:text-sm mb-1 font-bold">Jumlah Dagangan</div>
        <div className="text-2xl sm:text-3xl font-black text-[#ffcc00]">{completed.length}</div>
        <div className="text-xs text-gray-500 mt-1">Selesai</div>
      </div>
    </div>
  )
};
`;
code = code.replace(/export default function App\(\) \{/, journalAnalyticsCode + '\nexport default function App() {\n  const [aiSummary, setAiSummary] = useState<string | null>(null);\n  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);');

// Add fetchAiSummary function
const fetchAiSummaryCode = `
  const fetchAiSummary = async () => {
    if (!data) return;
    setIsLoadingAi(true);
    setAiSummary(null);
    try {
      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      const result = await res.json();
      setAiSummary(result.text);
    } catch (e) {
      console.error(e);
      setAiSummary("Gagal mendapatkan rumusan AI.");
    } finally {
      setIsLoadingAi(false);
    }
  };
`;
code = code.replace(/const saveToJournal = async \(\) => \{/, fetchAiSummaryCode + '\n  const saveToJournal = async () => {');

// Add AI Summary UI before BIAS UTAMA
const aiSummaryUI = `
            {/* AI SUMMARY */}
            <div className="border border-[#b49a45] rounded bg-[#0a0a0a]">
              <div className="border-b border-[#b49a45] px-3 py-1 flex justify-between items-center">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2">
                  <span className="text-lg">🤖</span> GEMINI AI RUMUSAN PASARAN
                </span>
              </div>
              <div className="p-3">
                {!aiSummary && !isLoadingAi && (
                  <button onClick={fetchAiSummary} className="w-full py-2 bg-blue-900/40 text-blue-400 border border-blue-500/50 rounded font-bold hover:bg-blue-800/40 transition-colors text-sm flex items-center justify-center gap-2">
                    <span className="text-lg">✨</span> Jana Rumusan Pasaran (AI)
                  </button>
                )}
                {isLoadingAi && (
                  <div className="text-center text-sm text-gray-400 py-4 flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[#4da6ff] border-t-transparent rounded-full animate-spin"></div>
                    Menganalisis pasaran...
                  </div>
                )}
                {aiSummary && (
                  <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {aiSummary}
                  </div>
                )}
              </div>
            </div>
`;
code = code.replace(/\{\/\* BIAS UTAMA \*\/\}/, aiSummaryUI + '\n            {/* BIAS UTAMA */}');

// Add Journal Analytics inside journal view
code = code.replace(/<div className="space-y-4">/, '<JournalAnalytics journal={journal} />\n                <div className="space-y-4">');

// Add react-markdown if needed for AI summary? No, it's just text.

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx updated");

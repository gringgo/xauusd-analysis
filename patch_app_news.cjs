const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add Flame to lucide-react import if not present
if (!appContent.includes('Flame,')) {
  appContent = appContent.replace("import { \n  Calendar,", "import { \n  Flame,\n  Calendar,");
}

// 2. Import HighImpactNewsModal
if (!appContent.includes('HighImpactNewsModal')) {
  appContent = `import { HighImpactNewsModal, NewsItem } from './components/HighImpactNewsModal';\n` + appContent;
}

// 3. Add state and handlers inside App component
const stateTarget = `const [showJournal, setShowJournal] = useState(false);`;
const stateReplacement = `const [showJournal, setShowJournal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsHistoryList, setNewsHistoryList] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch('/api/news-history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setNewsHistoryList(data);
      })
      .catch(console.error);
  }, []);

  const handleAddNews = async (item: Partial<NewsItem>) => {
    try {
      const res = await fetch('/api/news-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      const saved = await res.json();
      setNewsHistoryList([saved, ...newsHistoryList]);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan ramalan news.');
    }
  };

  const handleUpdateNews = async (id: number, updates: Partial<NewsItem>) => {
    try {
      const res = await fetch(\`/api/news-history/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updated = await res.json();
      setNewsHistoryList(newsHistoryList.map(n => n.id === id ? updated : n));
    } catch (e) {
      console.error(e);
      alert('Gagal mengemas kini news.');
    }
  };

  const handleDeleteNews = async (id: number) => {
    try {
      await fetch(\`/api/news-history/\${id}\`, { method: 'DELETE' });
      setNewsHistoryList(newsHistoryList.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
      alert('Gagal memadam news.');
    }
  };`;

appContent = appContent.replace(stateTarget, stateReplacement);

// 4. Add News button in Header next to JURNAL button
const journalBtnTarget = `<button onClick={() => setShowJournal(true)} className="ml-2 flex items-center gap-1 bg-[#b49a45] text-black px-2 py-1 rounded font-bold text-xs sm:text-sm hover:bg-[#ffcc00] transition-colors">
                  <BookOpen className="w-4 h-4" />
                  JURNAL
                </button>`;

const journalBtnReplacement = `<button onClick={() => setShowJournal(true)} className="ml-2 flex items-center gap-1 bg-[#b49a45] text-black px-2 py-1 rounded font-bold text-xs sm:text-sm hover:bg-[#ffcc00] transition-colors">
                  <BookOpen className="w-4 h-4" />
                  JURNAL
                </button>

                <button onClick={() => setShowNewsModal(true)} className="ml-2 flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded font-black text-xs sm:text-sm hover:bg-red-500 transition-colors shadow-lg shadow-red-900/40">
                  <Flame className="w-4 h-4 text-[#ffcc00]" />
                  NEWS IMPAK TINGGI
                </button>`;

appContent = appContent.replace(journalBtnTarget, journalBtnReplacement);

// 5. Add button inside LIVE NEWS FEED header
const newsFeedHeaderTarget = `<div className="bg-[#1e3a8a] px-3 py-1.5 flex items-center gap-2 border-b border-[#b49a45]">
                  <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5" />
                  <span className="text-white font-bold text-xs sm:text-sm tracking-wide">LIVE NEWS FEED (USD)</span>
                </div>`;

const newsFeedHeaderReplacement = `<div className="bg-[#1e3a8a] px-3 py-1.5 flex items-center justify-between border-b border-[#b49a45]">
                  <div className="flex items-center gap-2">
                    <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5" />
                    <span className="text-white font-bold text-xs sm:text-sm tracking-wide">LIVE NEWS FEED (USD)</span>
                  </div>
                  <button 
                    onClick={() => setShowNewsModal(true)}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded shadow transition-colors"
                  >
                    <Flame className="w-3 h-3 text-[#ffcc00]" />
                    ANALISIS & HISTORY NEWS
                  </button>
                </div>`;

appContent = appContent.replace(newsFeedHeaderTarget, newsFeedHeaderReplacement);

// 6. Add HighImpactNewsModal before closing tag
const modalTarget = `      )}



    </>`;

const modalReplacement = `      )}

      <HighImpactNewsModal 
        isOpen={showNewsModal}
        onClose={() => setShowNewsModal(false)}
        newsList={newsHistoryList}
        onAddNews={handleAddNews}
        onUpdateNews={handleUpdateNews}
        onDeleteNews={handleDeleteNews}
      />

    </>`;

appContent = appContent.replace(modalTarget, modalReplacement);

fs.writeFileSync('src/App.tsx', appContent);
console.log('App.tsx patched successfully');

const fs = require('fs');

let modal = fs.readFileSync('src/components/TwelveDataModal.tsx', 'utf8');

// Add props
modal = modal.replace(
  "  currentPrice: number | null;\n}",
  "  currentPrice: number | null;\n  isCompactMode?: boolean;\n  setIsCompactMode?: (val: boolean) => void;\n}"
);

// Destructure
modal = modal.replace(
  "  currentPrice,\n}) => {",
  "  currentPrice,\n  isCompactMode = false,\n  setIsCompactMode,\n}) => {"
);

// Add tab state
modal = modal.replace(
  "const [activeTab, setActiveTab] = useState<'TWELVEDATA' | 'SWISSQUOTE'>('SWISSQUOTE');",
  "const [activeTab, setActiveTab] = useState<'TWELVEDATA' | 'SWISSQUOTE' | 'PAPARAN'>('PAPARAN');"
);

// Update Modal Header
modal = modal.replace(
  "TETAPAN PRICE FEED XAU/USD",
  "TETAPAN SISTEM & PAPARAN"
);
modal = modal.replace(
  "Pilih / Masukkan API Key bagi Twelve Data atau Swissquote",
  "Konfigurasi Price Feed XAU/USD dan Paparan Antaramuka"
);

// Add Tab Button
const tabsReplacement = `
        <div className="flex bg-black p-1 rounded-xl border border-gray-800 mb-4 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('PAPARAN')}
            className={\`flex-1 py-1.5 px-2 min-w-[80px] rounded-lg text-center transition-all \${activeTab === 'PAPARAN' ? 'bg-[#ffcc00] text-black font-black' : 'text-gray-400 hover:text-white'}\`}
          >
            📱 PAPARAN UI
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TWELVEDATA')}
            className={\`flex-1 py-1.5 px-2 min-w-[80px] rounded-lg text-center transition-all \${activeTab === 'TWELVEDATA' ? 'bg-[#ffcc00] text-black font-black' : 'text-gray-400 hover:text-white'}\`}
          >
            ⚡ TWELVEDATA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SWISSQUOTE')}
            className={\`flex-1 py-1.5 px-2 min-w-[80px] rounded-lg text-center transition-all \${activeTab === 'SWISSQUOTE' ? 'bg-[#ffcc00] text-black font-black' : 'text-gray-400 hover:text-white'}\`}
          >
            🇨🇭 SWISSQUOTE
          </button>
        </div>
`;

modal = modal.replace(
  /<div className="flex bg-black p-1 rounded-xl border border-gray-800 mb-4 text-xs font-bold">[\s\S]*?<\/div>/,
  tabsReplacement
);

// Add Paparan UI Content
const paparanContent = `
          {activeTab === 'PAPARAN' && (
            <div className="space-y-4">
              <div className="bg-[#181818] border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-white block mb-0.5">Mod Kompak (Compact Mode)</label>
                    <p className="text-[10px] text-gray-400">Sembunyikan teks penerangan (Nota Trader) untuk antaramuka yang lebih padat dan bersih (sesuai untuk mobile).</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCompactMode && setIsCompactMode(!isCompactMode)}
                    className={\`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none \${isCompactMode ? 'bg-[#ffcc00]' : 'bg-gray-700'}\`}
                  >
                    <span
                      className={\`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out \${isCompactMode ? 'translate-x-5' : 'translate-x-0'}\`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
`;

modal = modal.replace(
  "{activeTab === 'TWELVEDATA' && (",
  paparanContent + "\n          {activeTab === 'TWELVEDATA' && ("
);

// Fix height of status box if in PAPARAN to hide it, or keep it. Let's keep it.
fs.writeFileSync('src/components/TwelveDataModal.tsx', modal);

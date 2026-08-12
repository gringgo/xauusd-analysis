const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Add state
const stateHook = `  const [isCompactMode, setIsCompactMode] = useState(() => {
    const saved = localStorage.getItem('gringgo_compact_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('gringgo_compact_mode', JSON.stringify(isCompactMode));
  }, [isCompactMode]);
`;

// Insert after "const [showTwelveDataModal, setShowTwelveDataModal] = useState(false);"
app = app.replace(
  "const [showTwelveDataModal, setShowTwelveDataModal] = useState(false);\n",
  "const [showTwelveDataModal, setShowTwelveDataModal] = useState(false);\n" + stateHook + "\n"
);

// Pass to TwelveDataModal
app = app.replace(
  "<TwelveDataModal\n        isOpen={showTwelveDataModal}",
  "<TwelveDataModal\n        isOpen={showTwelveDataModal}\n        isCompactMode={isCompactMode}\n        setIsCompactMode={setIsCompactMode}"
);

// We need a CSS class to hide descriptions globally if isCompactMode is true
// Let's add 'compact-mode' class to the main div
app = app.replace(
  'className="min-h-screen bg-black text-gray-200 font-sans selection:bg-[#ffcc00] selection:text-black flex flex-col relative"',
  'className={`min-h-screen bg-black text-gray-200 font-sans selection:bg-[#ffcc00] selection:text-black flex flex-col relative ${isCompactMode ? \'compact-mode\' : \'\'}`}'
);

// Tooltip title for Tetapan
app = app.replace(
  'title="Tetapan Twelve Data WebSocket API Key"',
  'title="Tetapan Sistem & Paparan"'
);

fs.writeFileSync('src/App.tsx', app);

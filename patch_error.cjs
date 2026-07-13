const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /export default function App\(\) {[\s\S]*?if \(!data\)/m,
  `export default function App() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLiveAnalysis().then(setData).catch(e => setError(e.toString()));
    const interval = setInterval(() => getLiveAnalysis().then(setData).catch(e => setError(e.toString())), 60000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 break-all">{error}</div>;

  if (!data)`
);

fs.writeFileSync('src/App.tsx', code);

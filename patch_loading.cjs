const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add isLoading state
code = code.replace(
  /const \[error, setError\] = useState<string \| null>\(null\);\n\s*const \[targetDate, setTargetDate\] = useState<Date>\(new Date\(\)\);/,
  `const [error, setError] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);`
);

// Update useEffect
const oldUseEffect = `  useEffect(() => {
    setData(null); // Show loading when changing date
    setError(null);
    getLiveAnalysis(targetDate).then(setData).catch(e => setError(e.toString()));
    
    // Only auto-refresh if looking at today
    let interval: any;
    const isToday = targetDate.toDateString() === new Date().toDateString();
    if (isToday) {
      interval = setInterval(() => getLiveAnalysis(targetDate).then(setData).catch(e => setError(e.toString())), 60000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [targetDate]);`;

const newUseEffect = `  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getLiveAnalysis(targetDate)
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch(e => {
        setError(e.toString());
        setIsLoading(false);
      });
    
    // Only auto-refresh if looking at today
    let interval: any;
    const isToday = targetDate.toDateString() === new Date().toDateString();
    if (isToday) {
      interval = setInterval(() => {
        getLiveAnalysis(targetDate).then(setData).catch(e => setError(e.toString()));
      }, 60000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [targetDate]);`;

code = code.replace(oldUseEffect, newUseEffect);

// Update render conditions
const oldRenderCondition = `  if (error) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 break-all">{error}</div>;

  if (!data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Live Data...</div>;`;

const newRenderCondition = `  if (error && !data) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 break-all">{error}</div>;

  if (!data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Live Data...</div>;`;

code = code.replace(oldRenderCondition, newRenderCondition);

// Add opacity to main container during loading
code = code.replace(
  /<div className="w-full max-w-\[1300px\] flex justify-end mb-2">/,
  `<div className={\`w-full max-w-[1300px] flex justify-end mb-2 transition-opacity duration-300 \${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}\`}>`
);

code = code.replace(
  /<div id="export-container" className="w-full max-w-\[1300px\] border border-gray-800 bg-black p-2 sm:p-3 md:p-4 rounded-md shadow-2xl">/,
  `<div id="export-container" className={\`w-full max-w-[1300px] border border-gray-800 bg-black p-2 sm:p-3 md:p-4 rounded-md shadow-2xl transition-opacity duration-300 \${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}\`}>`
);

fs.writeFileSync('src/App.tsx', code);

#!/bin/bash
sed -i 's/import { dailyAnalysis } from '\''\.\/data'\'';/import { getLiveAnalysis } from '\''\.\/liveData'\'';/' src/App.tsx
sed -i 's/export default function App() {/export default function App() {\n  const [data, setData] = useState<any>(null);\n  useEffect(() => {\n    getLiveAnalysis().then(setData).catch(console.error);\n    const interval = setInterval(() => getLiveAnalysis().then(setData).catch(console.error), 60000);\n    return () => clearInterval(interval);\n  }, []);\n\n  if (!data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Live Data...<\/div>;/' src/App.tsx
sed -i 's/const data = dailyAnalysis;//' src/App.tsx

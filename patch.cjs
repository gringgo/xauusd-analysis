const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
const target = `  if (!data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Live Data...</div>;

  return (`;
const replace = `  if (!data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Live Data...</div>;

  const getMarketStatus = () => {
    const d = new Date();
    const mytTime = new Date(d.getTime() + 8 * 3600 * 1000);
    const day = mytTime.getUTCDay();
    const hours = mytTime.getUTCHours();
    if (day === 6 && hours >= 6) return false;
    if (day === 0) return false;
    if (day === 1 && hours < 6) return false;
    return true;
  };
  const marketOpen = getMarketStatus();

  return (`;
code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);

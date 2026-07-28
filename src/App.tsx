import { HighImpactNewsModal, NewsItem } from './components/HighImpactNewsModal';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { useState, useEffect } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import { 
  Flame,
  Calendar, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  CheckCircle2, 
  Check, 
  DollarSign, 
  AlertTriangle,
  BarChart3,
  BookOpen,
  Save,
  X,
  Smartphone,
  Copy
} from 'lucide-react';
import { getLiveAnalysis } from './liveData';
import { LightweightChart } from "./components/LightweightChart";
import * as htmlToImage from 'html-to-image';
import { Download } from 'lucide-react';



const MockCandleChart = (props: any) => null; const OldMockCandleChart = ({ title, subtitle, data, yLabels, xLabels, heightClass = "h-[200px]", fvgBox }: any) => {
  return (
    <div className="border border-gray-700 rounded bg-[#050505] overflow-hidden flex flex-col relative">
      {/* Top Bar inside chart */}
      <div className="absolute top-2 left-2 z-10">
         <div className="bg-[#1e3a8a] text-white px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-sm w-fit tracking-wider">
           {title}
         </div>
         <div className="text-[#4da6ff] text-[10px] sm:text-xs mt-1 font-medium">
           XAUUSD <span className="text-gray-400 text-[8px]">▼</span> {subtitle}
           <br/>
           <span className="text-white">Gold Spot</span>
         </div>
      </div>
      
      {/* Toolbar mock */}
      <div className="absolute top-2 right-14 z-10 flex gap-0.5 opacity-50">
         <div className="w-3 h-3 sm:w-4 sm:h-4 border border-red-500 flex items-center justify-center text-[8px] sm:text-[10px] text-red-500">+</div>
         <div className="w-3 h-3 sm:w-4 sm:h-4 border border-green-500 flex items-center justify-center text-[8px] sm:text-[10px] text-green-500">−</div>
      </div>
      
      {/* Chart Area */}
      <div className={`relative w-full ${heightClass} flex`}>
        {/* Main Chart */}
        <div className="flex-1 relative overflow-hidden">
          {/* Grid */}
          <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 opacity-[0.15]">
             {Array.from({length: 20}).map((_, i) => (
               <div key={i} className="border-t border-l border-gray-500"></div>
             ))}
          </div>
          
          {/* Drawing Canvas */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
             {/* Removed fake indicators */}
             

             {/* FVG Box Highlight if provided */}
             {fvgBox && (
               <rect x={fvgBox.x} y={fvgBox.y} width={fvgBox.w} height={fvgBox.h} fill="rgba(59, 130, 246, 0.25)" />
             )}

             {/* Candles */}
             {data.map((c: any, i: number) => {
                const step = 90 / data.length;
                const x = 5 + i * step;
                const isGreen = c.close < c.open; // Note: Y axis is inverted in SVG
                const color = isGreen ? '#22c55e' : '#ef4444';
                return (
                  <g key={i}>
                    <line x1={x} y1={c.high} x2={x} y2={c.low} stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    <rect 
                      x={x - (step*0.3)} 
                      y={Math.min(c.open, c.close)} 
                      width={step*0.6} 
                      height={Math.max(0.5, Math.abs(c.open - c.close))} 
                      fill={color} stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke" 
                    />
                  </g>
                )
             })}
          </svg>
        </div>
        
        {/* Y Axis */}
        <div className="w-12 sm:w-16 border-l border-gray-800 bg-[#0a0a0a] flex flex-col justify-between py-2 text-[8px] sm:text-[10px] text-gray-400 items-end pr-1 z-10">
          {yLabels.map((l: any, i: number) => (
             <div key={i} className={
               l.highlight === 'red' ? 'bg-[#ef4444] text-white px-0.5 rounded-sm' : 
               l.highlight === 'yellow' ? 'bg-[#ca8a04] text-white px-0.5 rounded-sm' : 
               l.highlight === 'purple' ? 'bg-purple-600 text-white px-0.5 rounded-sm' : 
               l.highlight === 'green' ? 'bg-[#22c55e] text-white px-0.5 rounded-sm' : 
               ''
             }>
               {l.val || l}
             </div>
          ))}
        </div>
      </div>
      
      {/* X Axis */}
      <div className="h-6 border-t border-gray-800 bg-[#0a0a0a] flex justify-between items-center px-2 text-[8px] sm:text-[10px] text-gray-400 mr-12 sm:mr-16 z-10">
        {xLabels.map((l: any, i: number) => <span key={i}>{l}</span>)}
      </div>
    </div>
  )
}

const FvgIllustration = () => (
  <div className="flex flex-col items-center justify-center mt-3 border border-gray-800 rounded bg-black relative w-full h-[100px] sm:h-[120px] overflow-hidden">
     <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
       {/* Candle 1 (Big red) */}
       <line x1="25" y1="10" x2="25" y2="50" stroke="#ef4444" strokeWidth="1" />
       <rect x="22" y="15" width="6" height="30" fill="#ef4444" />
       
       {/* Candle 2 (Huge red) */}
       <line x1="45" y1="30" x2="45" y2="90" stroke="#ef4444" strokeWidth="1" />
       <rect x="42" y="35" width="6" height="50" fill="#ef4444" />
       
       {/* Candle 3 (Small red) */}
       <line x1="65" y1="70" x2="65" y2="95" stroke="#ef4444" strokeWidth="1" />
       <rect x="62" y="75" width="6" height="15" fill="#ef4444" />
       
       {/* FVG Box */}
       <rect x="20" y="50" width="60" height="20" fill="rgba(59, 130, 246, 0.25)" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2,2"/>
       
       {/* Arrow */}
       <path d="M 70 85 Q 85 75 80 60 L 78 63" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2,2" />
       
       {/* Search icon dots to represent the text in image */}
       <circle cx="25" cy="60" r="1.5" fill="#4da6ff" />
       <circle cx="45" cy="60" r="1.5" fill="#4da6ff" />
     </svg>
  </div>
)




export const calculateConfluenceZones = (data: any) => {
  let score = 20;
  let zones: { name: string, price: string, type: 'BULLISH' | 'BEARISH', isMicro?: boolean, top: number, bottom: number }[] = [];
  
  if (data?.fvg?.h4 && data?.sbr_rbs?.h1) {
    const fTop = data.fvg.h4.top;
    const fBot = data.fvg.h4.bottom;
    const fDir = data.fvg.h4.direction;
    
    if (fDir === 'BEARISH' && data.sbr_rbs.h1.sbr) {
      const sPrice = Number(data.sbr_rbs.h1.sbr.price);
      if (sPrice >= fBot * 0.998 && sPrice <= fTop * 1.002) {
         const refinedTop = Math.min(fTop, sPrice + 2.5);
         const refinedBot = Math.max(fBot, sPrice - 2.5);
         zones.push({ name: "H4 FVG + H1 SBR", price: `${refinedBot.toFixed(2)} - ${refinedTop.toFixed(2)}`, type: 'BEARISH', top: refinedTop, bottom: refinedBot });
         score += 30;
      }
    }
    if (fDir === 'BULLISH' && data.sbr_rbs.h1.rbs) {
      const rPrice = Number(data.sbr_rbs.h1.rbs.price);
      if (rPrice >= fBot * 0.998 && rPrice <= fTop * 1.002) {
         const refinedTop = Math.min(fTop, rPrice + 2.5);
         const refinedBot = Math.max(fBot, rPrice - 2.5);
         zones.push({ name: "H4 FVG + H1 RBS", price: `${refinedBot.toFixed(2)} - ${refinedTop.toFixed(2)}`, type: 'BULLISH', top: refinedTop, bottom: refinedBot });
         score += 30;
      }
    }
  }

  if (data?.orderBlock?.h4 && data?.fvg?.h1) {
    const oTop = data.orderBlock.h4.top;
    const oBot = data.orderBlock.h4.bottom;
    const oDir = data.orderBlock.h4.direction;
    const fTop = data.fvg.h1.top;
    const fBot = data.fvg.h1.bottom;
    const fDir = data.fvg.h1.direction;
    
    if (oDir === fDir && ((fBot >= oBot * 0.998 && fBot <= oTop * 1.002) || (fTop >= oBot * 0.998 && fTop <= oTop * 1.002))) {
      let overlapTop = Math.min(oTop, fTop);
      let overlapBot = Math.max(oBot, fBot);
      if (overlapTop < overlapBot) {
         overlapTop = fTop;
         overlapBot = fBot;
      }
      zones.push({ name: "H4 OB + H1 FVG", price: `${overlapBot.toFixed(2)} - ${overlapTop.toFixed(2)}`, type: oDir, top: overlapTop, bottom: overlapBot });
      score += 30;
    }
  }

  if (data?.orderBlock?.h4 && data?.sbr_rbs?.h4) {
    const oTop = data.orderBlock.h4.top;
    const oBot = data.orderBlock.h4.bottom;
    const oDir = data.orderBlock.h4.direction;
    if (oDir === 'BEARISH' && data.sbr_rbs.h4.sbr) {
      const sPrice = Number(data.sbr_rbs.h4.sbr.price);
      if (sPrice >= oBot * 0.998 && sPrice <= oTop * 1.002) {
         const refinedTop = Math.min(oTop, sPrice + 2.5);
         const refinedBot = Math.max(oBot, sPrice - 2.5);
         zones.push({ name: "H4 OB + H4 SBR", price: `${refinedBot.toFixed(2)} - ${refinedTop.toFixed(2)}`, type: 'BEARISH', top: refinedTop, bottom: refinedBot });
         score += 25;
      }
    }
    if (oDir === 'BULLISH' && data.sbr_rbs.h4.rbs) {
      const rPrice = Number(data.sbr_rbs.h4.rbs.price);
      if (rPrice >= oBot * 0.998 && rPrice <= oTop * 1.002) {
         const refinedTop = Math.min(oTop, rPrice + 2.5);
         const refinedBot = Math.max(oBot, rPrice - 2.5);
         zones.push({ name: "H4 OB + H4 RBS", price: `${refinedBot.toFixed(2)} - ${refinedTop.toFixed(2)}`, type: 'BULLISH', top: refinedTop, bottom: refinedBot });
         score += 25;
      }
    }
  }

  // ZON KEBENARAN KECIL / MIKRO (Refined Precision Zone)
  if (data?.fvg?.h1) {
    const f1Top = data.fvg.h1.top;
    const f1Bot = data.fvg.h1.bottom;
    const f1Dir = data.fvg.h1.direction;
    const f1Mid = (f1Top + f1Bot) / 2;
    
    let addedMicro = false;
    if (data?.orderBlock?.h1 && data.orderBlock.h1.direction === f1Dir) {
      const o1Top = data.orderBlock.h1.top;
      const o1Bot = data.orderBlock.h1.bottom;
      const overlapBot = Math.max(f1Bot, o1Bot);
      const overlapTop = Math.min(f1Top, o1Top);
      if (overlapBot < overlapTop) {
        zones.push({
          name: "🎯 ZON KECIL PRESISI (H1 OB + FVG Pertindihan Tight)",
          price: `${overlapBot.toFixed(2)} - ${overlapTop.toFixed(2)}`,
          type: f1Dir,
          isMicro: true,
          top: overlapTop,
          bottom: overlapBot
        });
        score += 35;
        addedMicro = true;
      }
    }
    
    if (!addedMicro) {
      const microLow = f1Mid - 0.75;
      const microHigh = f1Mid + 0.75;
      zones.push({
        name: "⚡ ZON KECIL TAJAM (H1 FVG 50% Equilibrium CE)",
        price: `${microLow.toFixed(2)} - ${microHigh.toFixed(2)}`,
        type: f1Dir,
        isMicro: true,
        top: microHigh,
        bottom: microLow
      });
      score += 25;
    }
  }

  if (data?.bos?.structure?.includes('HH') && data?.bias?.direction === 'BULLISH') score += 15;
  if (data?.bos?.structure?.includes('LL') && data?.bias?.direction === 'BEARISH') score += 15;

  score = Math.min(100, score);

  return { score, zones };
};

const ConfluenceScore = ({ data }: { data: any }) => {
  const { score, zones } = calculateConfluenceZones(data);

  if (zones.length === 0) return null;

  return (
    <div className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] overflow-hidden shadow-lg shadow-black mb-3 lg:mb-4">
       <div className="border-b border-[#b49a45]/30 bg-[#111] px-3 py-2 flex justify-between items-center">
         <span className="text-[#4da6ff] font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2">
           🎯 ZON KEBENARAN (HIGH CONFLUENCE ZONES)
         </span>
         <span className={`text-black px-2 py-0.5 rounded text-xs font-bold ${score >= 80 ? 'bg-[#22c55e]' : 'bg-[#ffcc00]'}`}>
           SKOR: {score}%
         </span>
       </div>
       <div className="p-4">
         <p className="text-xs text-gray-300 mb-2 font-medium">Terdapat pertindihan (confluence) yang kuat antara timeframe berbeza:</p>
         <div className="space-y-2">
           {zones.map((z, i) => (
             <div key={i} className={`flex flex-col sm:flex-row sm:justify-between sm:items-center bg-black border p-2 rounded ${z.isMicro ? 'border-[#ffcc00]/60 bg-[#141208]' : 'border-gray-800'}`}>
               <div className="flex items-center gap-1.5">
                 <span className={`${z.isMicro ? 'text-[#ffcc00]' : 'text-gray-200'} font-bold text-xs sm:text-sm`}>{z.name}</span>
                 {z.isMicro && (
                   <span className="text-[10px] bg-[#ffcc00]/20 text-[#ffcc00] border border-[#ffcc00]/40 px-1 py-0.2 rounded font-semibold">
                     ZON KECIL
                   </span>
                 )}
               </div>
               <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                 <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${z.type === 'BEARISH' ? 'text-[#ef4444] border-red-900/50 bg-red-950/30' : 'text-[#22c55e] border-green-900/50 bg-green-950/30'}`}>
                   {z.price}
                 </span>
                 <QuickCopyBtn text={z.price} />
               </div>
             </div>
           ))}
         </div>
       </div>
    </div>
  )
}

const SessionWarning = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Use timezone for Malaysia
  const mytTime = toZonedTime(time, 'Asia/Kuala_Lumpur');
  const currentHour = mytTime.getHours();
  const currentMinute = mytTime.getMinutes();
  
  // London Open ~ 3:00 PM MYT (15:00)
  // NY Open ~ 8:00 PM MYT (20:00)
  let nextSession = "";
  let hoursLeft = 0;
  let minsLeft = 0;
  
  if (currentHour < 15) {
     nextSession = "London Open";
     const totalMins = (15 * 60) - (currentHour * 60 + currentMinute);
     hoursLeft = Math.floor(totalMins / 60);
     minsLeft = totalMins % 60;
  } else if (currentHour < 20) {
     nextSession = "New York Open";
     const totalMins = (20 * 60) - (currentHour * 60 + currentMinute);
     hoursLeft = Math.floor(totalMins / 60);
     minsLeft = totalMins % 60;
  } else {
     nextSession = "London Open (Esok)";
     const totalMins = (24 * 60 - (currentHour * 60 + currentMinute)) + (15 * 60);
     hoursLeft = Math.floor(totalMins / 60);
     minsLeft = totalMins % 60;
  }

  const isJudasZone = hoursLeft === 0 && minsLeft <= 60; // 1 hour before session

  return (
    <div className={`mb-3 lg:mb-4 border rounded-xl p-4 transition-colors duration-500 shadow-lg shadow-black ${isJudasZone ? 'bg-red-950/20 border-red-900/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-[#0a0a0a] border-[#b49a45]/30'}`}>
      <div className="flex items-center gap-2 mb-2">
         <AlertTriangle className={`w-4 h-4 ${isJudasZone ? 'text-red-500 animate-pulse' : 'text-[#ffcc00]'}`} />
         <span className={`font-bold text-xs sm:text-sm tracking-wide ${isJudasZone ? 'text-red-500' : 'text-[#ffcc00]'}`}>
           {isJudasZone ? 'AMARAN JUDAS SWING / SESI BERMULA!' : 'PEMANTAUAN SESI PASARAN'}
         </span>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
         <div className="text-gray-300 text-xs sm:text-sm">
           Sesi seterusnya: <strong className="text-white">{nextSession}</strong> dalam <span className="font-mono text-[#4da6ff] font-bold">{hoursLeft}j {minsLeft}m</span>
         </div>
         {isJudasZone ? (
           <div className="bg-red-500 text-white px-3 py-2 sm:px-2 sm:py-1 text-xs font-bold rounded animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
             ZON MANIPULASI TINGGI
           </div>
         ) : (
           <div className="bg-gray-800 text-gray-400 px-3 py-2 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-bold rounded border border-gray-700">
             Zon Selamat
           </div>
         )}
      </div>
      <p className="text-[10px] sm:text-xs text-gray-500 mt-2 leading-tight">
        Awas fakeout (Judas Swing) 1 jam sebelum & selepas pembukaan London/New York. Tunggu struktur BOS yang jelas sebelum entry.
      </p>
    </div>
  )
}

const JournalAnalytics = ({ journal }: { journal: any[] }) => {
  const completed = journal.filter(j => j.status === 'WIN' || j.status === 'LOSS');
  const wins = journal.filter(j => j.status === 'WIN').length;
  const losses = journal.filter(j => j.status === 'LOSS').length;
  const winRate = completed.length > 0 ? ((wins / completed.length) * 100).toFixed(1) : '0.0';
  
  const equityData: any[] = [{ trade: 0, balance: 100, date: "" }];
  let currentBalance = 100;
  // Journal entries are likely in reverse chronological order (newest first)
  // So we reverse it to get chronological order for the equity curve
  [...completed].reverse().forEach((j, i) => {
    if (j.status === 'WIN') currentBalance += 2; // Assuming 1:2 RR risking 1%
    else if (j.status === 'LOSS') currentBalance -= 1;
    equityData.push({ trade: i + 1, balance: currentBalance, date: j.date });
  });

  // Calculate Win Rate over time for Bullish vs Bearish
  const winRateOverTimeData: any[] = [];
  let bullishWins = 0;
  let bullishTotal = 0;
  let bearishWins = 0;
  let bearishTotal = 0;

  [...completed].reverse().forEach((j, i) => {
    if (j.bias === 'BULLISH') {
      bullishTotal++;
      if (j.status === 'WIN') bullishWins++;
    } else if (j.bias === 'BEARISH') {
      bearishTotal++;
      if (j.status === 'WIN') bearishWins++;
    }
    
    winRateOverTimeData.push({
      trade: i + 1,
      date: j.date,
      bullishWinRate: bullishTotal > 0 ? Number(((bullishWins / bullishTotal) * 100).toFixed(1)) : null,
      bearishWinRate: bearishTotal > 0 ? Number(((bearishWins / bearishTotal) * 100).toFixed(1)) : null,
    });
  });

  // Helper to extract day of week (1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri)
  const getDayIndex = (entry: any): number => {
    if (entry.date) {
      let dStr = String(entry.date).trim();
      const dLower = dStr.toLowerCase();
      
      if (dLower.includes('isnin') || dLower.includes('mon')) return 1;
      if (dLower.includes('selasa') || dLower.includes('tue')) return 2;
      if (dLower.includes('rabu') || dLower.includes('wed')) return 3;
      if (dLower.includes('khamis') || dLower.includes('thu')) return 4;
      if (dLower.includes('jumaat') || dLower.includes('fri')) return 5;

      // Convert Malay month names for Date constructor compatibility
      dStr = dStr
        .replace(/mac/i, 'Mar')
        .replace(/mei/i, 'May')
        .replace(/jul/i, 'Jul')
        .replace(/julai/i, 'Jul')
        .replace(/ogos|ogo/i, 'Aug')
        .replace(/okt|oktober/i, 'Oct')
        .replace(/dis|disember/i, 'Dec');

      const parsed = new Date(dStr);
      if (!isNaN(parsed.getTime())) {
        const day = parsed.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
        if (day >= 1 && day <= 5) return day;
        if (day === 0 || day === 6) return 5; // Default weekend trades to Friday
      }
    }

    if (entry.createdAt) {
      const parsed = new Date(entry.createdAt);
      if (!isNaN(parsed.getTime())) {
        const day = parsed.getDay();
        if (day >= 1 && day <= 5) return day;
      }
    }
    return 1; // Default to Monday
  };

  const daysMap = [
    { dayIdx: 1, name: 'Isnin', short: 'ISN' },
    { dayIdx: 2, name: 'Selasa', short: 'SEL' },
    { dayIdx: 3, name: 'Rabu', short: 'RAB' },
    { dayIdx: 4, name: 'Khamis', short: 'KHA' },
    { dayIdx: 5, name: 'Jumaat', short: 'JUM' },
  ];

  const dayStatsData = daysMap.map(day => {
    const dayEntries = completed.filter(j => getDayIndex(j) === day.dayIdx);
    const total = dayEntries.length;
    const dayWins = dayEntries.filter(j => j.status === 'WIN').length;
    const dayLosses = dayEntries.filter(j => j.status === 'LOSS').length;
    const dayWinRate = total > 0 ? Number(((dayWins / total) * 100).toFixed(1)) : 0;
    
    // Risk 1% per trade: Win = +2%, Loss = -1%
    const totalPnLPercent = (dayWins * 2) - (dayLosses * 1);
    const avgPnLPercent = total > 0 ? Number((totalPnLPercent / total).toFixed(2)) : 0;
    
    return {
      dayName: day.name,
      shortName: day.short,
      dayIdx: day.dayIdx,
      total,
      wins: dayWins,
      losses: dayLosses,
      winRate: dayWinRate,
      avgPnLPercent,
      avgPnLFormatted: avgPnLPercent > 0 ? `+${avgPnLPercent}%` : `${avgPnLPercent}%`
    };
  });

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4 flex flex-col items-center justify-center">
          <div className="text-gray-400 text-xs sm:text-sm mb-1 font-bold">Kadar Kemenangan (Win Rate)</div>
          <div className="text-2xl sm:text-3xl font-black text-white">{winRate}%</div>
          <div className="text-xs text-gray-500 mt-1">{wins} Win / {losses} Loss</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4 flex flex-col items-center justify-center">
          <div className="text-gray-400 text-xs sm:text-sm mb-1 font-bold">Nisbah R:R Purata</div>
          <div className="text-2xl sm:text-3xl font-black text-[#4da6ff]">1:2</div>
          <div className="text-xs text-gray-500 mt-1">Anggaran (Risiko 1%, Untung 2%)</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4 flex flex-col items-center justify-center">
          <div className="text-gray-400 text-xs sm:text-sm mb-1 font-bold">Jumlah Dagangan</div>
          <div className="text-2xl sm:text-3xl font-black text-[#ffcc00]">{completed.length}</div>
          <div className="text-xs text-gray-500 mt-1">Selesai (Menang/Kalah)</div>
        </div>
      </div>
      
      {completed.length > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4">
              <div className="text-white font-bold text-sm mb-4">Graf Pertumbuhan Akaun (Simulasi)</div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={equityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="trade" stroke="#666" tick={{fill: '#888', fontSize: 10}} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke="#666" tick={{fill: '#888', fontSize: 10}} tickLine={false} axisLine={false} width={40} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#4da6ff' }}
                      formatter={(value) => [`${value}%`, 'Balance']}
                      labelFormatter={(label) => `Dagangan #${label}`}
                    />
                    <Line type="stepAfter" dataKey="balance" stroke="#4da6ff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ffcc00' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4">
              <div className="text-white font-bold text-sm mb-4">Kadar Kemenangan Bias (%)</div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={winRateOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="trade" stroke="#666" tick={{fill: '#888', fontSize: 10}} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#666" tick={{fill: '#888', fontSize: 10}} tickLine={false} axisLine={false} width={30} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', fontSize: '12px' }}
                      labelFormatter={(label) => `Dagangan #${label}`}
                      formatter={(value, name) => [`${value}%`, name === 'bullishWinRate' ? 'Bullish Win Rate' : 'Bearish Win Rate']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" name="Bullish" dataKey="bullishWinRate" stroke="#22c55e" strokeWidth={2} dot={false} connectNulls />
                    <Line type="monotone" name="Bearish" dataKey="bearishWinRate" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Panel Prestasi Hari Dalam Seminggu */}
          <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="text-[#ffcc00] font-bold text-sm sm:text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#ffcc00]" />
                  Prestasi Mengikut Hari (Isnin - Jumaat)
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  Peratus kemenangan (Win Rate) & purata untung/rugi per trade bagi setiap hari dalam seminggu.
                </div>
              </div>
            </div>

            {/* Grid 5 Hari */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-5">
              {dayStatsData.map((d) => (
                <div key={d.dayIdx} className="bg-black border border-gray-800 hover:border-[#b49a45]/60 transition-colors rounded-lg p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-extrabold text-xs text-white tracking-wider">{d.dayName.toUpperCase()}</span>
                    <span className="text-[10px] bg-gray-900 border border-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                      {d.total} trade
                    </span>
                  </div>

                  {/* Win Rate */}
                  <div className="my-1">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-gray-400 font-medium">Win Rate:</span>
                      <span className={`font-bold ${d.total === 0 ? 'text-gray-500' : d.winRate >= 50 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {d.total === 0 ? '0%' : `${d.winRate}%`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden border border-gray-800">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          d.total === 0 ? 'bg-gray-800' : d.winRate >= 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-600 to-rose-400'
                        }`}
                        style={{ width: `${d.winRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Purata PnL */}
                  <div className="mt-2 pt-2 border-t border-gray-900 flex justify-between items-center text-[11px]">
                    <span className="text-gray-400">Purata PnL:</span>
                    <span className={`font-black font-mono ${
                      d.total === 0 ? 'text-gray-500' : d.avgPnLPercent > 0 ? 'text-[#22c55e]' : d.avgPnLPercent < 0 ? 'text-[#ef4444]' : 'text-gray-300'
                    }`}>
                      {d.total === 0 ? '0.0%' : d.avgPnLFormatted}
                    </span>
                  </div>

                  <div className="text-[9px] text-gray-500 mt-1 text-right">
                    {d.wins} W / {d.losses} L
                  </div>
                </div>
              ))}
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-44 w-full pt-2 border-t border-gray-900">
              <div className="text-xs text-gray-400 mb-2 font-medium">Carta Nisbah Kemenangan (%) Bagi Setiap Hari:</div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayStatsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="dayName" stroke="#666" tick={{ fill: '#aaa', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#666" tick={{ fill: '#777', fontSize: 10 }} unit="%" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#b49a45', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any, name: any) => {
                      if (name === 'winRate') return [`${value}%`, 'Kadar Kemenangan'];
                      if (name === 'avgPnLPercent') return [`${value}%`, 'Purata PnL'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Hari ${label}`}
                  />
                  <Bar dataKey="winRate" radius={[4, 4, 0, 0]} maxBarSize={45}>
                    {dayStatsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.total === 0 ? '#262626' : entry.winRate >= 50 ? '#22c55e' : '#ef4444'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
};


const renderFormattedSummary = (text: string) => {
  return text.split('\n').map((line, i) => {
    let content = line;
    const isBullet = line.trim().startsWith('-') || line.trim().startsWith('*');
    if (isBullet) {
      content = line.replace(/^[\s-*•]+/, '');
    }

    // Parse **bold** parts
    const parts = content.split(/(\*\*.*?\*\*)/g);
    const renderedParts = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-[#ffcc00] font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isBullet) {
      return (
        <div key={i} className="flex gap-2 items-start ml-2 my-1 sm:my-1.5 leading-relaxed">
          <span className="text-[#ffcc00] shrink-0 mt-1">•</span>
          <span className="flex-1 text-gray-200">{renderedParts}</span>
        </div>
      );
    }

    return (
      <div key={i} className="min-h-[1.2em] my-1 text-gray-200 leading-relaxed">
        {renderedParts}
      </div>
    );
  });
};

const QuickCopyBtn = ({ text, label }: { text: string | number, label?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className="inline-flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded text-[10px] ml-1 transition-colors border border-gray-700"
      title="Salin ke MT5"
    >
      {copied ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
      {label && <span>{copied ? 'Disalin' : label}</span>}
    </button>
  );
};

const RiskCalculator = ({ entryPrice, slPrice }: { entryPrice: string | number, slPrice: string | number }) => {
  const [balance, setBalance] = useState(100);
  const [riskPercent, setRiskPercent] = useState(1);

  // XAUUSD pip is typically 1 pip = 0.1, or 10 pips = $1 movement.
  // Standard gold pip calculation: distance * 10
  const entry = Number(entryPrice);
  const sl = Number(slPrice);
  const pips = Math.abs(entry - sl) * 10;
  
  const riskAmount = (balance * riskPercent) / 100;
  // Lot size = Risk Amount / (Pips * 10) (Standard for Gold where 1 lot = $10 per pip)
  const lotSize = pips > 0 ? (riskAmount / (pips * 10)).toFixed(2) : "0.00";

  return (
    <div className="bg-[#111] p-3 rounded mt-3 border border-gray-800">
      <div className="flex items-center gap-2 mb-2 text-[#4da6ff] font-bold text-xs sm:text-sm">
        <DollarSign className="w-4 h-4" />
        Kalkulator Saiz Lot (XAUUSD)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] text-gray-400 block mb-1">Baki Akaun ($)</label>
          <input 
            type="number" 
            value={balance} 
            onChange={(e) => setBalance(Number(e.target.value))}
            className="w-full bg-black border border-gray-700 rounded px-3 py-2 sm:px-2 sm:py-1 text-white text-xs focus:outline-none focus:border-[#4da6ff]"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-1">Risiko (%)</label>
          <input 
            type="number" 
            value={riskPercent} 
            onChange={(e) => setRiskPercent(Number(e.target.value))}
            className="w-full bg-black border border-gray-700 rounded px-3 py-2 sm:px-2 sm:py-1 text-white text-xs focus:outline-none focus:border-[#4da6ff]"
          />
        </div>
      </div>
      <div className="flex justify-between items-center bg-black p-2 rounded border border-gray-800">
        <div>
          <div className="text-[10px] text-gray-400">Jarak SL</div>
          <div className="text-white text-xs font-mono">{pips.toFixed(1)} Pips</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400">Saiz Lot (Anggaran)</div>
          <div className="text-[#ffcc00] text-sm font-bold font-mono">{lotSize} Lot</div>
        </div>
      </div>
    </div>
  );
};

const HighImpactNewsBanner = ({ news, targetDate }: { news: any[], targetDate: Date }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const mytTime = toZonedTime(time, 'Asia/Kuala_Lumpur');
  const currentHour = mytTime.getHours();
  const currentMinute = mytTime.getMinutes();
  
  const highImpactNews = news?.filter((n: any) => n.impact === "HIGH") || [];
  if (highImpactNews.length === 0) return null;

  let upcomingNews = null;
  let minMinutesLeft = Infinity;

  const isToday = targetDate.toDateString() === new Date().toDateString();
  if (!isToday) return null;

  for (const n of highImpactNews) {
    if (!n.time || n.time === "-") continue;
    const match = n.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) continue;
    
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const p = match[3].toUpperCase();
    if (p === "PM" && h !== 12) h += 12;
    if (p === "AM" && h === 12) h = 0;
    
    const newsTotalMinutes = h * 60 + m;
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    let minutesLeft = newsTotalMinutes - currentTotalMinutes;
    if (minutesLeft < 0) {
      if (h < 6 && currentHour > 18) {
         minutesLeft += 24 * 60; 
      }
    }
    
    if (minutesLeft >= 0 && minutesLeft < minMinutesLeft) {
      minMinutesLeft = minutesLeft;
      upcomingNews = n;
    }
  }

  if (!upcomingNews || minMinutesLeft === Infinity) return null;

  const hoursLeft = Math.floor(minMinutesLeft / 60);
  const minsLeft = minMinutesLeft % 60;

  return (
    <div className="w-full mb-6 overflow-hidden rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/80 via-red-900/50 to-red-950/80 shadow-[0_0_30px_rgba(239,68,68,0.2)] relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse"></div>
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-red-500/20 p-2.5 sm:p-3 rounded-full border border-red-500/50 animate-pulse">
             <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
          </div>
          <div>
            <div className="text-red-400 font-bold text-[10px] sm:text-xs tracking-widest mb-0.5">AMARAN NEWS BERIMPAK TINGGI</div>
            <div className="text-lg sm:text-2xl font-black text-white">{upcomingNews.event}</div>
          </div>
        </div>
        
        <div className="flex flex-col items-center sm:items-end bg-black/60 p-2 sm:p-3 rounded-lg border border-red-900/50 min-w-[160px] sm:min-w-[200px]">
          <div className="text-gray-400 text-[10px] sm:text-xs font-bold mb-0.5">MASA TINGGAL</div>
          <div className="flex items-baseline gap-1.5">
            <div className="text-2xl sm:text-4xl font-black text-[#ffcc00]">{hoursLeft}</div>
            <div className="text-[10px] sm:text-xs text-gray-300 font-bold">JAM</div>
            <div className="text-2xl sm:text-4xl font-black text-[#ffcc00] ml-1">{minsLeft}</div>
            <div className="text-[10px] sm:text-xs text-gray-300 font-bold">MIN</div>
          </div>
          <div className="text-red-400 text-[9px] sm:text-[10px] font-bold mt-1 tracking-wider uppercase">
            EXPECTED: {upcomingNews.time} MYT
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
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

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [marketOpen, setMarketOpen] = useState<boolean>(getMarketStatus());
  
  // Update market status every minute
  useEffect(() => {
    const interval = setInterval(() => setMarketOpen(getMarketStatus()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Format for HTML date input: YYYY-MM-DD
  const [dateInput, setDateInput] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getTime() + 8 * 3600 * 1000).toISOString().split('T')[0];
  });

  const [showJournal, setShowJournal] = useState(false);
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
      const res = await fetch(`/api/news-history/${id}`, {
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
      await fetch(`/api/news-history/${id}`, { method: 'DELETE' });
      setNewsHistoryList(newsHistoryList.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
      alert('Gagal memadam news.');
    }
  };

  const handleAutoSyncNews = async () => {
    const res = await fetch('/api/auto-sync-news', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Gagal sinkronkan news.');
    }
    const synced = await res.json();
    if (Array.isArray(synced)) {
      setNewsHistoryList(prev => {
        // merge unique items
        const existingIds = new Set(prev.map(p => p.id));
        const newItems = synced.filter((s: any) => !existingIds.has(s.id));
        return [...newItems, ...prev];
      });
    }
  };
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed / standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installed app: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };
  const [journal, setJournal] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/journal')
      .then(res => res.json())
      .then(data => setJournal(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const [notifiedZones, setNotifiedZones] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!data || !data.currentPrice) return;
    
    const p = data.currentPrice;
    const checkZone = async (top: number, bottom: number, name: string) => {
      const margin = 2; // threshold
      if (p >= bottom - margin && p <= top + margin) {
         if (!notifiedZones.has(name)) {
            const messageStr = `Harga semasa (${p.toFixed(2)}) hampir masuk ke zon ${name} (${bottom.toFixed(2)} - ${top.toFixed(2)})`;
            
            // Browser Notification
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Amaran Harga XAUUSD`, {
                 body: messageStr,
              });
            }

            // Telegram Notification
            try {
              await fetch('/api/telegram-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `🚨 <b>Amaran Harga XAUUSD</b>\n\n${messageStr}` })
              });
            } catch (err) {
              console.error("Failed to send telegram alert", err);
            }

            setNotifiedZones(prev => new Set(prev).add(name));
         }
      }
    }
    
    if (data.fvg?.h1) checkZone(data.fvg.h1.top, data.fvg.h1.bottom, "FVG H1");
    if (data.fvg?.h4) checkZone(data.fvg.h4.top, data.fvg.h4.bottom, "FVG H4");
    if (data.orderBlock?.h1) checkZone(data.orderBlock.h1.top, data.orderBlock.h1.bottom, "OB H1");
    if (data.orderBlock?.h4) checkZone(data.orderBlock.h4.top, data.orderBlock.h4.bottom, "OB H4");
  }, [data?.currentPrice]);
  
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

  const saveToJournal = async (plan: string) => {
    if (!data) return;
    
    // Prevent duplicate entries for the same date and plan
    if (journal.find(j => j.date === data.date && j.plan === plan)) {
      setShowJournal(true);
      return;
    }

    const newEntry = {
      date: data.date,
      bias: data.bias.direction,
      bos: data.bos.structure,
      fvg: `${data.fvg.direction} FVG`,
      plan: plan,
      status: 'PENDING'
    };

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      const savedEntry = await res.json();
      setJournal([savedEntry, ...journal]);
      setShowJournal(true);
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan jurnal ke awan.');
    }
  };
  
  const handleDownloadImage = async () => {
    const element = document.getElementById('export-container');
    if (!element) return;
    
    try {
      const dataUrl = await htmlToImage.toPng(element, { 
        backgroundColor: '#000000',
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.download = `XAUUSD-Analysis-${data.date.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('Gagal memuat turun gambar. Sila cuba lagi. ' + err);
    }
  };

  const updateJournalStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/journal/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setJournal(journal.map(j => j.id === id ? { ...j, status } : j));
    } catch (e) {
      console.error(e);
      alert('Gagal mengemas kini jurnal.');
    }
  };

  const deleteJournalEntry = async (id: number) => {
    try {
      await fetch(`/api/journal/${id}`, { method: 'DELETE' });
      setJournal(journal.filter(j => j.id !== id));
    } catch (e) {
      console.error(e);
      alert('Gagal memadam jurnal.');
    }
  };

  useEffect(() => {
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
      }, 600000); // 10 minutes
    }
    return () => { if (interval) clearInterval(interval); };
  }, [targetDate]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!data && !error) setError("Timeout fetching data for " + targetDate.toDateString());
    }, 35000);
    return () => clearTimeout(t);
  }, [data, error]);

  if (error && !data) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 break-all">{error}</div>;

  if (!data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Live Data...</div>;
  

  return (
    <>
      <div className="min-h-screen bg-[#020202] text-white font-sans antialiased p-1 sm:p-2 md:p-4 flex flex-col items-center">
      <div className={`w-full max-w-[1300px] flex justify-end flex-wrap gap-2 mb-2 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {showInstallBtn && (
          <button onClick={handleInstallClick} className="flex items-center gap-1.5 bg-[#22c55e] text-black px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-md font-bold text-xs sm:text-sm hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20">
            <Smartphone className="w-4 h-4 text-black" />
            PASANG APLIKASI
          </button>
        )}
        <button onClick={handleDownloadImage} className="flex items-center gap-2 bg-[#ffcc00] text-black px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-md font-bold text-xs sm:text-sm hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20">
          <Download className="w-4 h-4" />
          DOWNLOAD GAMBAR
        </button>
      </div>
      <div id="export-container" className={`w-full max-w-[1300px] border-t-4 border-[#b49a45] bg-[#050505] p-4 sm:p-5 md:p-6 rounded-xl shadow-[0_0_50px_rgba(180,154,69,0.05)] transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Header */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center pb-5 border-b border-[#b49a45]/20 mb-5 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-5xl sm:text-6xl drop-shadow-[0_0_15px_rgba(255,204,0,0.3)]">🪙</div>
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#ffcc00] tracking-wide leading-none drop-shadow-md" >
                XAUUSD ANALYSIS
              </h1>
              <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
                <div className="flex items-center gap-1.5 bg-[#111] px-2.5 py-1 rounded border border-gray-800 text-gray-300">
                  <Calendar className="w-4 h-4 text-[#ffcc00]" />
                  <span className="tracking-wider">{data.date} {data.time && `| ${data.time} MYT`}</span>
                </div>
                
                <span className="px-3 py-2 sm:px-2 sm:py-1 bg-[#1e3a8a]/20 text-[#4da6ff] rounded font-bold border border-[#1e3a8a]/50 tracking-wide">
                  D1 OPEN: 6:00 AM MYT
                </span>
                
                <span className={`px-3 py-2 sm:px-2 sm:py-1 text-white rounded font-bold border tracking-wide ${marketOpen ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                  {marketOpen ? 'PASARAN BUKA' : 'PASARAN TUTUP'}
                </span>
                
                <input 
                  type="date" 
                  value={dateInput}
                  onChange={(e) => {
                    setDateInput(e.target.value);
                    if (e.target.value) {
                      setTargetDate(new Date(e.target.value + 'T23:59:59+08:00'));
                    }
                  }}
                  className="bg-[#111] border border-gray-700 text-gray-300 text-xs px-3 py-2 sm:px-2 sm:py-1 rounded outline-none focus:border-[#b49a45]"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <button onClick={() => setShowJournal(true)} className="flex-1 xl:flex-none flex items-center justify-center gap-1.5 bg-[#111] text-[#ffcc00] border border-[#b49a45]/50 px-4 py-2 rounded-lg font-bold text-xs hover:bg-[#b49a45]/20 transition-all">
              <BookOpen className="w-4 h-4" />
              JURNAL
            </button>

            <button onClick={() => setShowNewsModal(true)} className="flex-1 xl:flex-none flex items-center justify-center gap-1.5 bg-red-600/20 text-red-400 border border-red-600/50 px-4 py-2 rounded-lg font-black text-xs hover:bg-red-600/30 transition-all shadow-[0_0_15px_rgba(220,38,38,0.15)]">
              <Flame className="w-4 h-4 text-[#ffcc00]" />
              NEWS IMPAK TINGGI
            </button>
            
            <div className="hidden sm:flex text-xl sm:text-2xl font-display font-medium text-[#ffcc00]/80 tracking-wide italic ml-auto xl:ml-4" >
              BY {data.author}
            </div>
          </div>
        </header>

        <HighImpactNewsBanner news={data.news} targetDate={targetDate} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          
          {/* LEFT COLUMN (Charts & Fundamentals) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 lg:gap-4">
            
            {/* Charts Column */}
            <div className="flex flex-col gap-3">
              <LightweightChart 
                title="M5 CHART (5 MINUTE)" 
                subtitle="SBR/RBS, Liq, OB, FVG, Zones"
                data={data.charts.m5.rawCandles}
                heightClass="h-[300px] sm:h-[400px]"
                markers={{
                  sbr: data.sbr_rbs?.h1?.sbr?.price || data.sbr_rbs?.h4?.sbr?.price,
                  rbs: data.sbr_rbs?.h1?.rbs?.price || data.sbr_rbs?.h4?.rbs?.price,
                  buySideLiq: data.liquidity?.buySide?.map((l: any) => l.price),
                  sellSideLiq: data.liquidity?.sellSide?.map((l: any) => l.price),
                  ob: data.orderBlock?.h1 || data.orderBlock?.h4,
                  fvg: data.fvg?.h1 || data.fvg?.h4,
                  zones: calculateConfluenceZones(data).zones
                }}
              />
            </div>

            {/* Fundamentals & Impact Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              
              {/* Fundamentals */}
              <div className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col">
                <div className="bg-[#1e3a8a] px-4 py-2 flex items-center justify-between border-b border-[#b49a45]/30">
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
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] sm:text-xs text-left text-gray-200">
                    <thead className="text-gray-400 border-b border-gray-700 bg-black/50">
                      <tr>
                        <th className="px-3 py-2 sm:px-2 sm:py-1.5 font-normal text-center w-20">TIME</th>
                        <th className="px-3 py-2 sm:px-2 sm:py-1.5 font-normal">NEWS</th>
                        <th className="px-1 py-1.5 font-normal text-center w-12 hidden sm:table-cell">FCST</th>
                        <th className="px-1 py-1.5 font-normal text-center w-12 hidden sm:table-cell">PREV</th>
                        <th className="px-3 py-2 sm:px-2 sm:py-1.5 font-normal text-center w-16">IMPACT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {(() => {
                        const medHighNews = data.news?.filter((item: any) => item.impact === 'HIGH' || item.impact === 'MED') || [];
                        if (medHighNews.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="px-3 py-3 text-center text-gray-400 italic">
                                Tiada news MED / HIGH impak USD hari ini
                              </td>
                            </tr>
                          );
                        }
                        return medHighNews.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="px-3 py-2 sm:px-2 sm:py-1.5 text-center">{item.time}</td>
                            <td className="px-3 py-2 sm:px-2 sm:py-1.5">{item.event}</td>
                            <td className="px-1 py-1.5 text-center text-gray-400 hidden sm:table-cell">{item.forecast}</td>
                            <td className="px-1 py-1.5 text-center text-gray-400 hidden sm:table-cell">{item.previous}</td>
                            <td className={`px-3 py-2 sm:px-2 sm:py-1.5 font-bold text-center ${item.impact === 'HIGH' ? 'text-[#ef4444]' : 'text-[#eab308]'}`}>{item.impact}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-[#b49a45] flex flex-col gap-2 bg-[#111] mt-auto">
                  <div className="text-xs text-[#ffcc00] font-bold border-b border-gray-700 pb-1 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> 
                    AI PREDICTION
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-gray-300 space-y-1.5 leading-relaxed">
                    <p><span className="font-bold text-white">Suggest:</span> MENUNGGU DATA</p>
                    <p><span className="font-bold text-white">Huraian:</span> Sentimen pasaran akan dinilai berdasarkan perbezaan antara data jangkaan (forecast) dan data sebenar (actual).</p>
                    <p><span className="font-bold text-white">Kebarangkalian:</span> <span className="text-gray-500">N/A</span></p>
                  </div>
                  <div className="flex gap-2 items-start mt-1 p-2 bg-blue-900/20 border border-blue-900/50 rounded">
                    <AlertTriangle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-[9px] sm:text-[10px] text-blue-300 italic">
                      *Robot akan cari data 1 JAM sebelum news..
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Analysis Panels) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 lg:gap-4">
            
            <SessionWarning />
            
            {/* AI SUMMARY */}
            <div className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <div className="border-b border-[#b49a45]/30 bg-[#111] px-4 py-2 flex justify-between items-center">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2">
                  <span className="text-lg">🤖</span> GEMINI AI RUMUSAN PASARAN
                </span>
              </div>
              <div className="p-4">
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
                  <div className="text-sm">
                    {renderFormattedSummary(aiSummary)}
                  </div>
                )}
              </div>
            </div>

            {/* BIAS UTAMA */}
            <div className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <div className="border-b border-[#b49a45]/30 bg-[#111] px-4 py-2">
                <span className="text-white font-bold text-xs sm:text-sm tracking-wide">BIAS UTAMA</span>
              </div>
              <div className="p-4">
                <div className={`text-5xl sm:text-6xl font-display font-bold mb-3 tracking-wide ${data.bias.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`} >
                  {data.bias.direction}
                </div>
                <ul className="text-xs sm:text-sm text-gray-200 space-y-2 list-disc pl-4 ml-1">
                  {data.bias.reasons.map((reason, i) => (
                    <li key={i}>{reason.split('\n').map((line, j) => <div key={j}>{line}</div>)}</li>
                  ))}
                </ul>
              </div>
            </div>

            
            {/* SBR & RBS */}
            <div className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <div className="border-b border-[#b49a45]/30 bg-[#111] px-4 py-2">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">SBR & RBS (Support/Resistance)</span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="font-bold text-[#ef4444] text-xs sm:text-sm mb-2">H4 SBR/RBS</div>
                    {data.sbr_rbs?.h4?.sbr && (
                      <div className="text-gray-300 text-xs sm:text-sm mb-1">
                        SBR: <span className="font-bold text-white">{data.sbr_rbs.h4.sbr.price}</span> <span className="text-green-400 font-bold ml-1">({data.sbr_rbs.h4.sbr.winRate}%)</span>
                      </div>
                    )}
                    {data.sbr_rbs?.h4?.rbs && (
                      <div className="text-gray-300 text-xs sm:text-sm">
                        RBS: <span className="font-bold text-white">{data.sbr_rbs.h4.rbs.price}</span> <span className="text-green-400 font-bold ml-1">({data.sbr_rbs.h4.rbs.winRate}%)</span>
                      </div>
                    )}
                    {!data.sbr_rbs?.h4?.sbr && !data.sbr_rbs?.h4?.rbs && (
                      <div className="text-gray-500 text-xs italic">Tiada di H4</div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-[#22c55e] text-xs sm:text-sm mb-2">H1 SBR/RBS</div>
                    {data.sbr_rbs?.h1?.sbr && (
                      <div className="text-gray-300 text-xs sm:text-sm mb-1">
                        SBR: <span className="font-bold text-white">{data.sbr_rbs.h1.sbr.price}</span> <span className="text-green-400 font-bold ml-1">({data.sbr_rbs.h1.sbr.winRate}%)</span>
                      </div>
                    )}
                    {data.sbr_rbs?.h1?.rbs && (
                      <div className="text-gray-300 text-xs sm:text-sm">
                        RBS: <span className="font-bold text-white">{data.sbr_rbs.h1.rbs.price}</span> <span className="text-green-400 font-bold ml-1">({data.sbr_rbs.h1.rbs.winRate}%)</span>
                      </div>
                    )}
                    {!data.sbr_rbs?.h1?.sbr && !data.sbr_rbs?.h1?.rbs && (
                      <div className="text-gray-500 text-xs italic">Tiada di H1</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <ConfluenceScore data={data} />

            {/* LIQUIDITY */}
            <div className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <div className="border-b border-[#b49a45]/30 bg-[#111] px-4 py-2">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">LIQUIDITY</span>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-[#22c55e] font-bold text-xs sm:text-sm mb-2 tracking-wide">BUY-SIDE LIQUIDITY</div>
                  {data.liquidity.buySide.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs sm:text-sm text-gray-200 py-0.5">
                      <span>{item.price} {item.label} <span className="text-green-400 font-bold ml-1">({item.winRate}%)</span></span>
                      <ArrowUp className="w-4 h-4 text-[#22c55e]" strokeWidth={3} />
                    </div>
                  ))}
                </div>
                
                <div>
                  <div className="text-[#ef4444] font-bold text-xs sm:text-sm mb-2 tracking-wide">SELL-SIDE LIQUIDITY</div>
                  {data.liquidity.sellSide.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs sm:text-sm text-gray-200 py-0.5">
                      <span>{item.price} {item.label} <span className="text-green-400 font-bold ml-1">({item.winRate}%)</span></span>
                      <ArrowDown className="w-4 h-4 text-[#ef4444]" strokeWidth={3} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            
            {/* ORDER BLOCK */}
            <div className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <div className="border-b border-[#b49a45]/30 bg-[#111] px-4 py-2">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">ORDER BLOCK (OB)</span>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-3">
                  {data.orderBlock && data.orderBlock.h4 && (
                    <div>
                      <div className={`font-bold text-xs sm:text-sm mb-1 tracking-wide ${data.orderBlock.h4.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {data.orderBlock.h4.direction} OB (H4)
                      </div>
                      <div className="bg-[#4c1d95] text-white px-3 py-2 sm:px-2 sm:py-1 text-xs sm:text-sm font-bold inline-block rounded-sm shadow-lg shadow-purple-900/20">
                        {data.orderBlock.h4.range} <span className="text-green-400 font-bold ml-1">({data.orderBlock.h4.winRate}%)</span>
                      </div>
                    </div>
                  )}
                  {data.orderBlock && data.orderBlock.h1 && (
                    <div>
                      <div className={`font-bold text-xs sm:text-sm mb-1 tracking-wide ${data.orderBlock.h1.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {data.orderBlock.h1.direction} OB (H1)
                      </div>
                      <div className="bg-[#4c1d95] text-white px-3 py-2 sm:px-2 sm:py-1 text-xs sm:text-sm font-bold inline-block rounded-sm shadow-lg shadow-purple-900/20">
                        {data.orderBlock.h1.range} <span className="text-green-400 font-bold ml-1">({data.orderBlock.h1.winRate}%)</span>
                      </div>
                    </div>
                  )}
                  {(!data.orderBlock || (!data.orderBlock.h4 && !data.orderBlock.h1)) && (
                    <div className="text-gray-400 text-xs sm:text-sm italic">
                      Tiada Order Block yang jelas ditemui pada H4/H1.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FVG */}
            <div className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <div className="border-b border-[#b49a45]/30 bg-[#111] px-4 py-2">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">FVG (FAIR VALUE GAP)</span>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-3 mb-3">
                  {data.fvg.h4 && (
                    <div>
                      <div className={`font-bold text-xs sm:text-sm mb-1 tracking-wide ${data.fvg.h4.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {data.fvg.h4.direction} FVG (H4)
                      </div>
                      <div className="bg-[#1e3a8a] text-white px-3 py-2 sm:px-2 sm:py-1 text-xs sm:text-sm font-bold inline-block rounded-sm shadow-lg shadow-blue-900/20">
                        {data.fvg.h4.range} <span className="text-green-400 font-bold ml-1">({data.fvg.h4.winRate}%)</span>
                      </div>
                    </div>
                  )}
                  {data.fvg.h1 && (
                    <div>
                      <div className={`font-bold text-xs sm:text-sm mb-1 tracking-wide ${data.fvg.h1.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {data.fvg.h1.direction} FVG (H1)
                      </div>
                      <div className="bg-[#1e3a8a] text-white px-3 py-2 sm:px-2 sm:py-1 text-xs sm:text-sm font-bold inline-block rounded-sm shadow-lg shadow-blue-900/20">
                        {data.fvg.h1.range} <span className="text-green-400 font-bold ml-1">({data.fvg.h1.winRate}%)</span>
                      </div>
                    </div>
                  )}
                  {!data.fvg.h4 && !data.fvg.h1 && (
                     <div>
                      <div className={`font-bold text-xs sm:text-sm mb-1 tracking-wide ${data.fvg.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {data.fvg.direction} FVG ({data.fvg.timeframe})
                      </div>
                      <div className="bg-[#1e3a8a] text-white px-3 py-2 sm:px-2 sm:py-1 text-xs sm:text-sm font-bold inline-block rounded-sm shadow-lg shadow-blue-900/20">
                        {data.fvg.range}
                      </div>
                    </div>
                  )}
                </div>
                <ul className="text-xs text-gray-200 space-y-1.5 mb-2">
                  {data.fvg.notes.map((note, i) => (
                    <li key={i} className="flex gap-2 items-start leading-tight">
                      <Search className="w-4 h-4 text-[#4da6ff] shrink-0 mt-0.5"/> 
                      {note}
                    </li>
                  ))}
                </ul>
                <FvgIllustration />
              </div>
            </div>

            {/* BOS */}
            <div className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <div className="border-b border-[#b49a45]/30 bg-[#111] px-4 py-2">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">BOS (BREAK OF STRUCTURE)</span>
              </div>
              <div className="p-4 text-xs sm:text-sm text-gray-200 space-y-2">
                <p className="text-[#ffcc00]">{data.bos.status}</p>
                <p>Structure masih:</p>
                <p className="text-[#ef4444] font-bold text-base tracking-widest bg-red-950/30 p-2 rounded text-center border border-red-900/50">
                  {data.bos.structure}
                </p>
                <div className="border-t border-gray-700 pt-3 mt-3">
                  <p className="mb-2 text-gray-400">Tukar bias jika:</p>
                  {data.bos.changeBiasConditions.map((cond, i) => (
                    <div key={i} className={`flex items-center gap-2 text-gray-300 bg-[#111] p-1.5 rounded ${i===0 ? 'mb-1' : ''} border border-gray-800`}>
                      <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                      <span>{cond}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TRADING PLAN */}
            <div className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] shadow-[0_0_15px_rgba(0,0,0,0.5)] flex-1">
              <div className="border-b border-[#b49a45]/30 bg-[#111] px-4 py-2 flex items-center justify-between">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">TRADING PLAN</span>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 opacity-60">
                    <span className="text-white text-xs tracking-wider">@eskey969</span>
                  </div>
                </div>

              </div>
              <div className="p-4 text-xs sm:text-sm space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[#22c55e] font-bold tracking-wide text-sm">
                      <Check className="w-4 h-4" strokeWidth={3} /> {data.tradingPlan.planA.title}
                    </div>
                    <button onClick={() => saveToJournal('PLAN A')} className="flex items-center gap-1 bg-[#1e3a8a] text-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold hover:bg-blue-800 transition-colors">
                      <Save className="w-3 h-3" />
                      SIMPAN PLAN A
                    </button>
                  </div>
                  <ul className="text-gray-200 space-y-1.5 list-disc pl-4 ml-2">
                    {data.tradingPlan.planA.steps.map((step, i) => {
                      if (step.startsWith("  -")) {
                        return (
                           <ul key={i} className="list-disc pl-4 text-gray-400 mt-1 space-y-1">
                             <li>{step.replace("  - ", "")}</li>
                           </ul>
                        )
                      }
                      return <li key={i}>{step}</li>
                    })}
                    <li className="flex items-center gap-2 pt-1 flex-wrap">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="flex items-center">
                        Entry <span className="text-[#ef4444] font-bold border border-red-500/30 px-1.5 py-0.5 rounded mx-1 bg-red-500/10">{data.tradingPlan.planA.entry}</span>
                        {data.tradingPlan.planA.entryPrice && (
                          <span className="font-mono text-gray-300 ml-1">
                            @ {data.tradingPlan.planA.entryPrice}
                            <QuickCopyBtn text={data.tradingPlan.planA.entryPrice} />
                          </span>
                        )}
                      </span>
                    </li>
                    <li className="flex items-center flex-wrap">
                      SL: <span className="font-mono text-gray-300 ml-1 mr-1">{data.tradingPlan.planA.sl}</span>
                      <QuickCopyBtn text={data.tradingPlan.planA.sl} />
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row justify-between text-gray-300 mt-3 ml-0 sm:ml-6 font-mono text-xs bg-[#111] p-2 rounded border border-gray-800 gap-2 sm:gap-0">
                    <div className="flex items-center justify-between sm:justify-start">
                      <span>TP1: {data.tradingPlan.planA.tp1}</span>
                      <QuickCopyBtn text={data.tradingPlan.planA.tp1} />
                    </div>
                    <div className="flex items-center justify-between sm:justify-start">
                      <span>TP2: {data.tradingPlan.planA.tp2}</span>
                      <QuickCopyBtn text={data.tradingPlan.planA.tp2} />
                    </div>
                    <div className="flex items-center justify-between sm:justify-start">
                      <span className="text-[#22c55e] font-bold">TP3: {data.tradingPlan.planA.tp3}</span>
                      <QuickCopyBtn text={data.tradingPlan.planA.tp3} />
                    </div>
                  </div>
                  
                  {data.tradingPlan.planA.entryPrice && data.tradingPlan.planA.sl && (
                    <RiskCalculator entryPrice={data.tradingPlan.planA.entryPrice} slPrice={data.tradingPlan.planA.sl} />
                  )}
                </div>
                
                <div className="border-t border-gray-800 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[#ef4444] font-bold tracking-wide text-sm">
                      &gt; {data.tradingPlan.planB.title}
                    </div>
                    <button onClick={() => saveToJournal('PLAN B')} className="flex items-center gap-1 bg-[#1e3a8a] text-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold hover:bg-blue-800 transition-colors">
                      <Save className="w-3 h-3" />
                      SIMPAN PLAN B
                    </button>
                  </div>
                  <ul className="text-gray-300 space-y-1.5 list-disc pl-4 ml-2">
                    {data.tradingPlan.planB.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM BANNER */}
        <div className="flex flex-col md:flex-row gap-4 mt-3 lg:mt-4">
          <div className="flex-1 border-2 border-[#b49a45] rounded-md bg-[#0a0a0a] p-3 sm:p-4 flex items-start gap-3 sm:gap-4 shadow-[0_0_15px_rgba(180,154,69,0.1)]">
            <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-[#ffcc00] shrink-0 mt-1" />
            <div>
              <div className="text-[#ffcc00] font-bold text-sm sm:text-base mb-1 tracking-wider">PERINGATAN GRINGGO</div>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                Pasaran boleh buat Judas Swing sebelum/selepas news.<br className="hidden sm:block"/>
                Jangan FOMO. Tunggu liquidity disapu dulu,<br className="hidden sm:block"/>
                baru masuk bila confirmation muncul.
              </p>
            </div>
          </div>
          
          <div className="md:w-1/3 flex items-center justify-end text-right px-4">
            <div className="relative">
              <span className="absolute -left-6 -top-4 text-[#ffcc00] text-5xl opacity-40 font-serif">"</span>
              <p className="text-sm sm:text-base text-gray-200 italic relative z-10 leading-snug">
                Disiplin hari ini, konsisten esok,<br/>
                profit akan jadi kebiasaan.
              </p>
              <div className="text-[#ffcc00] font-bold text-sm sm:text-base mt-2 tracking-wider">- GRINGGO</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {showJournal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border-2 border-[#b49a45] rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_0_30px_rgba(180,154,69,0.2)] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#111]">
              <div className="flex items-center gap-2 text-[#ffcc00] font-bold text-lg">
                <BookOpen className="w-5 h-5" />
                JURNAL TRADING GRINGGO
              </div>
              <button onClick={() => setShowJournal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {journal.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p>Tiada rekod jurnal setakat ini.</p>
                  <p className="text-sm mt-2">Buka Pelan Dagangan harian dan tekan "Simpan Jurnal".</p>
                </div>
              ) : (
                <>
                  <JournalAnalytics journal={journal} />
                  <div className="space-y-4">
                    {journal.map((entry) => (
                      <div key={entry.id} className="border border-gray-800 bg-black rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-white text-lg">{entry.date}</div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${entry.bias === 'BULLISH' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                              {entry.bias}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded font-bold bg-gray-800 text-gray-300">
                              {entry.bos}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-900/50 text-blue-400">
                              {entry.fvg}
                            </span>
                            {entry.plan && (
                              <span className="text-xs px-2 py-0.5 rounded font-bold bg-[#b49a45]/20 text-[#ffcc00] border border-[#b49a45]/50">
                                {entry.plan}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select 
                            value={entry.status}
                            onChange={(e) => updateJournalStatus(entry.id, e.target.value)}
                            className={`text-sm font-bold px-4 py-2.5 sm:px-3 sm:py-1.5 rounded outline-none cursor-pointer ${
                              entry.status === 'WIN' ? 'bg-[#22c55e] text-black' : 
                              entry.status === 'LOSS' ? 'bg-[#ef4444] text-white' : 
                              'bg-gray-700 text-white'
                            }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="WIN">WIN 🏆</option>
                            <option value="LOSS">LOSS ❌</option>
                          </select>
                          <button onClick={() => deleteJournalEntry(entry.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-800 rounded transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-[#111] flex justify-between items-center text-sm">
               <div className="text-gray-400">Total Entries: <span className="text-white font-bold">{journal.length}</span></div>
               <div className="flex gap-4">
                 <div className="text-gray-400">Wins: <span className="text-[#22c55e] font-bold">{journal.filter(j => j.status === 'WIN').length}</span></div>
                 <div className="text-gray-400">Losses: <span className="text-[#ef4444] font-bold">{journal.filter(j => j.status === 'LOSS').length}</span></div>
                 {journal.length > 0 && (
                   <div className="text-[#ffcc00] font-bold ml-2">
                     Win Rate: {Math.round((journal.filter(j => j.status === 'WIN').length / journal.filter(j => j.status !== 'PENDING').length) * 100) || 0}%
                   </div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      <HighImpactNewsModal 
        isOpen={showNewsModal}
        onClose={() => setShowNewsModal(false)}
        newsList={newsHistoryList}
        onAddNews={handleAddNews}
        onUpdateNews={handleUpdateNews}
        onDeleteNews={handleDeleteNews}
        onAutoSyncNews={handleAutoSyncNews}
      />

    </>
  );
}


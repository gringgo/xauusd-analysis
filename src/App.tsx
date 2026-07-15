import { useState, useEffect } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import { 
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
  Smartphone
} from 'lucide-react';
import { getLiveAnalysis } from './liveData';
import * as htmlToImage from 'html-to-image';
import { Download } from 'lucide-react';



const MockCandleChart = ({ title, subtitle, data, yLabels, xLabels, heightClass = "h-[200px]", fvgBox }: any) => {
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

export default function App() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Format for HTML date input: YYYY-MM-DD
  const [dateInput, setDateInput] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getTime() + 8 * 3600 * 1000).toISOString().split('T')[0];
  });

  const [showJournal, setShowJournal] = useState(false);
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
  const [journal, setJournal] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('trading_journal');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('trading_journal', JSON.stringify(journal));
  }, [journal]);

  const saveToJournal = () => {
    if (!data) return;
    
    // Prevent duplicate entries for the same date
    if (journal.find(j => j.date === data.date)) {
      setShowJournal(true);
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: data.date,
      bias: data.bias.direction,
      bos: data.bos.structure,
      fvg: `${data.fvg.direction} FVG`,
      status: 'PENDING'
    };

    setJournal([newEntry, ...journal]);
    setShowJournal(true);
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

  const updateJournalStatus = (id: number, status: string) => {
    setJournal(journal.map(j => j.id === id ? { ...j, status } : j));
  };

  const deleteJournalEntry = (id: number) => {
    setJournal(journal.filter(j => j.id !== id));
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
      }, 60000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [targetDate]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!data && !error) setError("Timeout fetching data for " + targetDate.toDateString());
    }, 15000);
    return () => clearTimeout(t);
  }, [data, error]);

  if (error && !data) return <div className="min-h-screen bg-black text-white flex items-center justify-center p-8 break-all">{error}</div>;

  if (!data) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Live Data...</div>;
  

  return (
    <>
      <div className="min-h-screen bg-[#020202] text-white font-sans p-1 sm:p-2 md:p-4 flex flex-col items-center">
      <div className={`w-full max-w-[1300px] flex justify-end flex-wrap gap-2 mb-2 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        {showInstallBtn && (
          <button onClick={handleInstallClick} className="flex items-center gap-1.5 bg-[#22c55e] text-black px-3 py-1.5 rounded-md font-bold text-xs sm:text-sm hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20">
            <Smartphone className="w-4 h-4 text-black" />
            PASANG APLIKASI
          </button>
        )}
        <button onClick={handleDownloadImage} className="flex items-center gap-2 bg-[#ffcc00] text-black px-3 py-1.5 rounded-md font-bold text-xs sm:text-sm hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20">
          <Download className="w-4 h-4" />
          DOWNLOAD GAMBAR
        </button>
      </div>
      <div id="export-container" className={`w-full max-w-[1300px] border border-gray-800 bg-black p-2 sm:p-3 md:p-4 rounded-md shadow-2xl transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center pb-3 border-b border-gray-800 mb-3 gap-2">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🪙</div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#ffcc00] tracking-wider leading-none" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                XAUUSD ANALYSIS
              </h1>
              <div className="flex items-center gap-2 mt-1 text-sm sm:text-base font-bold">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="text-white tracking-widest">{data.date} {data.time && `| ${data.time} MYT`}</span>
                <span className="ml-2 px-1.5 py-0.5 bg-[#1e3a8a] text-white text-[10px] rounded font-bold border border-[#b49a45]">
                  D1 OPEN: 8:00 AM MYT
                </span>
    
                <button onClick={() => setShowJournal(true)} className="ml-2 flex items-center gap-1 bg-[#b49a45] text-black px-2 py-1 rounded font-bold text-xs sm:text-sm hover:bg-[#ffcc00] transition-colors">
                  <BookOpen className="w-4 h-4" />
                  JURNAL
                </button>

    <input 
      type="date" 
      value={dateInput}
      
      onChange={(e) => {
        setDateInput(e.target.value);
        if (e.target.value) {
          setTargetDate(new Date(e.target.value + 'T23:59:59+08:00'));
        }
      }}
      className="bg-black border border-gray-700 text-white text-xs px-2 py-1 rounded ml-2"
    />
              </div>
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#ffcc00] tracking-widest italic" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
            BY {data.author}
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          
          {/* LEFT COLUMN (Charts & Fundamentals) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 lg:gap-4">
            
            {/* Charts Column */}
            <div className="flex flex-col gap-3">
              <MockCandleChart 
                title="D1 CHART (DAILY)" 
                subtitle="D1"
                data={data.charts.d1.candles}
                yLabels={data.charts.d1.yLabels}
                xLabels={data.charts.d1.xLabels}
                heightClass="h-[160px] sm:h-[200px]"
              />

              <MockCandleChart 
                title="H4 CHART (4 HOUR)" 
                subtitle="H4"
                data={data.charts.h4.candles}
                fvgBox={data.charts.h4.fvgBox}
                yLabels={data.charts.h4.yLabels}
                xLabels={data.charts.h4.xLabels}
                heightClass="h-[160px] sm:h-[190px]"
              />

              <MockCandleChart 
                title="H1 CHART (1 HOUR)" 
                subtitle="H1"
                data={data.charts.h1.candles}
                fvgBox={data.charts.h1.fvgBox}
                yLabels={data.charts.h1.yLabels}
                xLabels={data.charts.h1.xLabels}
                heightClass="h-[150px] sm:h-[180px]"
              />
            </div>

            {/* Fundamentals & Impact Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              
              {/* Fundamentals */}
              <div className="border border-[#b49a45] rounded bg-[#0a0a0a] flex flex-col">
                <div className="bg-[#1e3a8a] px-3 py-1.5 flex items-center gap-2 border-b border-[#b49a45]">
                  <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5" />
                  <span className="text-white font-bold text-xs sm:text-sm tracking-wide">FUNDAMENTAL (USD)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] sm:text-xs text-left text-gray-200">
                    <thead className="text-gray-400 border-b border-gray-700 bg-black/50">
                      <tr>
                        <th className="px-2 py-1.5 font-normal text-center w-20">TIME (MYT)</th>
                        <th className="px-2 py-1.5 font-normal">NEWS</th>
                        <th className="px-2 py-1.5 font-normal text-center w-20">IMPACT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {data.news.map((item, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1.5 text-center">{item.time}</td>
                          <td className="px-2 py-1.5">{item.event}</td>
                          <td className={`px-2 py-1.5 font-bold text-center ${item.impact === 'HIGH' ? 'text-[#ef4444]' : (item.impact === 'MED' ? 'text-[#eab308]' : (item.impact === 'INFO' ? 'text-[#3b82f6]' : 'text-gray-400'))}`}>{item.impact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-2 border-t border-[#b49a45] flex gap-2 items-start bg-[#111] mt-auto">
                  <BarChart3 className="w-5 h-5 text-[#ffcc00] shrink-0 mt-0.5" />
                  <div className="text-[10px] sm:text-xs text-gray-300 leading-tight">
                    <span className="font-bold text-white">High Impact = Volatiliti Tinggi</span><br/>
                    Pastikan risk management & jangan overtrade!
                  </div>
                </div>
              </div>

              {/* Impact kepada XAUUSD */}
              <div className="border border-[#b49a45] rounded bg-[#0a0a0a] flex flex-col">
                <div className="border-b border-[#b49a45] px-3 py-1.5 bg-[#111]">
                  <span className="text-white font-bold text-xs sm:text-sm tracking-wide">IMPACT KEPADA XAUUSD HARI INI</span>
                </div>
                <div className="p-3 text-xs space-y-3 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className={`font-bold mb-1.5 tracking-wide ${data.bias.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {data.impact.title}
                      </div>
                      <p className="text-gray-300 mb-2 leading-relaxed">
                        {data.impact.description}
                      </p>
                      <ul className="text-gray-300 space-y-1">
                        {data.impact.catalyst.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#ffcc00] mt-0.5">❖</span> 
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`border-2 rounded-full p-2 mr-1 shrink-0 ${data.bias.direction === 'BEARISH' ? 'text-[#ef4444] border-[#ef4444] bg-[#ef4444]/10' : 'text-[#22c55e] border-[#22c55e] bg-[#22c55e]/10'}`}>
                      <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Analysis Panels) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 lg:gap-4">
            
            {/* BIAS UTAMA */}
            <div className="border border-[#b49a45] rounded bg-[#0a0a0a]">
              <div className="border-b border-[#b49a45] px-3 py-1">
                <span className="text-white font-bold text-xs sm:text-sm tracking-wide">BIAS UTAMA</span>
              </div>
              <div className="p-3">
                <div className={`text-4xl sm:text-5xl font-black mb-3 tracking-wider ${data.bias.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`} style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                  {data.bias.direction}
                </div>
                <ul className="text-xs sm:text-sm text-gray-200 space-y-2 list-disc pl-4 ml-1">
                  {data.bias.reasons.map((reason, i) => (
                    <li key={i}>{reason.split('\n').map((line, j) => <div key={j}>{line}</div>)}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* LIQUIDITY */}
            <div className="border border-[#b49a45] rounded bg-[#0a0a0a]">
              <div className="border-b border-[#b49a45] px-3 py-1">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">LIQUIDITY</span>
              </div>
              <div className="p-3 space-y-4">
                <div>
                  <div className="text-[#22c55e] font-bold text-xs sm:text-sm mb-2 tracking-wide">BUY-SIDE LIQUIDITY</div>
                  {data.liquidity.buySide.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs sm:text-sm text-gray-200 py-0.5">
                      <span>{item.price} {item.label}</span>
                      {i < 2 && <ArrowUp className="w-4 h-4 text-[#22c55e]" strokeWidth={3} />}
                    </div>
                  ))}
                </div>
                
                <div>
                  <div className="text-[#ef4444] font-bold text-xs sm:text-sm mb-2 tracking-wide">SELL-SIDE LIQUIDITY</div>
                  {data.liquidity.sellSide.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs sm:text-sm text-gray-200 py-0.5">
                      <span>{item.price} {item.label}</span>
                      {i < 2 && <ArrowDown className="w-4 h-4 text-[#ef4444]" strokeWidth={3} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FVG */}
            <div className="border border-[#b49a45] rounded bg-[#0a0a0a]">
              <div className="border-b border-[#b49a45] px-3 py-1">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">FVG (FAIR VALUE GAP)</span>
              </div>
              <div className="p-3">
                <div className="flex flex-col gap-3 mb-3">
                  {data.fvg.h4 && (
                    <div>
                      <div className={`font-bold text-xs sm:text-sm mb-1 tracking-wide ${data.fvg.h4.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {data.fvg.h4.direction} FVG (H4)
                      </div>
                      <div className="bg-[#1e3a8a] text-white px-2 py-1 text-xs sm:text-sm font-bold inline-block rounded-sm shadow-lg shadow-blue-900/20">
                        {data.fvg.h4.range}
                      </div>
                    </div>
                  )}
                  {data.fvg.h1 && (
                    <div>
                      <div className={`font-bold text-xs sm:text-sm mb-1 tracking-wide ${data.fvg.h1.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {data.fvg.h1.direction} FVG (H1)
                      </div>
                      <div className="bg-[#1e3a8a] text-white px-2 py-1 text-xs sm:text-sm font-bold inline-block rounded-sm shadow-lg shadow-blue-900/20">
                        {data.fvg.h1.range}
                      </div>
                    </div>
                  )}
                  {!data.fvg.h4 && !data.fvg.h1 && (
                     <div>
                      <div className={`font-bold text-xs sm:text-sm mb-1 tracking-wide ${data.fvg.direction === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#22c55e]'}`}>
                        {data.fvg.direction} FVG ({data.fvg.timeframe})
                      </div>
                      <div className="bg-[#1e3a8a] text-white px-2 py-1 text-xs sm:text-sm font-bold inline-block rounded-sm shadow-lg shadow-blue-900/20">
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
            <div className="border border-[#b49a45] rounded bg-[#0a0a0a]">
              <div className="border-b border-[#b49a45] px-3 py-1">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">BOS (BREAK OF STRUCTURE)</span>
              </div>
              <div className="p-3 text-xs sm:text-sm text-gray-200 space-y-2">
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
            <div className="border border-[#b49a45] rounded bg-[#0a0a0a] flex-1">
              <div className="border-b border-[#b49a45] px-3 py-1 flex items-center justify-between">
                <span className="text-[#ffcc00] font-bold text-xs sm:text-sm tracking-wide">TRADING PLAN</span>
                
                <div className="flex items-center gap-2">
                  <button onClick={saveToJournal} className="flex items-center gap-1 bg-[#1e3a8a] text-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold hover:bg-blue-800 transition-colors">
                    <Save className="w-3 h-3" />
                    SIMPAN JURNAL
                  </button>
                  <div className="flex items-center gap-1 opacity-60">
                    <span className="text-white text-xs tracking-wider">@eskey969</span>
                  </div>
                </div>

              </div>
              <div className="p-3 text-xs sm:text-sm space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[#22c55e] font-bold mb-2 tracking-wide text-sm">
                    <Check className="w-4 h-4" strokeWidth={3} /> {data.tradingPlan.planA.title}
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
                    <li className="flex items-center gap-2 pt-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Entry <span className="text-[#ef4444] font-bold border border-red-500/30 px-1.5 py-0.5 rounded ml-1 bg-red-500/10">{data.tradingPlan.planA.entry}</span>
                    </li>
                    <li>SL: {data.tradingPlan.planA.sl}</li>
                  </ul>
                  <div className="flex justify-between text-gray-300 mt-3 ml-6 font-mono text-xs bg-[#111] p-2 rounded border border-gray-800">
                    <span>TP1: {data.tradingPlan.planA.tp1}</span>
                    <span>TP2: {data.tradingPlan.planA.tp2}</span>
                    <span className="text-[#22c55e] font-bold">TP3: {data.tradingPlan.planA.tp3}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-3">
                  <div className="text-[#ef4444] font-bold mb-2 tracking-wide text-sm">
                    &gt; {data.tradingPlan.planB.title}
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
              <div className="text-[#ffcc00] font-bold text-sm sm:text-base mb-1 tracking-wider">PERINGATAN MAXX</div>
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
              <div className="text-[#ffcc00] font-bold text-sm sm:text-base mt-2 tracking-wider">- MAXX</div>
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
                JURNAL TRADING MAXX
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
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select 
                          value={entry.status}
                          onChange={(e) => updateJournalStatus(entry.id, e.target.value)}
                          className={`text-sm font-bold px-3 py-1.5 rounded outline-none cursor-pointer ${
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



    </>
  );
}


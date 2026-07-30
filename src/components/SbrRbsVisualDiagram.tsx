import React, { useState } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  Target, 
  ShieldAlert, 
  Zap, 
  ChevronRight,
  Info
} from 'lucide-react';

type TechniqueType = 'SBR' | 'DBD' | 'RBS' | 'RBR';

export const SbrRbsVisualDiagram: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TechniqueType>('SBR');
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  return (
    <div className="w-full bg-[#0d0d0d] border border-[#b49a45]/40 rounded-xl overflow-hidden my-3 text-white shadow-xl">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#14120a] via-[#1a180f] to-[#0d131a] border-b border-[#b49a45]/30 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#ffcc00]/10 border border-[#ffcc00]/30 text-[#ffcc00]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[#ffcc00] font-black text-xs sm:text-sm tracking-wide">
              DIAGRAM TEKNIKAL & ANATOMI STRUKTUR (SBR, DBD, RBS, RBR)
            </h4>
            <p className="text-[10px] text-gray-400">
              Visual rajah Candlestick & Price Action untuk pemahaman tepat pergerakan Smart Money / Instutitional Order Flow.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-[10px] font-bold text-gray-400 hover:text-[#ffcc00] flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded border border-gray-800 transition-colors"
        >
          <Info className="w-3 h-3" />
          {showExplanation ? 'Sembunyi Info' : 'Tunjuk Info'}
        </button>
      </div>

      {/* Tabs Selection */}
      <div className="bg-[#111] p-2 border-b border-gray-800 flex flex-wrap gap-1.5 justify-center sm:justify-start">
        <button
          onClick={() => setActiveTab('SBR')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
            activeTab === 'SBR'
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border border-red-400'
              : 'bg-black/80 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          1. SBR (Support Become Resistance)
        </button>

        <button
          onClick={() => setActiveTab('DBD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
            activeTab === 'DBD'
              ? 'bg-rose-700 text-white shadow-lg shadow-rose-950/40 border border-rose-500'
              : 'bg-black/80 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          2. DBD (Drop-Base-Drop)
        </button>

        <button
          onClick={() => setActiveTab('RBS')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
            activeTab === 'RBS'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 border border-emerald-400'
              : 'bg-black/80 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          3. RBS (Resistance Become Support)
        </button>

        <button
          onClick={() => setActiveTab('RBR')}
          className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
            activeTab === 'RBR'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40 border border-teal-400'
              : 'bg-black/80 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-emerald-300" />
          4. RBR (Rally-Base-Rally)
        </button>
      </div>

      {/* Main Diagram Area */}
      <div className="p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Interactive SVG Diagram Box (7 cols) */}
        <div className="lg:col-span-7 bg-black/90 border border-gray-800 rounded-xl p-3 sm:p-4 relative flex flex-col items-center justify-center min-h-[300px] shadow-inner">
          
          {/* Badge Indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider ${
              activeTab === 'SBR' || activeTab === 'DBD' 
                ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}>
              {activeTab === 'SBR' || activeTab === 'DBD' ? '🔻 SETUP SELL' : '🟢 SETUP BUY'}
            </span>
            <span className="text-[10px] font-mono text-gray-400">XAUUSD Structure</span>
          </div>

          {/* SVG Canvas Rendering based on activeTab */}
          {activeTab === 'SBR' && (
            <svg viewBox="0 0 500 280" className="w-full h-auto max-h-[260px] my-2">
              <defs>
                <linearGradient id="sellZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="70" x2="500" y2="70" stroke="#222" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#333" strokeWidth="1.5" strokeDasharray="5 5" />
              <line x1="0" y1="210" x2="500" y2="210" stroke="#222" strokeDasharray="3 3" />

              {/* Former Support / SBR Zone Box */}
              <rect x="40" y="125" width="420" height="30" fill="url(#sellZoneGrad)" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" rx="4" />
              <text x="450" y="145" fill="#ef4444" fontSize="10" fontWeight="bold" textAnchor="end">ZON SBR (SELL)</text>

              {/* Price Path Wave */}
              {/* 1. Initial Swing High to Low (Support) */}
              <path d="M 40,60 L 100,140 L 140,90 L 180,140" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
              
              {/* 2. Breakout Drop (Break Low Support) */}
              <path d="M 180,140 L 260,230" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              <circle cx="210" cy="170" r="14" fill="#ef4444" opacity="0.2" />
              <text x="210" y="174" fill="#ff4444" fontSize="10" fontWeight="900" textAnchor="middle">BREAK!</text>

              {/* 3. Pullback / Retest back to SBR Zone */}
              <path d="M 260,230 L 340,135" fill="none" stroke="#eab308" strokeWidth="2.5" strokeDasharray="4 2" strokeLinecap="round" />

              {/* 4. Drop Rejection (SELL Continuation) */}
              <path d="M 340,135 L 440,240" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />

              {/* Markers & Labels */}
              {/* Support 1 */}
              <circle cx="100" cy="140" r="5" fill="#3b82f6" />
              <text x="100" y="160" fill="#60a5fa" fontSize="10" fontWeight="bold" textAnchor="middle">Support (Low)</text>

              {/* Entry point */}
              <circle cx="340" cy="135" r="7" fill="#ef4444" stroke="#fff" strokeWidth="2" />
              <text x="340" y="115" fill="#ffcc00" fontSize="11" fontWeight="900" textAnchor="middle">🎯 ENTRY SELL HERE</text>

              {/* Target TP */}
              <circle cx="440" cy="240" r="5" fill="#22c55e" />
              <text x="440" y="258" fill="#4ade80" fontSize="10" fontWeight="bold" textAnchor="middle">TAKETPROFIT (TP)</text>

              {/* SL Line */}
              <line x1="300" y1="105" x2="380" y2="105" stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />
              <text x="340" y="100" fill="#f43f5e" fontSize="9" fontWeight="bold" textAnchor="middle">STOP LOSS (SL)</text>
            </svg>
          )}

          {activeTab === 'DBD' && (
            <svg viewBox="0 0 500 280" className="w-full h-auto max-h-[260px] my-2">
              <defs>
                <linearGradient id="dbdZone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Candlestick visual representations */}
              {/* DROP 1 (Big Red Candle) */}
              <rect x="50" y="40" width="24" height="100" fill="#ef4444" rx="2" />
              <line x1="62" y1="20" x2="62" y2="150" stroke="#ef4444" strokeWidth="2" />

              {/* BASE (Sideways Candles) */}
              <rect x="110" y="120" width="18" height="30" fill="#eab308" rx="2" />
              <line x1="119" y1="110" x2="119" y2="160" stroke="#eab308" strokeWidth="1.5" />

              <rect x="140" y="130" width="18" height="25" fill="#22c55e" rx="2" />
              <line x1="149" y1="120" x2="149" y2="165" stroke="#22c55e" strokeWidth="1.5" />

              <rect x="170" y="125" width="18" height="35" fill="#ef4444" rx="2" />
              <line x1="179" y1="115" x2="179" y2="170" stroke="#ef4444" strokeWidth="1.5" />

              {/* Base Highlight Zone */}
              <rect x="95" y="110" width="280" height="60" fill="url(#dbdZone)" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" rx="4" />
              <text x="370" y="125" fill="#f43f5e" fontSize="10" fontWeight="black" textAnchor="end">ZON BASE (ENTRY SELL)</text>

              {/* DROP 2 (Breakout Candle) */}
              <rect x="230" y="150" width="28" height="100" fill="#ef4444" rx="2" />
              <line x1="244" y1="140" x2="244" y2="260" stroke="#ef4444" strokeWidth="2" />

              {/* Pullback Arrow into Base */}
              <path d="M 280,220 C 310,220 330,150 330,140" fill="none" stroke="#eab308" strokeWidth="3" strokeDasharray="4 2" markerEnd="url(#arrow)" />

              {/* Final Drop Continuation */}
              <path d="M 330,140 L 440,250" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />

              {/* Labels */}
              <text x="62" y="170" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">1. DROP</text>
              <text x="145" y="95" fill="#eab308" fontSize="11" fontWeight="bold" textAnchor="middle">2. BASE (Consolidation)</text>
              <text x="244" y="275" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">3. DROP (Breakout)</text>

              {/* Entry */}
              <circle cx="330" cy="140" r="6" fill="#ffcc00" stroke="#ef4444" strokeWidth="2" />
              <text x="330" y="120" fill="#ffcc00" fontSize="10" fontWeight="black" textAnchor="middle">🎯 ENTRY SELL (BASE RETEST)</text>
            </svg>
          )}

          {activeTab === 'RBS' && (
            <svg viewBox="0 0 500 280" className="w-full h-auto max-h-[260px] my-2">
              <defs>
                <linearGradient id="buyZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="70" x2="500" y2="70" stroke="#222" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#333" strokeWidth="1.5" strokeDasharray="5 5" />
              <line x1="0" y1="210" x2="500" y2="210" stroke="#222" strokeDasharray="3 3" />

              {/* Former Resistance / RBS Zone Box */}
              <rect x="40" y="125" width="420" height="30" fill="url(#buyZoneGrad)" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 2" rx="4" />
              <text x="450" y="145" fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="end">ZON RBS (BUY)</text>

              {/* Price Path Wave */}
              {/* 1. Swing Low to Resistance High */}
              <path d="M 40,220 L 100,140 L 140,180 L 180,140" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              
              {/* 2. Breakout Rally (Break High Resistance) */}
              <path d="M 180,140 L 260,50" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
              <circle cx="210" cy="110" r="14" fill="#22c55e" opacity="0.2" />
              <text x="210" y="114" fill="#4ade80" fontSize="10" fontWeight="900" textAnchor="middle">BREAK!</text>

              {/* 3. Pullback / Retest down to RBS Zone */}
              <path d="M 260,50 L 340,140" fill="none" stroke="#eab308" strokeWidth="2.5" strokeDasharray="4 2" strokeLinecap="round" />

              {/* 4. Rally Rejection (BUY Continuation) */}
              <path d="M 340,140 L 440,30" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />

              {/* Markers & Labels */}
              {/* Resistance 1 */}
              <circle cx="100" cy="140" r="5" fill="#3b82f6" />
              <text x="100" y="120" fill="#60a5fa" fontSize="10" fontWeight="bold" textAnchor="middle">Resistance (High)</text>

              {/* Entry point */}
              <circle cx="340" cy="140" r="7" fill="#22c55e" stroke="#fff" strokeWidth="2" />
              <text x="340" y="165" fill="#ffcc00" fontSize="11" fontWeight="900" textAnchor="middle">🎯 ENTRY BUY HERE</text>

              {/* Target TP */}
              <circle cx="440" cy="30" r="5" fill="#22c55e" />
              <text x="440" y="20" fill="#4ade80" fontSize="10" fontWeight="bold" textAnchor="middle">TAKETPROFIT (TP)</text>

              {/* SL Line */}
              <line x1="300" y1="175" x2="380" y2="175" stroke="#f43f5e" strokeWidth="2" strokeDasharray="2 2" />
              <text x="340" y="190" fill="#f43f5e" fontSize="9" fontWeight="bold" textAnchor="middle">STOP LOSS (SL)</text>
            </svg>
          )}

          {activeTab === 'RBR' && (
            <svg viewBox="0 0 500 280" className="w-full h-auto max-h-[260px] my-2">
              <defs>
                <linearGradient id="rbrZone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* RALLYS 1 (Big Green Candle) */}
              <rect x="50" y="140" width="24" height="100" fill="#22c55e" rx="2" />
              <line x1="62" y1="120" x2="62" y2="250" stroke="#22c55e" strokeWidth="2" />

              {/* BASE (Sideways Candles) */}
              <rect x="110" y="120" width="18" height="30" fill="#eab308" rx="2" />
              <line x1="119" y1="110" x2="119" y2="160" stroke="#eab308" strokeWidth="1.5" />

              <rect x="140" y="115" width="18" height="25" fill="#ef4444" rx="2" />
              <line x1="149" y1="105" x2="149" y2="150" stroke="#ef4444" strokeWidth="1.5" />

              <rect x="170" y="120" width="18" height="35" fill="#22c55e" rx="2" />
              <line x1="179" y1="110" x2="179" y2="165" stroke="#22c55e" strokeWidth="1.5" />

              {/* Base Highlight Zone */}
              <rect x="95" y="105" width="280" height="60" fill="url(#rbrZone)" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" rx="4" />
              <text x="370" y="120" fill="#4ade80" fontSize="10" fontWeight="black" textAnchor="end">ZON BASE (ENTRY BUY)</text>

              {/* RALLY 2 (Breakout Candle) */}
              <rect x="230" y="30" width="28" height="100" fill="#22c55e" rx="2" />
              <line x1="244" y1="15" x2="244" y2="140" stroke="#22c55e" strokeWidth="2" />

              {/* Pullback Arrow into Base */}
              <path d="M 280,50 C 310,50 330,130 330,140" fill="none" stroke="#eab308" strokeWidth="3" strokeDasharray="4 2" />

              {/* Final Rally Continuation */}
              <path d="M 330,140 L 440,20" fill="none" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />

              {/* Labels */}
              <text x="62" y="265" fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">1. RALLY</text>
              <text x="145" y="90" fill="#eab308" fontSize="11" fontWeight="bold" textAnchor="middle">2. BASE (Consolidation)</text>
              <text x="244" y="160" fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">3. RALLY (Breakout)</text>

              {/* Entry */}
              <circle cx="330" cy="140" r="6" fill="#ffcc00" stroke="#22c55e" strokeWidth="2" />
              <text x="330" y="160" fill="#ffcc00" fontSize="10" fontWeight="black" textAnchor="middle">🎯 ENTRY BUY (BASE RETEST)</text>
            </svg>
          )}

          {/* Interactive Step Timeline Footer inside SVG */}
          <div className="w-full mt-3 pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-300">
            <span className="font-bold text-[#ffcc00] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Langkah 1: Breakout
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="font-bold text-gray-300 flex items-center gap-1">
              Langkah 2: Retest Zon
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              Langkah 3: Confirmation Entry
            </span>
          </div>
        </div>

        {/* Detailed Explanation & Rules Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {activeTab === 'SBR' && (
            <div className="bg-[#111111] border border-red-900/40 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-red-900/30 pb-2">
                <span className="text-red-400 font-black text-sm tracking-wide">
                  🔻 FORMULA SBR (Support Become Resistance)
                </span>
                <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                  BEARISH SETUP
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-300">
                <p className="leading-relaxed">
                  Teknik SBR berlaku apabila <strong className="text-white">Paras Support Kunci (Swing Low)</strong> ditembus secara mendadak oleh momentum Bearish. Support yang telah pecah ini kini bertukar peranan menjadi <strong className="text-red-400">Resistance Baru (SBR)</strong>.
                </p>

                <div className="bg-black/60 p-2.5 rounded-lg border border-white/10 space-y-1.5">
                  <div className="font-bold text-[#ffcc00] text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    SYARAT ENTRY SBR (SELL):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                    <li>Ada Breakout Low (Support lama pecah dengan marubozu/volume).</li>
                    <li>Tunggu harga retrace/pullback naik semula menyentuh garisan SBR.</li>
                    <li>Cari confirmation Rejection (Shooting Star / Bearish Engulfing) di M5/M15.</li>
                    <li><strong className="text-red-400">SL:</strong> 15-25 pips di atas zon SBR.</li>
                    <li><strong className="text-emerald-400">TP:</strong> Support terdekat berikutnya (1:2 / 1:3 RR).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'DBD' && (
            <div className="bg-[#111111] border border-rose-900/40 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-900/30 pb-2">
                <span className="text-rose-400 font-black text-sm tracking-wide">
                  ⚡ FORMULA DBD (Drop-Base-Drop)
                </span>
                <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                  SND CONTINUATION
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-300">
                <p className="leading-relaxed">
                  DBD ialah corak <strong className="text-white">Supply & Demand Continuation</strong>. Selepas penurunan kuat (Drop 1), harga berhenti seketika membentuk zon pengumpulan order (Base) sebelum menyambung kejatuhan (Drop 2).
                </p>

                <div className="bg-black/60 p-2.5 rounded-lg border border-white/10 space-y-1.5">
                  <div className="font-bold text-[#ffcc00] text-[11px] flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    SYARAT ENTRY DBD (SELL):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                    <li>Kenalpasti zon Base (2-4 batang lilin bersaiz kecil).</li>
                    <li>Penurunan mendadak (Drop 2) memecahkan zon Base.</li>
                    <li>Set Limit Order / Tunggu Re-entry apabila harga naik menguji semula zon Base.</li>
                    <li><strong className="text-red-400">SL:</strong> Di atas High candle Base.</li>
                    <li><strong className="text-emerald-400">TP:</strong> Zon Demand berikutnya.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'RBS' && (
            <div className="bg-[#111111] border border-emerald-900/40 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-900/30 pb-2">
                <span className="text-emerald-400 font-black text-sm tracking-wide">
                  🟢 FORMULA RBS (Resistance Become Support)
                </span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                  BULLISH SETUP
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-300">
                <p className="leading-relaxed">
                  Teknik RBS berlaku apabila <strong className="text-white">Paras Resistance Kunci (Swing High)</strong> ditembus oleh kenaikan berimpak tinggi. Resistance yang pecah ini bertukar peranan menjadi <strong className="text-emerald-400">Support Baru (RBS)</strong>.
                </p>

                <div className="bg-black/60 p-2.5 rounded-lg border border-white/10 space-y-1.5">
                  <div className="font-bold text-[#ffcc00] text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    SYARAT ENTRY RBS (BUY):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                    <li>Ada Breakout High (Resistance lama pecah dengan ketara).</li>
                    <li>Tunggu harga retrace/pullback turun semula ke zon RBS.</li>
                    <li>Cari confirmation Rejection (Hammer / Bullish Engulfing) di M5/M15.</li>
                    <li><strong className="text-red-400">SL:</strong> 15-25 pips di bawah zon RBS.</li>
                    <li><strong className="text-emerald-400">TP:</strong> Resistance terdekat berikutnya.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'RBR' && (
            <div className="bg-[#111111] border border-teal-900/40 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-teal-900/30 pb-2">
                <span className="text-teal-300 font-black text-sm tracking-wide">
                  ⚡ FORMULA RBR (Rally-Base-Rally)
                </span>
                <span className="bg-teal-950 text-teal-300 border border-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                  SND CONTINUATION
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-300">
                <p className="leading-relaxed">
                  RBR ialah corak <strong className="text-white">Demand Continuation</strong>. Selepas lonjakan harga (Rally 1), pasaran membentuk konsolidasi kecil (Base) sebelum meneruskan kenaikan kuat (Rally 2).
                </p>

                <div className="bg-black/60 p-2.5 rounded-lg border border-white/10 space-y-1.5">
                  <div className="font-bold text-[#ffcc00] text-[11px] flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    SYARAT ENTRY RBR (BUY):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-300">
                    <li>Lilin kenaikan tajam (Rally 1) diikuti Base kecil.</li>
                    <li>Kenaikan impulsif kedua (Rally 2) memecahkan Base.</li>
                    <li>Tunggu harga retest zon Base untuk pemicu ENTRY BUY.</li>
                    <li><strong className="text-red-400">SL:</strong> Di bawah Low candle Base.</li>
                    <li><strong className="text-emerald-400">TP:</strong> Target Liquidity High terdekat.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Quick Checklist Note */}
          <div className="bg-gradient-to-r from-[#1a180f] to-black border border-[#b49a45]/30 p-2.5 rounded-xl text-[10px] text-gray-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-[#ffcc00] shrink-0 mt-0.5" />
            <div>
              <span className="text-[#ffcc00] font-bold block">PETUAH PENTING XAUUSD GRINGGO:</span>
              Gabungkan zon SBR/RBS ini dengan <strong className="text-white">Order Block (OB)</strong> & <strong className="text-white">Fair Value Gap (FVG)</strong> untuk nisbah Win Rate mencecah 85% - 90%!
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

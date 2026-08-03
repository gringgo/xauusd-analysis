import React, { useState } from 'react';
import { TrendingDown, Zap, TrendingUp, Info, Circle } from 'lucide-react';

export const SbrRbsVisualDiagram: React.FC = () => {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(1);
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header Info */}
      <div className="bg-[#111] border border-gray-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#ffcc00]/10 rounded-lg shrink-0">
            <svg className="w-5 h-5 text-[#ffcc00]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[#ffcc00] font-bold text-sm tracking-wide">
              STRUKTUR (SBR, DBD, RBS, RBR)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Visual rajah Candlestick & Price Action untuk pemahaman tepat pergerakan Smart Money / Institutional Order Flow.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="mt-3 flex items-center gap-1.5 text-xs text-gray-400 bg-black border border-gray-700 px-3 py-1.5 rounded hover:bg-gray-900 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          {showInfo ? 'Sembunyi Info' : 'Tunjuk Info'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => setActiveTab(1)}
            className={`flex items-center gap-2 w-full p-2.5 sm:p-3 rounded-lg border font-bold text-xs sm:text-sm transition-all ${
              activeTab === 1 
                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' 
                : 'bg-[#111] border-gray-800 text-gray-400 hover:bg-gray-900'
            }`}
          >
            <TrendingDown className="w-4 h-4 shrink-0" />
            1. SBR (Support Become Resistance)
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`flex items-center gap-2 w-full p-2.5 sm:p-3 rounded-lg border font-bold text-xs sm:text-sm transition-all justify-start sm:justify-center ${
              activeTab === 2
                ? 'bg-[#111] border-[#ffcc00] text-[#ffcc00] shadow-[0_0_15px_rgba(255,204,0,0.2)]' 
                : 'bg-[#111] border-gray-800 text-gray-400 hover:bg-gray-900 sm:justify-center'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            2. DBD (Drop-Base-Drop)
          </button>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={() => setActiveTab(3)}
            className={`flex items-center gap-2 w-full p-2.5 sm:p-3 rounded-lg border font-bold text-xs sm:text-sm transition-all ${
              activeTab === 3
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                : 'bg-[#111] border-gray-800 text-gray-400 hover:bg-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 shrink-0" />
            3. RBS (Resistance Become Support)
          </button>
          <button
            onClick={() => setActiveTab(4)}
            className={`flex items-center gap-2 w-full p-2.5 sm:p-3 rounded-lg border font-bold text-xs sm:text-sm transition-all justify-start sm:justify-center ${
              activeTab === 4
                ? 'bg-[#111] border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-[#111] border-gray-800 text-gray-400 hover:bg-gray-900 sm:justify-center'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            4. RBR (Rally-Base-Rally)
          </button>
        </div>
      </div>

      {/* Diagram Container */}
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden mt-2">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800/60 bg-[#0d0d0d]">
          <div className={`px-3 py-1 rounded border text-xs font-black flex items-center gap-1.5 ${
            activeTab === 1 || activeTab === 2 
              ? 'bg-red-950/50 border-red-900/50 text-red-500 shadow-[0_0_10px_rgba(220,38,38,0.2)]' 
              : 'bg-emerald-950/50 border-emerald-900/50 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
          }`}>
            <Circle className="w-2.5 h-2.5 fill-current" />
            SETUP {activeTab === 1 || activeTab === 2 ? 'SELL' : 'BUY'}
          </div>
          <span className="text-gray-400 font-mono text-xs hidden sm:block">XAUUSD Structure</span>
        </div>

        {/* Diagram Area */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[250px] relative w-full overflow-hidden">
          
          {/* TAB 1: SBR Candlesticks */}
          {activeTab === 1 && (
            <div className="relative w-full max-w-md h-56 flex items-center justify-center">
              {/* Grid Lines */}
              <div className="absolute top-1/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>
              <div className="absolute top-2/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>
              <div className="absolute top-3/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>

              {/* SBR Zone (Support turning Resistance) */}
              <div className="absolute left-[10%] right-[10%] bottom-[42%] h-12 border border-dashed border-red-500/50 bg-red-950/20 rounded z-0 flex items-center justify-end pr-2">
                <span className="text-[9px] sm:text-[10px] text-red-500 font-bold bg-black/60 px-1.5 py-0.5 rounded absolute -right-0 sm:-right-4 top-12">ZON SBR (SELL)</span>
              </div>
              
              <div className="flex items-end gap-3 sm:gap-6 h-full pb-4 z-10 relative mt-4">
                {/* 1. Support Formation */}
                <div className="flex items-end gap-1 mb-[35%] relative">
                  <span className="text-[8px] sm:text-[9px] text-blue-400 font-bold absolute -bottom-5 left-1 whitespace-nowrap bg-black/60 px-1 rounded">Support (Low)</span>
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-red-500"></div>
                    <div className="w-4 sm:w-5 h-16 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]"></div>
                    <div className="w-0.5 h-2 bg-red-500"></div>
                  </div>
                  <div className="flex flex-col items-center mb-2">
                    <div className="w-0.5 h-2 bg-emerald-500"></div>
                    <div className="w-4 sm:w-5 h-10 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]"></div>
                    <div className="w-0.5 h-4 bg-emerald-500"></div>
                  </div>
                </div>
                
                {/* 2. Breakout Drop */}
                <div className="flex flex-col items-center mb-[5%] relative">
                  <span className="text-[8px] sm:text-[9px] text-red-500 font-bold absolute -bottom-6 bg-black/60 px-1 rounded">BREAK!</span>
                  <div className="w-1 h-2 bg-red-500 rounded-t"></div>
                  <div className="w-5 sm:w-6 h-28 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"></div>
                  <div className="w-1 h-6 bg-red-500 rounded-b"></div>
                </div>

                {/* 3. Retest Pullback */}
                <div className="flex items-end gap-1 mb-[20%] relative">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-2 bg-emerald-500"></div>
                    <div className="w-3 sm:w-4 h-6 bg-emerald-500"></div>
                    <div className="w-0.5 h-1 bg-emerald-500"></div>
                  </div>
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-0.5 h-1 bg-emerald-500"></div>
                    <div className="w-3 sm:w-4 h-8 bg-emerald-500"></div>
                    <div className="w-0.5 h-2 bg-emerald-500"></div>
                  </div>
                  <div className="flex flex-col items-center mb-8">
                    <div className="w-0.5 h-2 bg-emerald-500"></div>
                    <div className="w-3 sm:w-4 h-7 bg-emerald-500"></div>
                    <div className="w-0.5 h-3 bg-emerald-500"></div>
                  </div>
                </div>
                
                {/* 4. Entry Confirmation Drop */}
                <div className="flex flex-col items-center mb-[18%] relative ml-2">
                  <div className="w-1 h-3 bg-red-500 rounded-t"></div>
                  <div className="w-5 sm:w-6 h-16 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]"></div>
                  <div className="w-1 h-5 bg-red-500 rounded-b"></div>
                  
                  {/* Arrow from retest to entry */}
                  <div className="absolute -top-4 -left-12 w-16 h-12 z-0">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                      <path d="M0,80 Q40,20 80,60" fill="none" stroke="#facc15" strokeWidth="2.5" strokeDasharray="3 3" />
                      <circle cx="80" cy="60" r="4" fill="#facc15" className="animate-pulse" />
                    </svg>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] text-yellow-500 font-bold whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-yellow-500/30 z-20">
                      🎯 ENTRY SELL
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DBD Candlesticks */}
          {activeTab === 2 && (
            <div className="relative w-full max-w-md h-56 flex items-center justify-center">
              {/* Grid Lines */}
              <div className="absolute top-1/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>
              <div className="absolute top-2/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>
              <div className="absolute top-3/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>

              {/* Base Zone */}
              <div className="absolute left-[15%] right-[15%] top-[40%] h-14 border border-dashed border-red-500/50 bg-red-950/20 rounded z-0 flex items-center justify-end pr-2">
                <span className="text-[9px] sm:text-[10px] text-red-500 font-bold bg-black/60 px-1.5 py-0.5 rounded absolute -right-0 sm:-right-4 -top-6">ZON BASE (ENTRY SELL)</span>
              </div>
              
              <div className="flex items-end gap-2 sm:gap-4 h-full pb-8 z-10 relative">
                {/* Drop 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-1 h-6 bg-red-500 rounded-t"></div>
                  <div className="w-5 sm:w-6 h-20 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></div>
                  <div className="w-1 h-4 bg-red-500 rounded-b"></div>
                  <span className="text-[8px] sm:text-[9px] text-red-500 font-bold mt-2 absolute -bottom-4 bg-black/60 px-1 rounded">1. DROP</span>
                </div>
                
                {/* Base Candles */}
                <div className="flex items-end gap-1.5 mb-8">
                  <span className="text-[8px] sm:text-[9px] text-yellow-500 font-bold absolute -top-4 whitespace-nowrap bg-black/60 px-1 rounded">2. BASE (Consolidation)</span>
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-2 bg-yellow-500"></div>
                    <div className="w-3 sm:w-4 h-6 bg-yellow-500"></div>
                    <div className="w-0.5 h-2 bg-yellow-500"></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-green-500"></div>
                    <div className="w-3 sm:w-4 h-8 bg-green-500 mb-1"></div>
                    <div className="w-0.5 h-1 bg-green-500"></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-1 bg-red-500"></div>
                    <div className="w-3 sm:w-4 h-7 bg-red-500"></div>
                    <div className="w-0.5 h-3 bg-red-500"></div>
                  </div>
                </div>
                
                {/* Drop 2 (Breakout) */}
                <div className="flex flex-col items-center translate-y-6">
                  <div className="w-1 h-2 bg-red-500 rounded-t"></div>
                  <div className="w-5 sm:w-6 h-16 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"></div>
                  <div className="w-1 h-8 bg-red-500 rounded-b"></div>
                  <span className="text-[8px] sm:text-[9px] text-red-500 font-bold mt-2 absolute -bottom-10 bg-black/60 px-1 rounded">3. DROP (Breakout)</span>
                </div>

                {/* Retest Line */}
                <div className="w-20 sm:w-24 h-full relative ml-2">
                  <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,80 Q30,80 50,45 T100,70" fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="50" cy="45" r="3" fill="#facc15" className="animate-pulse" />
                  </svg>
                  <div className="absolute top-[35%] left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] text-yellow-500 font-bold whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-yellow-500/30">
                    🎯 ENTRY SELL
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RBS Candlesticks */}
          {activeTab === 3 && (
            <div className="relative w-full max-w-md h-56 flex items-start justify-center pt-8">
              {/* Grid Lines */}
              <div className="absolute top-1/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>
              <div className="absolute top-2/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>
              <div className="absolute top-3/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>

              {/* RBS Zone (Resistance turning Support) */}
              <div className="absolute left-[10%] right-[10%] top-[38%] h-12 border border-dashed border-emerald-500/50 bg-emerald-950/20 rounded z-0 flex items-center justify-end pr-2">
                <span className="text-[9px] sm:text-[10px] text-emerald-500 font-bold bg-black/60 px-1.5 py-0.5 rounded absolute -right-0 sm:-right-4 -bottom-6">ZON RBS (BUY)</span>
              </div>
              
              <div className="flex items-start gap-3 sm:gap-6 h-full pt-2 z-10 relative">
                {/* 1. Resistance Formation */}
                <div className="flex items-start gap-1 mt-[35%] relative">
                  <span className="text-[8px] sm:text-[9px] text-blue-400 font-bold absolute -top-5 left-1 whitespace-nowrap bg-black/60 px-1 rounded">Resistance (High)</span>
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-emerald-500"></div>
                    <div className="w-4 sm:w-5 h-16 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]"></div>
                    <div className="w-0.5 h-2 bg-emerald-500"></div>
                  </div>
                  <div className="flex flex-col items-center mt-2">
                    <div className="w-0.5 h-2 bg-red-500"></div>
                    <div className="w-4 sm:w-5 h-10 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.2)]"></div>
                    <div className="w-0.5 h-4 bg-red-500"></div>
                  </div>
                </div>
                
                {/* 2. Breakout Rally */}
                <div className="flex flex-col items-center mt-[5%] relative">
                  <span className="text-[8px] sm:text-[9px] text-emerald-500 font-bold absolute -top-6 bg-black/60 px-1 rounded">BREAK!</span>
                  <div className="w-1 h-5 bg-emerald-500 rounded-t"></div>
                  <div className="w-5 sm:w-6 h-28 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"></div>
                  <div className="w-1 h-3 bg-emerald-500 rounded-b"></div>
                </div>

                {/* 3. Retest Pullback */}
                <div className="flex items-start gap-1 mt-[20%] relative">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-1 bg-red-500"></div>
                    <div className="w-3 sm:w-4 h-6 bg-red-500"></div>
                    <div className="w-0.5 h-2 bg-red-500"></div>
                  </div>
                  <div className="flex flex-col items-center mt-4">
                    <div className="w-0.5 h-2 bg-red-500"></div>
                    <div className="w-3 sm:w-4 h-8 bg-red-500"></div>
                    <div className="w-0.5 h-1 bg-red-500"></div>
                  </div>
                  <div className="flex flex-col items-center mt-8">
                    <div className="w-0.5 h-3 bg-red-500"></div>
                    <div className="w-3 sm:w-4 h-7 bg-red-500"></div>
                    <div className="w-0.5 h-2 bg-red-500"></div>
                  </div>
                </div>
                
                {/* 4. Entry Confirmation Rally */}
                <div className="flex flex-col items-center mt-[18%] relative ml-2">
                  <div className="w-1 h-5 bg-emerald-500 rounded-t"></div>
                  <div className="w-5 sm:w-6 h-16 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                  <div className="w-1 h-3 bg-emerald-500 rounded-b"></div>
                  
                  {/* Arrow from retest to entry */}
                  <div className="absolute -bottom-2 -left-12 w-16 h-12 z-0">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
                      <path d="M0,20 Q40,80 80,40" fill="none" stroke="#facc15" strokeWidth="2.5" strokeDasharray="3 3" />
                      <circle cx="80" cy="40" r="4" fill="#facc15" className="animate-pulse" />
                    </svg>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] text-yellow-500 font-bold whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-yellow-500/30 z-20">
                      🎯 ENTRY BUY
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RBR Candlesticks */}
          {activeTab === 4 && (
            <div className="relative w-full max-w-md h-56 flex items-center justify-center">
              {/* Grid Lines */}
              <div className="absolute top-1/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>
              <div className="absolute top-2/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>
              <div className="absolute top-3/4 w-full border-t border-dashed border-gray-800/60 z-0"></div>

              {/* Base Zone */}
              <div className="absolute left-[15%] right-[15%] top-[40%] h-14 border border-dashed border-emerald-500/50 bg-emerald-950/20 rounded z-0 flex items-center justify-end pr-2">
                <span className="text-[9px] sm:text-[10px] text-emerald-500 font-bold bg-black/60 px-1.5 py-0.5 rounded absolute -right-0 sm:-right-4 -bottom-6">ZON BASE (ENTRY BUY)</span>
              </div>
              
              <div className="flex items-end gap-2 sm:gap-4 h-full pb-10 z-10 relative">
                {/* Rally 1 */}
                <div className="flex flex-col items-center">
                  <div className="w-1 h-4 bg-emerald-500 rounded-t"></div>
                  <div className="w-5 sm:w-6 h-20 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                  <div className="w-1 h-6 bg-emerald-500 rounded-b"></div>
                  <span className="text-[8px] sm:text-[9px] text-emerald-500 font-bold mt-2 absolute -bottom-4 bg-black/60 px-1 rounded">1. RALLY</span>
                </div>
                
                {/* Base Candles */}
                <div className="flex items-end gap-1.5 mb-10">
                  <span className="text-[8px] sm:text-[9px] text-yellow-500 font-bold absolute top-[20%] whitespace-nowrap bg-black/60 px-1 rounded">2. BASE (Consolidation)</span>
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-2 bg-yellow-500"></div>
                    <div className="w-3 sm:w-4 h-7 bg-yellow-500"></div>
                    <div className="w-0.5 h-3 bg-yellow-500"></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-red-500"></div>
                    <div className="w-3 sm:w-4 h-6 bg-red-500 mb-1"></div>
                    <div className="w-0.5 h-1 bg-red-500"></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-1 bg-emerald-500"></div>
                    <div className="w-3 sm:w-4 h-8 bg-emerald-500"></div>
                    <div className="w-0.5 h-2 bg-emerald-500"></div>
                  </div>
                </div>
                
                {/* Rally 2 (Breakout) */}
                <div className="flex flex-col items-center -translate-y-8">
                  <div className="w-1 h-8 bg-emerald-500 rounded-t"></div>
                  <div className="w-5 sm:w-6 h-16 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                  <div className="w-1 h-2 bg-emerald-500 rounded-b"></div>
                  <span className="text-[8px] sm:text-[9px] text-emerald-500 font-bold mt-2 absolute -bottom-4 bg-black/60 px-1 rounded">3. RALLY (Breakout)</span>
                </div>

                {/* Retest Line */}
                <div className="w-20 sm:w-24 h-full relative ml-2">
                  <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,20 Q30,20 50,55 T100,10" fill="none" stroke="#facc15" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="50" cy="55" r="3" fill="#facc15" className="animate-pulse" />
                  </svg>
                  <div className="absolute top-[60%] left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] text-yellow-500 font-bold whitespace-nowrap bg-black/80 px-1.5 py-0.5 rounded border border-yellow-500/30">
                    🎯 ENTRY BUY
                  </div>
                </div>
              </div>
            </div>
          )}
          
        </div>

        {/* Steps Footer */}
        <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 border-t border-gray-800/60 bg-[#050505]">
          <div className="flex gap-2 items-start">
            <Zap className="w-3.5 h-3.5 text-[#ffcc00] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="text-[#ffcc00] font-bold block mb-0.5">Langkah 1:</span>
              <span className="text-gray-300 font-medium leading-tight">Breakout</span>
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-gray-600 text-[10px] mt-1 shrink-0">{'>'}</span>
            <div className="text-xs">
              <span className="text-gray-400 font-bold block mb-0.5">Langkah 2:</span>
              <span className="text-gray-300 font-medium leading-tight">Retest Zon</span>
            </div>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-gray-600 text-[10px] mt-1 shrink-0">{'>'}</span>
            <div className="text-xs">
              <span className="text-emerald-400 font-bold block mb-0.5">Langkah 3:</span>
              <span className="text-emerald-400 font-medium leading-tight">Confirmation Entry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-[#111] border border-gray-800 rounded-xl p-4 mt-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className={`text-sm font-bold flex items-center gap-1.5 ${
            activeTab === 1 || activeTab === 2 ? 'text-red-400' : 'text-emerald-400'
          }`}>
            <Zap className="w-4 h-4" />
            FORMULA {activeTab === 1 ? 'SBR' : activeTab === 2 ? 'DBD' : activeTab === 3 ? 'RBS' : 'RBR'}
            <span className="text-gray-400 ml-1 font-normal text-xs hidden sm:inline-block">
              ({
                activeTab === 1 ? 'Support Become Resistance' : 
                activeTab === 2 ? 'Drop-Base-Drop' : 
                activeTab === 3 ? 'Resistance Become Support' : 
                'Rally-Base-Rally'
              })
            </span>
          </h4>
          <span className={`text-[10px] px-2 py-1 rounded font-bold border ${
            activeTab === 1 || activeTab === 3
              ? 'bg-red-950 text-red-400 border-red-900/50' 
              : 'bg-emerald-950 text-emerald-400 border-emerald-900/50'
          }`}>
            {activeTab === 1 || activeTab === 3 ? 'REVERSAL SETUP' : 'SND CONTINUATION'}
          </span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          {activeTab === 1 && (
            <>
              Teknik SBR berlaku apabila <strong className="text-white">Paras Support Kunci (Swing Low)</strong> ditembus (breakout) dengan momentum kuat. Support yang telah ditembus kini bertukar fungsi menjadi <strong className="text-red-400">Resistance baru</strong>. Tunggu harga membuat pullback/retest ke zon tersebut sebelum entry SELL.
            </>
          )}
          {activeTab === 2 && (
            <>
              DBD ialah corak <strong className="text-white">Supply & Demand Continuation</strong>. Selepas penurunan kuat (Drop 1), harga berhenti seketika membentuk konsolidasi kecil (Base), sebelum menyambung semula momentum kejatuhan (Drop 2). Zon Base ini menjadi <strong className="text-red-400">Hidden Supply</strong> yang kuat untuk entry SELL apabila harga retest.
            </>
          )}
          {activeTab === 3 && (
            <>
              Teknik RBS berlaku apabila <strong className="text-white">Paras Resistance Kunci (Swing High)</strong> ditembus (breakout) dengan momentum kuat. Resistance yang telah ditembus kini bertukar fungsi menjadi <strong className="text-emerald-400">Support baru</strong>. Tunggu harga membuat pullback/retest ke zon tersebut sebelum entry BUY.
            </>
          )}
          {activeTab === 4 && (
            <>
              RBR ialah corak <strong className="text-white">Demand Continuation</strong>. Selepas lonjakan harga (Rally 1), pasaran membentuk konsolidasi kecil (Base), sebelum meneruskan lonjakan (Rally 2). Zon konsolidasi/Base ini menjadi zon <strong className="text-emerald-400">Demand Zone</strong> yang valid untuk sambung entry BUY.
            </>
          )}
        </p>
      </div>

    </div>
  );
};

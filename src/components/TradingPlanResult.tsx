import React, { useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, Clock, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';

export const TradingPlanResult = ({ plan, currentPrice }: { plan: any, currentPrice: number }) => {
  const [showResult, setShowResult] = useState(false);

  if (!plan || !plan.entryPrice || !plan.sl) return null;

  const entry = parseFloat(plan.entryPrice);
  const sl = parseFloat(plan.sl);
  const tp1 = parseFloat(plan.tp1);
  const tp2 = parseFloat(plan.tp2);
  const tp3 = parseFloat(plan.tp3);
  
  const isBuy = plan.entry === 'BUY';

  // State logic
  let state = 'WAITING'; // WAITING, FLOATING, HIT_SL, HIT_TP1, HIT_TP2, HIT_TP3
  let pips = 0;

  if (isBuy) {
    if (currentPrice >= tp3) { state = 'HIT_TP3'; pips = (tp3 - entry) * 10; }
    else if (currentPrice >= tp2) { state = 'HIT_TP2'; pips = (tp2 - entry) * 10; }
    else if (currentPrice >= tp1) { state = 'HIT_TP1'; pips = (tp1 - entry) * 10; }
    else if (currentPrice <= sl) { state = 'HIT_SL'; pips = (currentPrice - entry) * 10; }
    else if (currentPrice > entry) { state = 'FLOATING_PROFIT'; pips = (currentPrice - entry) * 10; }
    else if (currentPrice < entry) { state = 'FLOATING_LOSS'; pips = (currentPrice - entry) * 10; }
  } else {
    if (currentPrice <= tp3) { state = 'HIT_TP3'; pips = (entry - tp3) * 10; }
    else if (currentPrice <= tp2) { state = 'HIT_TP2'; pips = (entry - tp2) * 10; }
    else if (currentPrice <= tp1) { state = 'HIT_TP1'; pips = (entry - tp1) * 10; }
    else if (currentPrice >= sl) { state = 'HIT_SL'; pips = (entry - currentPrice) * 10; }
    else if (currentPrice < entry) { state = 'FLOATING_PROFIT'; pips = (entry - currentPrice) * 10; }
    else if (currentPrice > entry) { state = 'FLOATING_LOSS'; pips = (entry - currentPrice) * 10; }
  }

  return (
    <div className="mt-4 border border-gray-800 rounded-lg bg-[#0a0a0a] overflow-hidden">
      <button 
        onClick={() => setShowResult(!showResult)}
        className="w-full bg-[#111] hover:bg-gray-900 transition-colors px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-bold border-b border-gray-800"
      >
        <span className="flex items-center gap-2 text-[#ffcc00]">
          <Target className="w-4 h-4" />
          Lihat Result Semasa
        </span>
        {showResult ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
      </button>

      {showResult && (
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Status:</span>
            {state.includes('HIT_TP') && (
              <span className="text-emerald-500 font-bold flex items-center gap-1 text-sm">
                <CheckCircle2 className="w-4 h-4" /> {state.replace('_', ' ')}
              </span>
            )}
            {state === 'HIT_SL' && (
              <span className="text-red-500 font-bold flex items-center gap-1 text-sm">
                <AlertTriangle className="w-4 h-4" /> HIT SL
              </span>
            )}
            {state.includes('FLOATING') && (
              <span className={`font-bold flex items-center gap-1 text-sm ${state.includes('PROFIT') ? 'text-emerald-400' : 'text-red-400'}`}>
                {state.includes('PROFIT') ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />} 
                {state.replace('_', ' ')}
              </span>
            )}
            {state === 'WAITING' && (
              <span className="text-yellow-500 font-bold flex items-center gap-1 text-sm">
                <Clock className="w-4 h-4" /> WAITING ENTRY
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-[#111] border border-gray-800 rounded p-2 text-center">
              <span className="text-gray-500 text-[10px] block uppercase tracking-wider mb-1">Current Pips</span>
              <span className={`font-mono text-lg font-bold ${pips > 0 ? 'text-emerald-400' : pips < 0 ? 'text-red-400' : 'text-gray-300'}`}>
                {pips > 0 ? '+' : ''}{pips.toFixed(1)}
              </span>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded p-2 text-center">
              <span className="text-gray-500 text-[10px] block uppercase tracking-wider mb-1">Current Price</span>
              <span className="font-mono text-lg font-bold text-gray-200">
                {currentPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

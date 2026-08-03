import React, { useState } from 'react';
import { History, TrendingUp, TrendingDown, Target, ShieldAlert, Trash2, Filter } from 'lucide-react';
import { SignalRecord } from '../lib/signalStore';

export const SignalHistoryDashboard = ({ 
  currentPrice,
  signals,
  clearSignals
}: { 
  currentPrice: number;
  signals: SignalRecord[];
  clearSignals: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<string>('ALL');

  if (signals.length === 0) return null;

  const uniqueTypes = Array.from(new Set(signals.map(s => s.type)));
  const filteredSignals = activeTab === 'ALL' ? signals : signals.filter(s => s.type === activeTab);

  const renderFloating = (signal: SignalRecord) => {
    let diff = 0;
    
    if (signal.status === 'ACTIVE') {
      if (!currentPrice) return null;
      diff = signal.direction === 'BUY' ? currentPrice - signal.entryPrice : signal.entryPrice - currentPrice;
    } else if (signal.status === 'TP_HIT') {
      diff = signal.direction === 'BUY' ? signal.tp - signal.entryPrice : signal.entryPrice - signal.tp;
    } else if (signal.status === 'SL_HIT') {
      diff = signal.direction === 'BUY' ? signal.sl - signal.entryPrice : signal.entryPrice - signal.sl;
    }
    
    const pips = diff * 10;
    const isProfit = diff >= 0;
    
    return (
      <div className="flex flex-col items-end">
        <span className={`text-[11px] font-black ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isProfit ? '+' : ''}{pips.toFixed(1)} Pips
        </span>
        {signal.status === 'ACTIVE' && (
          <span className="text-[9px] text-gray-500">Floating Semasa</span>
        )}
        {signal.status !== 'ACTIVE' && (
          <span className="text-[9px] text-gray-500">Final P&amp;L</span>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 border border-gray-800 rounded-xl bg-[#0a0a0a] shadow-xl overflow-hidden">
      <div className="border-b border-gray-800 bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#111] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-black text-white tracking-wide">REKOD SIGNAL AKTIF / LALU</h2>
        </div>
        <button 
          onClick={clearSignals}
          className="text-xs text-gray-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      <div className="px-3 py-2 border-b border-gray-800 bg-[#0f0f0f] flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <Filter className="w-4 h-4 text-gray-500 shrink-0" />
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'ALL' ? 'bg-[#ffcc00] text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          SEMUA
        </button>
        {uniqueTypes.map(type => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === type ? 'bg-[#ffcc00] text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {filteredSignals.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs">
            Tiada rekod signal buat masa ini. Signal akan dijana dan direkodkan secara automatik apabila harga XAUUSD memasuki zon FVG, OB, atau Zon Kebenaran yang aktif.
          </div>
        ) : (
          filteredSignals.map((signal: SignalRecord) => (
            <div 
              key={signal.id} 
              className={`p-3 border-b border-gray-800 flex flex-col gap-2 ${
                signal.status === 'TP_HIT' ? 'bg-emerald-950/20' : 
                signal.status === 'SL_HIT' ? 'bg-rose-950/20' : 'bg-[#0f0f0f]'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 ${
                    signal.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {signal.direction === 'BUY' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {signal.direction}
                  </span>
                  <span className="text-xs font-bold text-white">{signal.type}</span>
                  <span className="text-[10px] text-gray-400">{signal.timeframe}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {renderFloating(signal)}
                  <div>
                    {signal.status === 'ACTIVE' && (
                      <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/20 px-2 py-0.5 rounded animate-pulse inline-block">
                        PENDING
                      </span>
                    )}
                    {signal.status === 'TP_HIT' && (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded inline-block">
                        HIT TP 🎉
                      </span>
                    )}
                    {signal.status === 'SL_HIT' && (
                      <span className="text-[10px] font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded inline-block">
                        HIT SL 💀
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-black/40 p-2 rounded border border-gray-800/50">
                <div>
                  <div className="text-[9px] text-gray-500 font-bold mb-0.5">ENTRY ZONE</div>
                  <div className="font-mono text-xs text-white">{signal.entryRange}</div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold mb-0.5">TARGET (TP)</div>
                  <div className="font-mono text-xs text-[#ffcc00] flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {signal.tp.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-gray-500 font-bold mb-0.5">STOP LOSS (SL)</div>
                  <div className="font-mono text-xs text-rose-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    {signal.sl.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="text-[9px] text-gray-600 flex justify-between">
                <span>Entry Trigger: {signal.entryPrice.toFixed(2)}</span>
                <span>{new Date(signal.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { History, TrendingUp, TrendingDown, Target, ShieldAlert, Trash2, Filter, Trophy, CheckCircle2, XCircle, PieChart, Calendar, Clock } from 'lucide-react';
import { SignalRecord, getSignalWinRate } from '../lib/signalStore';

const isTodayMYT = (timestamp: number) => {
  if (!timestamp) return false;
  const signalDateStr = new Date(timestamp).toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
  const todayDateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
  return signalDateStr === todayDateStr;
};

export const SignalHistoryDashboard = ({ 
  currentPrice,
  signals,
  clearSignals
}: { 
  currentPrice: number;
  signals: SignalRecord[];
  clearSignals: () => void;
}) => {
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('COMPLETED');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'ALL'>('TODAY');
  const [activeTab, setActiveTab] = useState<string>('ALL');

  if (signals.length === 0) return null;

  const uniqueTypes = Array.from(new Set(signals.map(s => s.type)));

  // Filter signals by date filter (TODAY vs ALL)
  const dateFilteredSignals = dateFilter === 'TODAY'
    ? signals.filter(s => s.status === 'ACTIVE' || isTodayMYT(s.timestamp))
    : signals;
  
  // Filter by status first, then by SOP type
  const statusFiltered = statusFilter === 'ALL' 
    ? dateFilteredSignals 
    : statusFilter === 'ACTIVE' 
      ? dateFilteredSignals.filter(s => s.status === 'ACTIVE') 
      : dateFilteredSignals.filter(s => s.status === 'TP_HIT' || s.status === 'SL_HIT');

  const filteredSignals = activeTab === 'ALL' 
    ? statusFiltered 
    : statusFiltered.filter(s => s.type === activeTab);

  // Statistics calculation for selected date scope
  const statsScopeSignals = dateFilter === 'TODAY'
    ? signals.filter(s => isTodayMYT(s.timestamp))
    : signals;

  const wins = statsScopeSignals.filter(s => s.status === 'TP_HIT').length;
  const losses = statsScopeSignals.filter(s => s.status === 'SL_HIT').length;
  const activeCount = signals.filter(s => s.status === 'ACTIVE').length;
  const completedCount = wins + losses;

  const todayCompletedCount = signals.filter(s => (s.status === 'TP_HIT' || s.status === 'SL_HIT') && isTodayMYT(s.timestamp)).length;
  const allCompletedCount = signals.filter(s => s.status === 'TP_HIT' || s.status === 'SL_HIT').length;
  const totalCount = dateFilteredSignals.length;

  const winRate = completedCount > 0 ? (wins / completedCount) * 100 : 0;
  const lossRate = completedCount > 0 ? (losses / completedCount) * 100 : 0;

  // Helper to get win rate per SOP type
  const getSopWinRate = (type: string) => {
    const typeSignals = signals.filter(s => s.type === type);
    const typeWins = typeSignals.filter(s => s.status === 'TP_HIT').length;
    const typeLosses = typeSignals.filter(s => s.status === 'SL_HIT').length;
    const typeCompleted = typeWins + typeLosses;
    if (typeCompleted === 0) return null;
    return {
      rate: ((typeWins / typeCompleted) * 100).toFixed(0),
      wins: typeWins,
      completed: typeCompleted
    };
  };

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
      <div className="border-b border-gray-800 bg-gradient-to-r from-[#111] via-[#1a1a1a] to-[#111] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-black text-white tracking-wide flex items-center gap-2 flex-wrap">
            REKOD SIGNAL AKTIF / LALU
            {completedCount > 0 && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                🎯 Win Rate ({dateFilter === 'TODAY' ? 'Hari Ini' : 'Keseluruhan'}): {winRate.toFixed(1)}%
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* DATE FILTER SWITCHER */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-gray-800">
            <button
              onClick={() => setDateFilter('TODAY')}
              className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wide flex items-center gap-1 transition-all ${
                dateFilter === 'TODAY'
                  ? 'bg-emerald-500 text-black font-extrabold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse inline-block"></span>
              HARI INI
            </button>
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wide transition-all ${
                dateFilter === 'ALL'
                  ? 'bg-yellow-500 text-black font-extrabold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              SEMUA HISTORIKAL
            </button>
          </div>

          <button 
            onClick={clearSignals}
            className="text-xs text-gray-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* STATS SUMMARY BOX */}
      <div className="p-3 bg-[#0d0d0d] border-b border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Win Stat Card */}
        <div className="bg-[#141414] border border-emerald-900/40 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> REKOD MENANG
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {winRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-black text-emerald-400 font-mono">{wins} <span className="text-xs font-normal text-gray-500">Signal</span></span>
            <span className="text-[10px] text-gray-500 font-bold">Hit TP</span>
          </div>
        </div>

        {/* Loss Stat Card */}
        <div className="bg-[#141414] border border-rose-900/40 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> REKOD KALAH
            </span>
            <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
              {lossRate.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-black text-rose-400 font-mono">{losses} <span className="text-xs font-normal text-gray-500">Signal</span></span>
            <span className="text-[10px] text-gray-500 font-bold">Hit SL</span>
          </div>
        </div>

        {/* Win Rate % Highlight */}
        <div className="bg-[#141414] border border-yellow-900/30 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-yellow-400 uppercase flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" /> KADAR MENANG
            </span>
            <span className="text-[9px] text-gray-500 font-mono font-bold">Selesai: {completedCount}</span>
          </div>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-black text-yellow-400 font-mono">{winRate.toFixed(1)}%</span>
            <span className="text-[10px] text-gray-400 font-mono">VS {lossRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Total Completed Signals Stat Card */}
        <div className="bg-[#141414] border border-blue-900/40 rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[10px] font-bold tracking-wider text-blue-400 uppercase flex items-center gap-1">
              <PieChart className="w-3.5 h-3.5 text-blue-400" /> SIGNAL SELESAI
            </span>
            {activeCount > 0 ? (
              <span className="text-[9px] font-bold text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded animate-pulse">
                {activeCount} Active
              </span>
            ) : (
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                100% Selesai
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-black text-white font-mono">{completedCount} <span className="text-xs font-normal text-gray-500">Signal</span></span>
            <span className="text-[10px] text-blue-400 font-bold">{dateFilter === 'TODAY' ? 'Hari Ini' : 'Keseluruhan'}</span>
          </div>
        </div>
      </div>

      {/* Win/Loss Bar Visualizer */}
      {completedCount > 0 && (
        <div className="px-3 py-1.5 bg-[#0a0a0a] border-b border-gray-800/80 flex items-center gap-2">
          <div className="text-[10px] font-bold text-gray-400 shrink-0 w-24">NISBAH W/L:</div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${winRate}%` }}
              title={`Menang: ${winRate.toFixed(1)}%`}
            />
            <div 
              className="bg-rose-500 h-full transition-all duration-500" 
              style={{ width: `${lossRate}%` }}
              title={`Kalah: ${lossRate.toFixed(1)}%`}
            />
          </div>
          <div className="text-[10px] font-mono text-gray-400 shrink-0">
            <span className="text-emerald-400 font-bold">{wins}W ({winRate.toFixed(0)}%)</span> / <span className="text-rose-400 font-bold">{losses}L ({lossRate.toFixed(0)}%)</span>
          </div>
        </div>
      )}

      {/* MAIN STATUS CATEGORY TABS */}
      <div className="bg-[#121212] border-b border-gray-800 p-2 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 w-full">
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-md'
                : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping inline-block" />
            SIGNAL AKTIF
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              statusFilter === 'ACTIVE' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-gray-800 text-gray-400'
            }`}>
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-md'
                : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:text-white hover:bg-gray-800'
            }`}
          >
            <History className="w-3.5 h-3.5 text-emerald-400" />
            REKOD LALU (SELESAI {dateFilter === 'TODAY' ? 'HARI INI' : 'LEPAS'})
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              statusFilter === 'COMPLETED' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-gray-800 text-gray-400'
            }`}>
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('ALL')}
            className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              statusFilter === 'ALL'
                ? 'bg-[#ffcc00] text-black border border-[#ffcc00] shadow-md'
                : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:text-white hover:bg-gray-800'
            }`}
          >
            SEMUA REKOD
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              statusFilter === 'ALL' ? 'bg-black/30 text-black' : 'bg-gray-800 text-gray-400'
            }`}>
              {totalCount}
            </span>
          </button>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-gray-800 bg-[#0f0f0f] flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <Filter className="w-4 h-4 text-gray-500 shrink-0" />
        <span className="text-[10px] text-gray-500 font-bold uppercase shrink-0">SOP:</span>
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors ${
            activeTab === 'ALL' ? 'bg-gray-200 text-black' : 'bg-gray-800/80 text-gray-400 hover:text-white'
          }`}
        >
          SEMUA
        </button>
        {uniqueTypes.map(type => {
          const sopStats = getSopWinRate(type);
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === type ? 'bg-gray-200 text-black' : 'bg-gray-800/80 text-gray-400 hover:text-white'
              }`}
            >
              <span>{type}</span>
              {sopStats && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-black ${
                  activeTab === type ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                }`}>
                  {sopStats.rate}% Win
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        {filteredSignals.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2">
            <p>
              {dateFilter === 'TODAY' && statusFilter === 'COMPLETED'
                ? 'Tiada rekod signal yang selesai (Hit TP/SL) untuk Hari Ini.'
                : dateFilter === 'TODAY' && statusFilter === 'ACTIVE'
                ? 'Tiada signal aktif yang pending untuk Hari Ini.'
                : 'Tiada rekod signal ditemui untuk tapisan ini.'}
            </p>
            {dateFilter === 'TODAY' && allCompletedCount > 0 && (
              <button
                onClick={() => setDateFilter('ALL')}
                className="mt-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 rounded-lg font-bold text-xs hover:bg-yellow-500/30 transition-all flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5 text-yellow-400" />
                Papar Semua Rekod Selesai Historikal ({allCompletedCount})
              </button>
            )}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 ${
                    signal.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {signal.direction === 'BUY' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {signal.direction}
                  </span>
                  <span className="text-xs font-bold text-white">{signal.type}</span>
                  <span className="text-[10px] text-gray-400">{signal.timeframe}</span>
                  <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded shadow-sm">
                    WinRate: {getSignalWinRate(signal)}%
                  </span>
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
              
              <div className="text-[10px] text-gray-400 flex flex-wrap items-center justify-between border-t border-gray-800/60 pt-1.5 mt-0.5 gap-1">
                <span className="text-gray-400 text-[10px]">Trigger: <strong className="text-gray-300 font-mono font-bold">${signal.entryPrice.toFixed(2)}</strong></span>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="flex items-center gap-1 text-gray-300 bg-gray-800/60 px-1.5 py-0.5 rounded">
                    <Calendar className="w-3 h-3 text-yellow-500" />
                    {new Date(signal.timestamp).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 text-gray-300 bg-gray-800/60 px-1.5 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-blue-400" />
                    {new Date(signal.timestamp).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

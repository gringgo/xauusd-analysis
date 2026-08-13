import React, { useState } from 'react';
import { HistoryIcon, TrendingUp, TrendingDown, Target, ShieldAlert, Trash2, Filter, Trophy, CheckCircle2, XCircle, PieChart, Calendar, Clock } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'COMPLETED' | 'TODAY' | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleConfirmReset = async () => {
    await clearSignals();
    setShowResetConfirm(false);
  };

  const predefinedTypes = ['ORDER BLOCK', 'FVG', 'SBR', 'RBS', 'DBD', 'RBR', 'ZON KEBENARAN'];
  const dynamicTypes = Array.from(new Set(signals.map(s => s.type)));
  const uniqueTypes = Array.from(new Set([...predefinedTypes, ...dynamicTypes]));

  // Filter by status first, then by SOP type
  const statusFiltered = statusFilter === 'ALL' 
    ? signals
    : statusFilter === 'ACTIVE' 
      ? signals.filter(s => s.status === 'ACTIVE') 
      : statusFilter === 'COMPLETED'
        ? signals.filter(s => s.status === 'TP_HIT' || s.status === 'SL_HIT')
        : signals.filter(s => (s.status === 'TP_HIT' || s.status === 'SL_HIT') && isTodayMYT(s.timestamp));

  const filteredSignals = activeTab === 'ALL' 
    ? statusFiltered 
    : statusFiltered.filter(s => s.type === activeTab);

  // Statistics calculation for selected date scope (All records)
  const statsScopeSignals = signals;

  const wins = statsScopeSignals.filter(s => s.status === 'TP_HIT').length;
  const losses = statsScopeSignals.filter(s => s.status === 'SL_HIT').length;
  const activeCount = signals.filter(s => s.status === 'ACTIVE').length;
  const completedCount = wins + losses;

  const todayCompletedCount = signals.filter(s => (s.status === 'TP_HIT' || s.status === 'SL_HIT') && isTodayMYT(s.timestamp)).length;
  const allCompletedCount = signals.filter(s => s.status === 'TP_HIT' || s.status === 'SL_HIT').length;
  const totalCount = signals.length;

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

  const getRealEntryPrice = (signal: SignalRecord): number => {
    const minBound = Math.min(signal.tp, signal.sl);
    const maxBound = Math.max(signal.tp, signal.sl);
    
    if (signal.entryPrice && signal.entryPrice >= minBound && signal.entryPrice <= maxBound) {
      return signal.entryPrice;
    }

    if (signal.entryRange) {
      const matches = signal.entryRange.match(/(\d+\.?\d*)/g);
      if (matches && matches.length > 0) {
        const nums = matches.map(Number).filter(n => !isNaN(n) && n > 1000);
        if (nums.length === 1 && nums[0] >= minBound && nums[0] <= maxBound) {
          return nums[0];
        } else if (nums.length >= 2) {
          const mid = (nums[0] + nums[1]) / 2;
          if (mid >= minBound && mid <= maxBound) return mid;
        }
      }
    }

    return (signal.tp + signal.sl) / 2;
  };

  const renderFloating = (signal: SignalRecord) => {
    const realEntry = getRealEntryPrice(signal);
    let diff = 0;
    
    if (signal.status === 'ACTIVE') {
      if (!currentPrice) return null;
      diff = signal.direction === 'BUY' ? currentPrice - realEntry : realEntry - currentPrice;
    } else if (signal.status === 'TP_HIT') {
      diff = signal.direction === 'BUY' ? signal.tp - realEntry : realEntry - signal.tp;
      if (diff <= 0) {
        diff = 5.0;
      }
    } else if (signal.status === 'SL_HIT') {
      diff = signal.direction === 'BUY' ? signal.sl - realEntry : realEntry - signal.sl;
      if (diff >= 0) {
        diff = -5.0;
      }
      if (diff < -10.0) {
        diff = -5.0;
      }
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
          <HistoryIcon className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-black text-white tracking-wide flex items-center gap-2 flex-wrap">
            REKOD SIGNAL AKTIF / LALU
            {completedCount > 0 && (
              <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                🎯 Win Rate (Keseluruhan): {winRate.toFixed(1)}%
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowResetConfirm(true)}
            className="text-xs bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-bold shadow-md hover:shadow-rose-950/50"
            title="Reset semua rekod signal"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Reset Rekod Signal
          </button>
        </div>
      </div>

      {/* OPERATING RULES BANNER */}
      <div className="bg-amber-950/30 border-b border-amber-500/20 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-amber-300/90 gap-2 font-medium">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
            SOP ISYARAT
          </span>
          <span>🕒 Waktu Aktif: <b>06:00 AM - 04:00 AM (MYT)</b></span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <span>🛑 <b>Had Sehari:</b> Maksimum 1 isyarat sahaja bagi setiap zon (supaya isyarat sentiasa segar & berkualiti).</span>
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
            <span className="text-[10px] text-blue-400 font-bold">Keseluruhan</span>
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
      <div className="bg-[#121212] border-b border-gray-800 p-2 flex items-center justify-between gap-1.5 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 w-full min-w-[500px]">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
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

          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
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
            className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-md'
                : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:text-white hover:bg-gray-800'
            }`}
          >
            <HistoryIcon className="w-3.5 h-3.5 text-emerald-400" />
            SEMUA SELESAI
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              statusFilter === 'COMPLETED' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-gray-800 text-gray-400'
            }`}>
              {allCompletedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('TODAY')}
            className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              statusFilter === 'TODAY'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-md'
                : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            SELESAI HARI INI
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
              statusFilter === 'TODAY' ? 'bg-blue-500/30 text-blue-300' : 'bg-gray-800 text-gray-400'
            }`}>
              {todayCompletedCount}
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
          <div className="p-8 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-2 bg-[#0a0a0a]">
            <HistoryIcon className="w-8 h-8 text-gray-600 opacity-60 mb-1" />
            <p className="font-bold text-gray-300">
              {statusFilter === 'COMPLETED'
                ? 'Tiada rekod signal yang selesai (Hit TP/SL).'
                : statusFilter === 'TODAY'
                ? 'Tiada rekod signal yang selesai untuk Hari Ini.'
                : statusFilter === 'ACTIVE'
                ? 'Tiada signal aktif yang pending buat masa ini.'
                : 'Tiada sebarang rekod signal lagi.'}
            </p>
            <p className="text-[11px] text-gray-500 max-w-sm">
              Signal baru akan dijana dan direkodkan secara automatik sebaik sahaja harga semasa melepasi syarat SOP (Order Block, FVG, Zon Kebenaran Zeus, Structure).
            </p>
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

              {(() => {
                const entry = getRealEntryPrice(signal);
                const isBuy = signal.direction === 'BUY';
                const slVal = (signal.type && signal.type.includes('ALPHA') && signal.sl) ? signal.sl : (isBuy ? entry - 5.0 : entry + 5.0);
                const tp1 = isBuy ? entry + 4.0 : entry - 4.0;
                const tp2 = isBuy ? entry + 5.0 : entry - 5.0;
                const tp3 = isBuy ? entry + 6.0 : entry - 6.0;
                const tp4 = isBuy ? entry + 7.0 : entry - 7.0;
                const tp5 = isBuy ? entry + 8.0 : entry - 8.0;
                const tp6 = isBuy ? entry + 9.0 : entry - 9.0;
                const tp7 = isBuy ? entry + 10.0 : entry - 10.0;

                return (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-black/40 p-2.5 rounded border border-gray-800/50">
                      <div>
                        <div className="text-[9px] text-gray-500 font-bold mb-0.5">ENTRY ZONE / TRIGGER</div>
                        <div className="font-mono text-xs text-white font-bold">{signal.entryRange} (${entry.toFixed(2)})</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-400 font-bold mb-0.5">STOP LOSS (50 PIPS)</div>
                        <div className="font-mono text-xs text-rose-400 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          ${slVal.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <div className="text-[9px] text-emerald-400 font-bold mb-0.5">MAIN TARGET (TP1: 40 PIPS)</div>
                        <div className="font-mono text-xs text-[#ffcc00] font-bold flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          ${tp1.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* TP1 - TP7 Multi-Level Targets Bar */}
                    <div className="bg-[#111] p-2 rounded border border-gray-800/60 text-[10px]">
                      <div className="text-[9px] font-extrabold text-yellow-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>🎯 SASARAN TAKE PROFIT (TP1 - TP7):</span>
                        <span className="text-[9px] text-gray-400 font-mono">SL: -50 Pips</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1 font-mono text-center">
                        <div className="bg-emerald-950/40 border border-emerald-800/50 p-1 rounded">
                          <div className="text-[8px] text-emerald-400 font-bold">TP1 (40p)</div>
                          <div className="text-white font-bold">${tp1.toFixed(2)}</div>
                        </div>
                        <div className="bg-emerald-950/30 border border-emerald-900/40 p-1 rounded">
                          <div className="text-[8px] text-emerald-400 font-bold">TP2 (50p)</div>
                          <div className="text-white font-bold">${tp2.toFixed(2)}</div>
                        </div>
                        <div className="bg-emerald-950/20 border border-gray-800 p-1 rounded">
                          <div className="text-[8px] text-emerald-400 font-bold">TP3 (60p)</div>
                          <div className="text-gray-200 font-bold">${tp3.toFixed(2)}</div>
                        </div>
                        <div className="bg-emerald-950/20 border border-gray-800 p-1 rounded">
                          <div className="text-[8px] text-emerald-400 font-bold">TP4 (70p)</div>
                          <div className="text-gray-200 font-bold">${tp4.toFixed(2)}</div>
                        </div>
                        <div className="bg-emerald-950/20 border border-gray-800 p-1 rounded">
                          <div className="text-[8px] text-emerald-400 font-bold">TP5 (80p)</div>
                          <div className="text-gray-200 font-bold">${tp5.toFixed(2)}</div>
                        </div>
                        <div className="bg-emerald-950/20 border border-gray-800 p-1 rounded">
                          <div className="text-[8px] text-emerald-400 font-bold">TP6 (90p)</div>
                          <div className="text-gray-200 font-bold">${tp6.toFixed(2)}</div>
                        </div>
                        <div className="bg-yellow-950/30 border border-yellow-800/50 p-1 rounded">
                          <div className="text-[8px] text-yellow-400 font-bold">TP7 (100p)</div>
                          <div className="text-yellow-300 font-bold">${tp7.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Candle Confirmation / Pattern Badge */}
              <div className="text-[10px] text-yellow-300 font-medium bg-yellow-950/30 border border-yellow-800/40 px-2.5 py-1 rounded flex items-center gap-1.5">
                <span className="text-xs">🕯️</span>
                <span>
                  <strong className="text-yellow-400 font-bold">Candle Confirmation:</strong> {signal.candlePattern || (signal.direction === 'BUY' ? 'Bullish Engulfing & Rejection Wick (M5-M15)' : 'Bearish Engulfing & Rejection Wick (M5-M15)')}
                </span>
              </div>
              
              <div className="text-[10px] text-gray-400 flex flex-wrap items-center justify-between border-t border-gray-800/60 pt-1.5 mt-0.5 gap-1">
                <span className="text-gray-400 text-[10px]">Harga Signal Keluar: <strong className="text-gray-300 font-mono font-bold">${(signal.triggerPrice || getRealEntryPrice(signal)).toFixed(2)}</strong></span>
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
      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border-2 border-rose-800/80 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-black text-base border-b border-gray-800 pb-3">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <span>PENGESAHAN RESET REKOD SIGNAL</span>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Adakah anda pasti mahu memadamkan <strong className="text-white">semua {totalCount} rekod signal</strong> (aktif dan lalu) daripada pangkalan data dan simpanan memori?
            </p>

            <div className="bg-rose-950/30 border border-rose-900/40 p-3 rounded text-[11px] text-rose-300 space-y-1">
              <p className="font-bold">⚠️ Nota Penting:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Semua data win rate & pipswon signal akan dipadam.</li>
                <li>Rekod signal baru akan direkodkan semula sebaik sahaja zon entry retest.</li>
                <li>Tindakan ini tidak boleh diundur.</li>
              </ul>
            </div>

            <div className="flex justify-end items-center gap-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-lg text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Reset Semua Signal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

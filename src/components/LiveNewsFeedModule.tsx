import React, { useState } from 'react';
import { 
  Flame, 
  RefreshCw, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Info,
  ExternalLink
} from 'lucide-react';
import { toZonedTime } from 'date-fns-tz';

export interface LiveNewsFeedModuleProps {
  news?: any[];
  newsHistoryList?: any[];
  onOpenNewsModal?: () => void;
  onTriggerSync?: () => Promise<void>;
}

export const LiveNewsFeedModule: React.FC<LiveNewsFeedModuleProps> = ({
  news = [],
  newsHistoryList = [],
  onOpenNewsModal,
  onTriggerSync
}) => {
  const [filterImpact, setFilterImpact] = useState<'HIGH' | 'ALL' | 'MED'>('HIGH');
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      if (onTriggerSync) {
        await onTriggerSync();
      } else {
        await fetch('/api/auto-sync-news', { method: 'POST' });
      }
    } catch (e) {
      console.error('Error syncing news:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  // Combine news items from props and history list to ensure live feed is full & accurate
  const combinedNews = React.useMemo(() => {
    const itemsMap = new Map();

    // First add live items from props
    (news || []).forEach((item: any, idx: number) => {
      const imp = (item.impact || 'HIGH').toUpperCase();
      if (!imp.includes('HIGH') && filterImpact === 'HIGH') return;

      const key = `${item.event || item.title}_${item.time || item.date}`;
      itemsMap.set(key, {
        id: item.id || `live_${idx}`,
        time: item.time || '-',
        dateText: item.dateText || item.date || '',
        dateISO: item.dateISO || '',
        event: item.event || item.title || 'USD News Event',
        impact: imp,
        forecast: item.forecast || '-',
        previous: item.previous || '-',
        actual: item.actual || '-',
        action: item.action || (item.prediction === 'BULLISH' ? 'BUY' : item.prediction === 'BEARISH' ? 'SELL' : 'NEUTRAL'),
        suggestion: item.suggestion || (item.prediction ? `${item.prediction === 'BULLISH' ? 'BUY' : 'SELL'} XAUUSD` : 'BUY XAUUSD'),
        estimatedPips: item.estimatedPips || `~${item.pipsWon || 150} PIPS`,
        reason: item.reason || item.analysis || '',
        status: item.status || 'PENDING'
      });
    });

    // Add items from newsHistoryList if not already added
    (newsHistoryList || []).slice(0, 20).forEach((item: any) => {
      const imp = (item.impact || 'HIGH').toUpperCase();
      if (!imp.includes('HIGH') && filterImpact === 'HIGH') return;

      const parts = (item.date || '').split('|');
      const displayTime = parts.length > 1 ? parts[1].replace('(MYT)', '').trim() : item.date;
      const dateText = parts.length > 0 ? parts[0].trim() : '';
      const key = `${item.event}_${displayTime}`;

      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          id: item.id,
          time: displayTime,
          dateText: dateText,
          dateISO: item.createdAt || '',
          event: item.event,
          impact: imp,
          forecast: item.forecast || '-',
          previous: item.previous || '-',
          actual: item.actual || '-',
          action: item.prediction === 'BULLISH' ? 'BUY' : item.prediction === 'BEARISH' ? 'SELL' : 'NEUTRAL',
          suggestion: item.prediction === 'BULLISH' ? 'BUY XAUUSD' : item.prediction === 'BEARISH' ? 'SELL XAUUSD' : 'NEUTRAL',
          estimatedPips: `~${item.pipsWon || 150} PIPS`,
          reason: item.analysis || item.preNewsAnalysis || '',
          status: item.status || 'PENDING'
        });
      } else {
        // Update actual data if available in history
        const existing = itemsMap.get(key);
        if (item.actual && item.actual !== '-') {
          existing.actual = item.actual;
          existing.status = item.status || existing.status;
          if (item.analysis) existing.reason = item.analysis;
        }
      }
    });

    return Array.from(itemsMap.values());
  }, [news, newsHistoryList, filterImpact]);

  // Filter based on impact tab
  const filteredNews = combinedNews.filter((item: any) => {
    if (filterImpact === 'HIGH') return item.impact.includes('HIGH');
    if (filterImpact === 'MED') return item.impact.includes('MED');
    return true;
  });

  // Calculate countdown minutes left
  const myt = toZonedTime(new Date(), 'Asia/Kuala_Lumpur');
  const curH = myt.getHours();
  const curM = myt.getMinutes();

  const getMinsLeft = (timeStr: string) => {
    if (!timeStr || timeStr === '-') return null;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    
    const newsTotalMinutes = h * 60 + m;
    const currentTotalMinutes = curH * 60 + curM;
    return newsTotalMinutes - currentTotalMinutes;
  };

  return (
    <div id="sec-news-feed" className="border border-[#b49a45]/30 rounded-xl bg-[#0a0a0a] shadow-[0_0_20px_rgba(0,0,0,0.6)] flex flex-col w-full overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1e293b] to-[#0f172a] px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#b49a45]/30">
        <div className="flex items-center gap-2.5">
          <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-5 h-auto rounded-sm shadow-sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-xs sm:text-sm tracking-wider uppercase">
                LIVE NEWS FEED (USD)
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> LIVE MYT
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Kalendar & Impak Ekonomi Berita USD Impak Tinggi</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Impact Filter Tabs */}
          <div className="flex items-center bg-black/60 border border-gray-800 rounded-lg p-0.5 text-[10px] font-bold">
            <button
              onClick={() => setFilterImpact('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all ${filterImpact === 'ALL' ? 'bg-[#b49a45] text-black font-black' : 'text-gray-400 hover:text-white'}`}
            >
              SEMUA ({combinedNews.length})
            </button>
            <button
              onClick={() => setFilterImpact('HIGH')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${filterImpact === 'HIGH' ? 'bg-red-600 text-white font-black' : 'text-gray-400 hover:text-red-400'}`}
            >
              🔴 HIGH
            </button>
            <button
              onClick={() => setFilterImpact('MED')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${filterImpact === 'MED' ? 'bg-amber-600 text-white font-black' : 'text-gray-400 hover:text-amber-400'}`}
            >
              🟠 MED
            </button>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-200 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-gray-700 transition-all shadow"
            title="Kemaskini & Sinkronkan Kalendar News AI"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isSyncing ? 'SINKRON...' : 'SYNC AI'}</span>
          </button>

          {/* Full History Modal Trigger */}
          {onOpenNewsModal && (
            <button 
              onClick={onOpenNewsModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 border border-red-500/40"
            >
              <Flame className="w-3.5 h-3.5 text-[#ffcc00]" />
              <span>HISTORY NEWS</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Feed Container */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-xs text-left text-gray-200 min-w-[850px]">
          <thead className="text-gray-400 border-b border-gray-800 bg-black/80 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-3.5 py-2.5 text-center w-36">DATE & TIME</th>
              <th className="px-4 py-2.5">PERISTIWA / NEWS EVENT</th>
              <th className="px-2 py-2.5 text-center w-16">FCST</th>
              <th className="px-2 py-2.5 text-center w-16">PREV</th>
              <th className="px-2.5 py-2.5 text-center w-20">ACTUAL</th>
              <th className="px-3 py-2.5 text-center">CADANGAN AI</th>
              <th className="px-3 py-2.5 text-center w-28">EST. PIPS</th>
              <th className="px-2.5 py-2.5 text-center w-20">IMPACT</th>
              <th className="px-3.5 py-2.5 text-center w-32">STATUS / COUNTDOWN</th>
              <th className="px-2 py-2.5 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filteredNews.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-400 italic">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Info className="w-6 h-6 text-gray-500" />
                    <span>Tiada berita {filterImpact !== 'ALL' ? filterImpact : ''} USD dikesan buat masa ini.</span>
                    <button
                      onClick={handleSync}
                      className="mt-2 text-xs text-blue-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <RefreshCw className="w-3 h-3" /> Klik untuk Sync Kalendar News AI
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredNews.map((item: any, idx: number) => {
                const minsLeft = getMinsLeft(item.time);
                const isExpanded = expandedId === item.id;
                const isActualReady = item.actual && item.actual !== '-';

                return (
                  <React.Fragment key={item.id || idx}>
                    <tr 
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`cursor-pointer hover:bg-white/[0.04] transition-colors ${
                        isExpanded ? 'bg-white/[0.06]' : ''
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="px-3.5 py-3 text-center">
                        {item.dateText && (
                          <div className="text-[10px] text-gray-400 font-bold whitespace-nowrap mb-0.5">
                            {item.dateText}
                          </div>
                        )}
                        <div className="font-mono font-black text-white text-xs flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          {item.time}
                        </div>
                      </td>

                      {/* Event Name */}
                      <td className="px-4 py-3 font-bold text-gray-100">
                        <div className="flex items-center gap-2">
                          <span>{item.event}</span>
                        </div>
                      </td>

                      {/* Forecast */}
                      <td className="px-2 py-3 text-center font-mono text-gray-400 text-xs">
                        {item.forecast}
                      </td>

                      {/* Previous */}
                      <td className="px-2 py-3 text-center font-mono text-gray-400 text-xs">
                        {item.previous}
                      </td>

                      {/* Actual Data */}
                      <td className="px-2.5 py-3 text-center font-mono font-black text-xs">
                        {isActualReady ? (
                          <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded shadow-sm">
                            {item.actual}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>

                      {/* AI Signal Recommendation */}
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded text-[11px] font-black tracking-wide shadow-sm inline-flex items-center gap-1 ${
                          item.action === 'BUY' 
                            ? 'text-emerald-300 bg-emerald-950/90 border border-emerald-700/70' 
                            : item.action === 'SELL' 
                            ? 'text-rose-300 bg-rose-950/90 border border-rose-700/70' 
                            : 'text-amber-300 bg-amber-950/90 border border-amber-700/70'
                        }`}>
                          {item.action === 'BUY' && <TrendingUp className="w-3 h-3" />}
                          {item.action === 'SELL' && <TrendingDown className="w-3 h-3" />}
                          {item.suggestion || `${item.action} XAUUSD`}
                        </span>
                      </td>

                      {/* Est Pips */}
                      <td className="px-3 py-3 text-center font-mono text-[#ffcc00] font-black text-xs">
                        ⚡ {item.estimatedPips}
                      </td>

                      {/* Impact */}
                      <td className="px-2.5 py-3 text-center font-black text-[10px]">
                        {item.impact.includes('HIGH') ? (
                          <span className="text-red-400 bg-red-950/60 border border-red-800/60 px-1.5 py-0.5 rounded">
                            🔴 HIGH
                          </span>
                        ) : (
                          <span className="text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded">
                            🟠 MED
                          </span>
                        )}
                      </td>

                      {/* Status / Countdown */}
                      <td className="px-3.5 py-3 text-center">
                        {item.status === 'BETUL' ? (
                          <span className="text-emerald-400 font-bold text-[11px] bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> BETUL
                          </span>
                        ) : item.status === 'SALAH' ? (
                          <span className="text-rose-400 font-bold text-[11px] bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-400" /> SALAH
                          </span>
                        ) : minsLeft === null ? (
                          <span className="text-gray-400 text-[11px] bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">
                            PENDING
                          </span>
                        ) : minsLeft < -15 ? (
                          <span className="text-gray-400 font-medium text-[11px] bg-gray-900/80 border border-gray-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-gray-500" /> Selesai
                          </span>
                        ) : minsLeft >= -15 && minsLeft <= 15 ? (
                          <span className="text-red-400 font-black text-[11px] bg-red-950 border border-red-800 px-2.5 py-0.5 rounded animate-pulse inline-flex items-center gap-1 shadow">
                            🔥 LIVE
                          </span>
                        ) : (
                          <span className="font-mono font-extrabold text-[11px] text-[#ffcc00] bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded inline-flex items-center gap-1 shadow-sm">
                            ⏳ {Math.floor(minsLeft / 60) > 0 ? `${Math.floor(minsLeft / 60)}j ` : ''}{minsLeft % 60}m
                          </span>
                        )}
                      </td>

                      {/* Expand Icon */}
                      <td className="px-2 py-3 text-center text-gray-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-blue-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 hover:text-white" />
                        )}
                      </td>
                    </tr>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <tr className="bg-blue-950/20 border-b border-gray-800">
                        <td colSpan={10} className="px-5 py-3.5">
                          <div className="flex flex-col gap-2 text-xs">
                            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                              <div className="flex items-center gap-2 font-bold text-blue-300">
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                                <span>Analisis & Pelan Dagangan AI: {item.event}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono">
                                Status: {item.status} | Impak: {item.impact}
                              </span>
                            </div>

                            <p className="text-gray-300 leading-relaxed font-sans">
                              {item.reason || "Tiada nota analisis tambahan tersedia untuk berita ini."}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                              <div>
                                Forecast: <span className="text-white font-mono">{item.forecast}</span> | Previous: <span className="text-white font-mono">{item.previous}</span> | Actual: <span className="text-emerald-400 font-mono font-bold">{item.actual}</span>
                              </div>
                              {onOpenNewsModal && (
                                <button
                                  onClick={onOpenNewsModal}
                                  className="text-blue-400 hover:text-blue-300 underline font-bold flex items-center gap-1"
                                >
                                  Lihat Rekod Penuh <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

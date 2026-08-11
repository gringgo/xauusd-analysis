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

const isWeekendNews = (dateStr: string) => {
  if (!dateStr) return false;
  const dLower = dateStr.toLowerCase();
  if (dLower.includes('sabtu') || dLower.includes('saturday') || dLower.includes('ahad') || dLower.includes('sunday') || dLower.includes('01 ogos') || dLower.includes('1 ogos') || dLower.includes('8 ogos') || dLower.includes('08 ogos')) {
    return true;
  }
  return false;
};

const ensureEnglishNewsTitle = (title: string): string => {
  if (!title) return title;
  let res = title;
  res = res.replace(/Perubahan Pekerjaan Bukan Ladang/gi, "Non-Farm Employment Change (NFP)");
  res = res.replace(/Kadar Pengangguran/gi, "Unemployment Rate");
  res = res.replace(/Purata Pendapatan Setiap Jam/gi, "Average Hourly Earnings");
  res = res.replace(/KDNK Tahunan/gi, "Annual GDP");
  res = res.replace(/Anggaran Kedua/gi, "Second Estimate");
  res = res.replace(/Indeks Harga PCE Teras/gi, "Core PCE Price Index");
  res = res.replace(/Indeks Harga Pengguna Teras/gi, "Core CPI");
  res = res.replace(/Indeks Harga Pengguna/gi, "Consumer Price Index (CPI)");
  res = res.replace(/Indeks Harga Pengeluar/gi, "Producer Price Index (PPI)");
  res = res.replace(/Jualan Runcit/gi, "Retail Sales");
  res = res.replace(/Minit Mesyuarat FOMC/gi, "FOMC Meeting Minutes");
  res = res.replace(/Minit Mesyuarat/gi, "Meeting Minutes");
  res = res.replace(/Kenyataan FOMC/gi, "FOMC Statement");
  res = res.replace(/Tuntutan Pengangguran/gi, "Unemployment Claims");
  res = res.replace(/Kepercayaan Pengguna/gi, "Consumer Confidence");
  return res;
};

const ensureEnglishNewsDate = (dateStr: string): string => {
  if (!dateStr) return dateStr;
  let res = dateStr;
  res = res.replace(/\bIsnin\b/gi, "Monday")
           .replace(/\bSelasa\b/gi, "Tuesday")
           .replace(/\bRabu\b/gi, "Wednesday")
           .replace(/\bKhamis\b/gi, "Thursday")
           .replace(/\bJumaat\b/gi, "Friday")
           .replace(/\bSabtu\b/gi, "Saturday")
           .replace(/\bAhad\b/gi, "Sunday");

  res = res.replace(/\bJanuari\b/gi, "Jan")
           .replace(/\bFebruari\b/gi, "Feb")
           .replace(/\bMac\b/gi, "Mar")
           .replace(/\bApril\b/gi, "Apr")
           .replace(/\bMei\b/gi, "May")
           .replace(/\bJuni\b/gi, "Jun")
           .replace(/\bJulai\b|\bJuai\b/gi, "Jul")
           .replace(/\bOgos\b|\bOgo\b/gi, "Aug")
           .replace(/\bSeptember\b/gi, "Sep")
           .replace(/\bOktober\b|\bOkt\b/gi, "Oct")
           .replace(/\bNovember\b|\bNov\b/gi, "Nov")
           .replace(/\bDisember\b|\bDis\b/gi, "Dec");

  res = res.replace(/Sepanjang Hari/gi, "All Day");
  return res;
};

function parseDateParts(dateStr: string): { day: number; month: number; year: number } | null {
  if (!dateStr) return null;
  const str = dateStr.trim();

  // 1. Try ISO YYYY-MM-DD
  const isoMatch = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      month: parseInt(isoMatch[2], 10),
      day: parseInt(isoMatch[3], 10)
    };
  }

  // 2. Try MM-DD-YYYY or MM/DD/YYYY
  const mmddyyyyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (mmddyyyyMatch) {
    return {
      month: parseInt(mmddyyyyMatch[1], 10),
      day: parseInt(mmddyyyyMatch[2], 10),
      year: parseInt(mmddyyyyMatch[3], 10)
    };
  }

  // 3. Try "12 Aug 2026" or "Wednesday, 12 Aug 2026" or "12 Ogos 2026"
  const monthMap: Record<string, number> = {
    jan: 1, januari: 1, feb: 2, februari: 2, mar: 3, mac: 3,
    apr: 4, april: 4, may: 5, mei: 5, jun: 6, june: 6,
    jul: 7, julai: 7, juai: 7, aug: 8, ogos: 8, ogo: 8,
    sep: 9, september: 9, oct: 10, okt: 10, oktober: 10,
    nov: 11, november: 11, dec: 12, dis: 12, disember: 12
  };

  const lower = str.toLowerCase();
  let foundMonth: number | null = null;
  Object.keys(monthMap).forEach(m => {
    if (lower.includes(m)) foundMonth = monthMap[m];
  });

  const dayMatch = str.match(/\b(\d{1,2})\b/);
  const day = dayMatch ? parseInt(dayMatch[1], 10) : 0;

  const yearMatch = str.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

  if (foundMonth && day) {
    return { day, month: foundMonth, year };
  }

  return null;
}

function normalizeEventTitle(eventStr: string): string {
  let e = (eventStr || '').toLowerCase().trim();
  e = e.replace(/^usd\s*-\s*/g, '').replace(/\(usd\)/g, '');

  if (e.includes('non-farm') || e.includes('nonfarm') || e.includes('nfp') || e.includes('pekerjaan bukan ladang')) {
    return 'nfp';
  }
  if (e.includes('cpi') || e.includes('consumer price') || e.includes('indeks harga pengguna')) {
    if (e.includes('core') || e.includes('teras')) return 'core_cpi';
    return 'cpi';
  }
  if (e.includes('ppi') || e.includes('producer price')) {
    if (e.includes('core') || e.includes('teras')) return 'core_ppi';
    return 'ppi';
  }
  if (e.includes('pce') || e.includes('personal consumption')) {
    if (e.includes('core') || e.includes('teras')) return 'core_pce';
    return 'pce';
  }
  if (e.includes('fomc') || e.includes('federal funds') || e.includes('fed interest')) {
    return 'fomc';
  }
  if (e.includes('retail') || e.includes('jualan runcit')) {
    return 'retail_sales';
  }
  if (e.includes('unemployment') || e.includes('pengangguran')) {
    return 'unemployment';
  }
  if (e.includes('gdp') || e.includes('kdnk')) {
    return 'gdp';
  }

  return e.replace(/[^a-z0-9]/g, '');
}

const normalizeNewsKey = (eventStr: string, dateStr: string): string => {
  const normEvent = normalizeEventTitle(eventStr);
  const parts = parseDateParts(dateStr);
  if (parts) {
    return `${normEvent}_${parts.year}_${parts.month}_${parts.day}`;
  }
  return `${normEvent}_${dateStr.replace(/[^a-z0-9]/gi, '')}`;
};

export const LiveNewsFeedModule: React.FC<LiveNewsFeedModuleProps> = ({
  news = [],
  newsHistoryList = [],
  onOpenNewsModal,
  onTriggerSync
}) => {
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

  // Combine news items from props and history list to ensure live feed is full & accurate without duplicates
  const combinedNews = React.useMemo(() => {
    const itemsMap = new Map();

    // First add live items from props
    (news || []).forEach((item: any, idx: number) => {
      const imp = (item.impact || 'HIGH').toUpperCase();
      if (!imp.includes('HIGH')) return; // Strictly ignore non-HIGH impact
      if (isWeekendNews(item.dateText || item.date || '')) return;

      const dateStr = item.dateText || item.date || item.dateISO || '';
      const key = normalizeNewsKey(item.event || item.title || '', dateStr);
      itemsMap.set(key, {
        id: item.id || `live_${idx}`,
        time: item.time || '-',
        dateText: item.dateText || item.date || '',
        dateISO: item.dateISO || item.date || '',
        event: item.event || item.title || 'USD News Event',
        impact: 'HIGH',
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
    (newsHistoryList || []).slice(0, 30).forEach((item: any) => {
      const imp = (item.impact || 'HIGH').toUpperCase();
      if (!imp.includes('HIGH')) return; // Strictly ignore non-HIGH impact
      if (isWeekendNews(item.date || '')) return;

      const parts = (item.date || '').split('|');
      const displayTime = parts.length > 1 ? parts[1].replace('(MYT)', '').trim() : item.date;
      const dateText = parts.length > 0 ? parts[0].trim() : '';
      const key = normalizeNewsKey(item.event || '', item.date || '');

      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          id: item.id,
          time: displayTime,
          dateText: dateText,
          dateISO: item.createdAt || item.date || '',
          event: item.event,
          impact: 'HIGH',
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
  }, [news, newsHistoryList]);

  const filteredNews = combinedNews;

  // Calculate countdown minutes left taking full DATE & TIME into account
  const getEventMinsLeft = (item: any) => {
    const timeStr = item.time || '';
    const dateText = item.dateText || item.date || '';
    const dateISO = item.dateISO || '';

    let eventDate: Date | null = null;

    if (dateISO && dateISO.includes('T')) {
      const d = new Date(dateISO);
      if (!isNaN(d.getTime())) eventDate = d;
    }

    if (!eventDate) {
      const parts = parseDateParts(dateText);
      if (parts) {
        let hour = 12;
        let min = 0;
        if (timeStr && timeStr !== '-') {
          const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          if (timeMatch) {
            hour = parseInt(timeMatch[1], 10);
            min = parseInt(timeMatch[2], 10);
            const ampm = (timeMatch[3] || '').toUpperCase();
            if (ampm === 'PM' && hour < 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
          }
        }
        eventDate = new Date(parts.year, parts.month - 1, parts.day, hour, min, 0);
      }
    }

    if (!eventDate) return null;

    const now = new Date();
    const diffMs = eventDate.getTime() - now.getTime();
    return Math.floor(diffMs / 60000);
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
          {/* Impact Filter Badge */}
          <div className="flex items-center bg-red-950/80 border border-red-800/80 rounded-lg px-2.5 py-1 text-[10px] font-black text-red-400 gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>🔴 HIGH IMPACT ONLY ({combinedNews.length})</span>
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
                    <span>Tiada berita High Impact USD dikesan buat masa ini.</span>
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
                const minsLeft = getEventMinsLeft(item);
                const isExpanded = expandedId === item.id;
                const isActualReady = item.actual && item.actual !== '-';

                const renderCountdown = () => {
                  if (item.status === 'BETUL') {
                    return (
                      <span className="text-emerald-400 font-bold text-[11px] bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> BETUL
                      </span>
                    );
                  }
                  if (item.status === 'SALAH') {
                    return (
                      <span className="text-rose-400 font-bold text-[11px] bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> SALAH
                      </span>
                    );
                  }
                  if (minsLeft === null) {
                    return (
                      <span className="text-gray-400 text-[11px] bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">
                        PENDING
                      </span>
                    );
                  }
                  if (minsLeft < -15) {
                    return (
                      <span className="text-gray-400 font-medium text-[11px] bg-gray-900/80 border border-gray-800 px-2 py-0.5 rounded inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-gray-500" /> Selesai
                      </span>
                    );
                  }
                  if (minsLeft >= -15 && minsLeft <= 15) {
                    return (
                      <span className="text-red-400 font-black text-[11px] bg-red-950 border border-red-800 px-2.5 py-0.5 rounded animate-pulse inline-flex items-center gap-1 shadow">
                        🔥 LIVE
                      </span>
                    );
                  }

                  const days = Math.floor(minsLeft / 1440);
                  const hours = Math.floor((minsLeft % 1440) / 60);
                  const mins = minsLeft % 60;
                  let countdownStr = '';
                  if (days > 0) {
                    countdownStr = `${days}d ${hours}h`;
                  } else if (hours > 0) {
                    countdownStr = `${hours}j ${mins}m`;
                  } else {
                    countdownStr = `${mins}m`;
                  }

                  return (
                    <span className="font-mono font-extrabold text-[11px] text-[#ffcc00] bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded inline-flex items-center gap-1 shadow-sm">
                      ⏳ {countdownStr}
                    </span>
                  );
                };

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
                            {ensureEnglishNewsDate(item.dateText)}
                          </div>
                        )}
                        <div className="font-mono font-black text-white text-xs flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          {ensureEnglishNewsDate(item.time)}
                        </div>
                      </td>

                      {/* Event Name */}
                      <td className="px-4 py-3 font-bold text-gray-100">
                        <div className="flex items-center gap-2">
                          <span>{ensureEnglishNewsTitle(item.event)}</span>
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
                        {renderCountdown()}
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

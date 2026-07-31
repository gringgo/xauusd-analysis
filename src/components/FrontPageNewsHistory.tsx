import React, { useState } from 'react';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  RefreshCw,
  CalendarDays,
  Target,
  ArrowRight
} from 'lucide-react';
import { NewsItem } from './HighImpactNewsModal';
import { isSameWeek } from 'date-fns';
import { format, toZonedTime } from 'date-fns-tz';

interface FrontPageNewsHistoryProps {
  newsList: NewsItem[];
  onOpenModal: () => void;
  onAutoSyncNews?: () => Promise<void>;
}

export const FrontPageNewsHistory: React.FC<FrontPageNewsHistoryProps> = ({
  newsList,
  onOpenModal,
  onAutoSyncNews
}) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED'>('UPCOMING');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [checkingId, setCheckingId] = useState<number | null>(null);

  const parseMalayDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    try {
      const cleaned = dateStr.replace(/\(MYT\)/g, '').trim();
      const parts = cleaned.split('|');
      if (parts.length < 2) {
        const ms = new Date(dateStr).getTime();
        return isNaN(ms) ? 0 : ms;
      }
      
      let [datePart, timePart] = parts;
      datePart = datePart.trim();
      // Remove any weekday prefix like "Rabu," or "Khamis, "
      datePart = datePart.replace(/^[a-zA-Z]+,\s*/, '');
      timePart = timePart.trim();

      const months: Record<string, string> = {
        'Januari': 'Jan', 'Februari': 'Feb', 'Mac': 'Mar', 'Mei': 'May',
        'Julai': 'Jul', 'Ogos': 'Aug', 'Ogo': 'Aug', 'Oktober': 'Oct', 'Okt': 'Oct',
        'Disember': 'Dec', 'Dis': 'Dec'
      };

      let englishDatePart = datePart;
      for (const [my, en] of Object.entries(months)) {
        if (datePart.includes(my)) {
          englishDatePart = datePart.replace(my, en);
          break;
        }
      }

      const finalDateStr = `${englishDatePart} ${timePart} GMT+0800`;
      const ms = new Date(finalDateStr).getTime();
      return isNaN(ms) ? 0 : ms;
    } catch (e) {
      return 0;
    }
  };

  // Filter by category, today only, and exclude LOW impact
  const categoryFiltered = newsList.filter(n => {
    const imp = (n.impact || 'HIGH').toUpperCase();
    if (!imp.includes('HIGH') && !imp.includes('MED')) return false;
    if (selectedCategory !== 'ALL' && n.category !== selectedCategory) return false;
    
    return true;
  });

  const now = Date.now();
  const upcomingNews = categoryFiltered
    .filter(n => n.status === 'PENDING')
    .sort((a, b) => {
      const diffA = Math.abs(parseMalayDate(a.date) - now);
      const diffB = Math.abs(parseMalayDate(b.date) - now);
      return diffA - diffB;
    });
    
  const completedNews = categoryFiltered
    .filter(n => n.status === 'BETUL' || n.status === 'SALAH')
    .sort((a, b) => parseMalayDate(b.date) - parseMalayDate(a.date)); // descending for completed

  // Statistics (based on this week's completed news)
  const allCompleted = categoryFiltered.filter(n => n.status === 'BETUL' || n.status === 'SALAH');
  const correctCount = allCompleted.filter(n => n.status === 'BETUL').length;
  const wrongCount = allCompleted.filter(n => n.status === 'SALAH').length;
  const winRate = allCompleted.length > 0 ? ((correctCount / allCompleted.length) * 100).toFixed(0) : '0';
  const totalPips = allCompleted.reduce((acc, curr) => acc + (curr.pipsWon || 0), 0);

  const handleSync = async () => {
    if (!onAutoSyncNews) return;
    setIsSyncing(true);
    try {
      await onAutoSyncNews();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'NFP':
        return <span className="text-red-400 font-black flex items-center gap-1 text-[11px]"><Flame className="w-3.5 h-3.5" /> NFP</span>;
      case 'FOMC':
        return <span className="text-purple-400 font-black flex items-center gap-1 text-[11px]">🏛️ FOMC</span>;
      case 'CPI':
        return <span className="text-amber-400 font-black flex items-center gap-1 text-[11px]">📈 CPI</span>;
      case 'PPI':
        return <span className="text-blue-400 font-black flex items-center gap-1 text-[11px]">📊 PPI</span>;
      case 'RETAIL_SALES':
        return <span className="text-emerald-400 font-black flex items-center gap-1 text-[11px]">🛍️ RETAIL</span>;
      default:
        return <span className="text-gray-400 font-black flex items-center gap-1 text-[11px]">NEWS</span>;
    }
  };

  const currentDisplayList = activeTab === 'UPCOMING' ? upcomingNews : completedNews;

  return (
    <div className="w-full border-2 border-[#b49a45]/60 rounded-xl bg-[#0a0a0a] shadow-[0_0_25px_rgba(180,154,69,0.15)] overflow-hidden my-4 flex flex-col">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111] via-[#1a180f] to-[#111] border-b border-[#b49a45]/40 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-red-900 to-red-950 rounded-xl border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] shrink-0">
            <Flame className="w-6 h-6 text-[#ffcc00] animate-pulse" />
          </div>
          <div>
            <h2 className="text-[#ffcc00] font-black text-lg sm:text-xl tracking-wide flex items-center gap-2">
              JADUAL & ANALISIS NEWS XAUUSD
              <span className="bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
                LIVE
              </span>
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm mt-0.5 font-medium">
              Pantau berita berimpak tinggi, ramalan pergerakan AI, dan hasil keputusan (NFP, FOMC, CPI).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {onAutoSyncNews && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex-1 md:flex-none bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/50 text-purple-200 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow"
            >
              <RefreshCw className={`w-4 h-4 text-[#ffcc00] ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Menjana AI...' : 'Auto-Sync AI'}
            </button>
          )}

          <button
            onClick={onOpenModal}
            className="flex-1 md:flex-none bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg border border-gray-600 flex items-center justify-center gap-2 transition-all shadow"
          >
            <Plus className="w-4 h-4 text-[#ffcc00]" />
            Tambah
          </button>
        </div>
      </div>

      {/* Tabs & Quick Stats Bar */}
      <div className="bg-[#0f0f0f] border-b border-gray-800 flex flex-col md:flex-row items-center justify-between px-2 sm:px-4 py-2 gap-3">
        {/* Main Tabs */}
        <div className="flex bg-black/60 p-1 rounded-xl border border-gray-800 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('UPCOMING')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-black text-xs sm:text-sm transition-all ${
              activeTab === 'UPCOMING'
                ? 'bg-[#ffcc00] text-black shadow-lg shadow-[#ffcc00]/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            MENUNGGU ({newsList.filter(n => n.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-black text-xs sm:text-sm transition-all ${
              activeTab === 'COMPLETED'
                ? 'bg-blue-900 text-blue-100 border-blue-700 shadow-lg shadow-blue-900/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            SELESAI ({completedNews.length})
          </button>
        </div>

        {/* Global Stats Snapshot */}
        <div className="flex items-center gap-3 sm:gap-6 bg-black/40 px-4 py-2 rounded-xl border border-gray-800 w-full md:w-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <Target className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-gray-500 text-[10px] font-bold block uppercase leading-none">Win Rate AI</span>
              <span className="text-emerald-400 font-black text-sm leading-none">{winRate}%</span>
            </div>
          </div>
          <div className="w-px h-6 bg-gray-800 shrink-0"></div>
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 text-[#ffcc00]" />
            <div>
              <span className="text-gray-500 text-[10px] font-bold block uppercase leading-none">Pips Dimenangi</span>
              <span className={`font-black text-sm leading-none ${totalPips >= 0 ? 'text-[#ffcc00]' : 'text-red-400'}`}>
                {totalPips >= 0 ? `+${totalPips}` : totalPips}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-[#121212] border-b border-gray-800 px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-gray-500 font-bold text-[10px] uppercase tracking-wider mr-2 shrink-0">Tapis:</span>
        {['ALL', 'NFP', 'FOMC', 'CPI', 'PPI', 'RETAIL_SALES'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-gray-700 text-white shadow-md border border-gray-600' 
                : 'bg-black/60 text-gray-400 hover:text-white border border-gray-800 hover:bg-gray-800'
            }`}
          >
            {cat === 'ALL' ? 'Semua' : cat}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-4 bg-[#0a0a0a] min-h-[300px] max-h-[600px] overflow-y-auto space-y-3">
        {currentDisplayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-black/30">
            <Clock className="w-10 h-10 text-gray-700 mb-3" />
            <h3 className="text-gray-400 font-bold text-sm sm:text-base mb-1">
              Tiada Berita {activeTab === 'UPCOMING' ? 'Menunggu' : 'Selesai'}
            </h3>
            <p className="text-gray-500 text-xs max-w-xs">
              {activeTab === 'UPCOMING' 
                ? 'Tiada jadual news berimpak tinggi dalam senarai. Klik "Auto-Sync AI" untuk cari news terkini.' 
                : 'Belum ada news yang telah disemak keputusannya.'}
            </p>
          </div>
        ) : (
          currentDisplayList.map((item) => {
            const isExpanded = expandedId === item.id;
            const isUpcoming = activeTab === 'UPCOMING';

            return (
              <div 
                key={item.id} 
                className={`rounded-xl border transition-all ${
                  isExpanded ? 'border-[#b49a45]/60 bg-[#14120a] shadow-lg shadow-[#ffcc00]/5' : 'border-gray-800 bg-[#111] hover:border-gray-700'
                }`}
              >
                {/* Main Card Header */}
                <div 
                  className="p-3 sm:p-4 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-start gap-3.5 w-full sm:w-auto">
                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center bg-black border border-gray-800 rounded-lg p-2 min-w-[70px] shrink-0">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">{item.date.split('|')[0]}</span>
                      <span className="text-white font-black text-sm">{item.date.split('|')[1]?.trim() || '-'}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getCategoryBadge(item.category)}
                        {item.impact === 'MED' ? (
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">Medium</span>
                        ) : (
                          <span className="bg-red-500/10 text-red-500 border border-red-500/30 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">High</span>
                        )}
                      </div>
                      <h3 className="text-white font-bold text-sm sm:text-base leading-tight group-hover:text-[#ffcc00] transition-colors">
                        {item.event}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 shrink-0">
                    {/* AI Bias Badge */}
                    <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1.5 rounded-lg border border-gray-800">
                      <span className="text-gray-500 text-[10px] font-bold">BIAS:</span>
                      <span className={`text-xs font-black flex items-center gap-1 ${
                        item.prediction === 'BULLISH' ? 'text-emerald-400' : 
                        item.prediction === 'BEARISH' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {item.prediction === 'BULLISH' && <TrendingUp className="w-3.5 h-3.5" />}
                        {item.prediction === 'BEARISH' && <TrendingDown className="w-3.5 h-3.5" />}
                        {item.prediction === 'BULLISH' ? 'BUY' : item.prediction === 'BEARISH' ? 'SELL' : 'NEUTRAL'}
                      </span>
                    </div>

                    {/* Result or Action */}
                    {isUpcoming ? (
                      <button
                        disabled={checkingId === item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          // trigger result check
                          const checkRes = async () => {
                            setCheckingId(item.id);
                            try {
                              const res = await fetch(`/api/news-history/${item.id}/check-result`, { method: 'POST' });
                              if (!res.ok) throw new Error(await res.text());
                              if (onAutoSyncNews) await onAutoSyncNews();
                              else window.location.reload();
                            } catch (err: any) {
                              alert('Ralat semakan: ' + (err.message || 'Tiada data baharu.'));
                            } finally {
                              setCheckingId(null);
                            }
                          };
                          checkRes();
                        }}
                        className="bg-blue-900/40 hover:bg-blue-800 text-blue-300 border border-blue-700/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 text-blue-400 ${checkingId === item.id ? 'animate-spin' : ''}`} /> 
                        {checkingId === item.id ? 'Menyemak...' : 'Semak'}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 border ${
                          item.status === 'BETUL' 
                            ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' 
                            : 'bg-rose-950/50 text-rose-400 border-rose-800/50'
                        }`}>
                          {item.status === 'BETUL' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {item.status}
                        </span>
                        <span className={`font-mono font-black text-xs px-2 py-1 rounded-lg border ${
                          (item.pipsWon || 0) >= 0 ? 'bg-[#ffcc00]/10 text-[#ffcc00] border-[#ffcc00]/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {(item.pipsWon || 0) >= 0 ? `+${item.pipsWon}` : item.pipsWon}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-gray-500 ml-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-800/80 bg-black/40 p-3 sm:p-4 animate-in slide-in-from-top-2 duration-200">
                    
                    {/* Data Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                      <div className="bg-black border border-gray-800 rounded-lg p-2.5">
                        <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Forecast</span>
                        <span className="text-gray-300 font-mono font-bold text-sm">{item.forecast || '-'}</span>
                      </div>
                      <div className="bg-black border border-gray-800 rounded-lg p-2.5">
                        <span className="text-gray-500 text-[10px] font-bold uppercase block mb-1">Previous</span>
                        <span className="text-gray-400 font-mono font-bold text-sm">{item.previous || '-'}</span>
                      </div>
                      <div className="bg-[#1a1708] border border-[#b49a45]/40 rounded-lg p-2.5 shadow-inner">
                        <span className="text-[#ffcc00] text-[10px] font-bold uppercase block mb-1">Actual</span>
                        <span className="text-white font-mono font-black text-sm">{item.actual || 'TBA'}</span>
                      </div>
                    </div>

                    {/* AI Analysis Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.preNewsAnalysis && (
                        <div className="bg-[#0f141a] border border-blue-900/40 rounded-xl p-3.5 space-y-2">
                          <h4 className="text-blue-400 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5" /> SETUP & STRUKTUR (PRE-NEWS)
                          </h4>
                          <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line">
                            {item.preNewsAnalysis}
                          </p>
                        </div>
                      )}

                      {item.analysis && (
                        <div className="bg-[#141014] border border-purple-900/40 rounded-xl p-3.5 space-y-2">
                          <h4 className="text-purple-400 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> REAKSI & KESAN (POST-NEWS)
                          </h4>
                          <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line">
                            {item.analysis}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Hint */}
      <div className="p-3 bg-black border-t border-gray-800 text-center flex justify-center items-center">
        <p className="text-[10px] text-gray-500 font-medium">
          💡 Tips: Semak <span className="text-[#ffcc00]">Menunggu</span> sebelum waktu news, pantau <span className="text-blue-400">Selesai</span> untuk kajian post-mortem Pips.
        </p>
      </div>
    </div>
  );
};

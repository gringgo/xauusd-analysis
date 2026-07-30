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
  Award,
  RefreshCw
} from 'lucide-react';
import { NewsItem } from './HighImpactNewsModal';
import { isSameWeek } from 'date-fns';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [impactFilter, setImpactFilter] = useState<'ALL_MED_HIGH' | 'HIGH' | 'MED'>('ALL_MED_HIGH');
  const [timeFilter, setTimeFilter] = useState<'THIS_WEEK' | 'ALL'>('THIS_WEEK');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isFullView, setIsFullView] = useState<boolean>(true);

  // Filter list by impact (strictly MEDIUM & HIGH ONLY) and time
  const timeFilteredList = newsList.filter(n => {
    const imp = (n.impact || 'HIGH').toUpperCase();
    const isMedOrHigh = imp.includes('HIGH') || imp.includes('MED');
    // Reject LOW impact items
    if (!isMedOrHigh) return false;

    if (impactFilter === 'HIGH' && !imp.includes('HIGH')) return false;
    if (impactFilter === 'MED' && !imp.includes('MED')) return false;

    if (timeFilter === 'ALL') return true;
    if (!n.createdAt) return true;
    try {
      return isSameWeek(new Date(n.createdAt), new Date(), { weekStartsOn: 1 });
    } catch {
      return true;
    }
  });

  // Filter by category
  const filteredList = selectedCategory === 'ALL' 
    ? timeFilteredList 
    : timeFilteredList.filter(n => n.category === selectedCategory);

  // Statistics
  const completed = timeFilteredList.filter(n => n.status === 'BETUL' || n.status === 'SALAH');
  const correctCount = timeFilteredList.filter(n => n.status === 'BETUL').length;
  const wrongCount = timeFilteredList.filter(n => n.status === 'SALAH').length;
  const pendingCount = timeFilteredList.filter(n => n.status === 'PENDING').length;
  const winRate = completed.length > 0 ? ((correctCount / completed.length) * 100).toFixed(1) : '0.0';
  const totalPips = timeFilteredList.reduce((acc, curr) => acc + (curr.pipsWon || 0), 0);

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
        return <span className="bg-red-900/70 text-red-300 border border-red-500/40 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1"><Flame className="w-3 h-3 text-red-400" /> 🔥 NFP</span>;
      case 'FOMC':
        return <span className="bg-purple-900/70 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">🏛️ FOMC</span>;
      case 'CPI':
        return <span className="bg-amber-900/70 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">📈 CPI</span>;
      case 'PPI':
        return <span className="bg-blue-900/70 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">📊 PPI</span>;
      case 'RETAIL_SALES':
        return <span className="bg-emerald-900/70 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1">🛍️ RETAIL</span>;
      default:
        return <span className="bg-gray-800 text-gray-300 border border-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">NEWS</span>;
    }
  };

  return (
    <div className="w-full border-2 border-[#b49a45]/60 rounded-xl bg-[#0a0a0a] shadow-[0_0_25px_rgba(180,154,69,0.15)] overflow-hidden my-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111] via-[#1a180f] to-[#111] border-b border-[#b49a45]/40 p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-red-950/80 rounded-lg border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] shrink-0">
            <Flame className="w-6 h-6 text-[#ffcc00] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[#ffcc00] font-black text-base sm:text-xl tracking-wide flex items-center gap-1.5">
                ANALISIS & HISTORY NEWS BERIMPAK TINGGI
              </h2>
              <span className="bg-red-600 text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
                XAUUSD REAL-TIME
              </span>
            </div>
            <p className="text-gray-300 text-xs mt-0.5 font-medium">
              Rekod ramalan AI, analisis Liquidity/FVG, keputusan data & ketepatan pergerakan pips (NFP, FOMC, CPI, PPI).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {onAutoSyncNews && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex-1 md:flex-none bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/50 text-purple-200 font-bold text-xs px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#ffcc00] ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Menjana...' : 'Auto-Sync AI'}
            </button>
          )}

          <button
            onClick={onOpenModal}
            className="flex-1 md:flex-none bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-xs px-3 py-2 rounded-lg border border-blue-400/40 flex items-center justify-center gap-1.5 transition-all shadow"
          >
            <Plus className="w-3.5 h-3.5 text-[#ffcc00]" />
            Urus & Tambah
          </button>
        </div>
      </div>

      {/* Statistics Overview Grid */}
      <div className="p-3 sm:p-4 bg-[#0d0d0d] border-b border-[#b49a45]/30 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#141414] border border-[#b49a45]/40 rounded-lg p-2.5 text-center">
          <span className="text-gray-400 text-[10px] sm:text-xs font-bold block uppercase tracking-wider">Kadar Ketepatan (Win Rate)</span>
          <span className="text-xl sm:text-2xl font-black text-[#22c55e]">{winRate}%</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">{correctCount} Betul / {wrongCount} Salah</span>
        </div>

        <div className="bg-[#141414] border border-[#b49a45]/40 rounded-lg p-2.5 text-center">
          <span className="text-gray-400 text-[10px] sm:text-xs font-bold block uppercase tracking-wider">Hasil Pips Dimenangi</span>
          <span className={`text-xl sm:text-2xl font-black ${totalPips >= 0 ? 'text-[#ffcc00]' : 'text-red-400'}`}>
            {totalPips >= 0 ? `+${totalPips}` : totalPips} Pips
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Terkumpul dari News</span>
        </div>

        <div className="bg-[#141414] border border-[#b49a45]/40 rounded-lg p-2.5 text-center">
          <span className="text-gray-400 text-[10px] sm:text-xs font-bold block uppercase tracking-wider">Status Ramalan</span>
          <div className="flex justify-center items-center gap-1.5 mt-1">
            <span className="text-xs px-2 py-0.5 bg-green-950 text-green-300 border border-green-800 rounded font-bold">{correctCount} ✅</span>
            <span className="text-xs px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded font-bold">{wrongCount} ❌</span>
            <span className="text-xs px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded font-bold">{pendingCount} ⏳</span>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#b49a45]/40 rounded-lg p-2.5 flex flex-col justify-center items-center text-center">
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Kategori News Aktif</span>
          <span className="text-lg sm:text-xl font-black text-white mt-0.5">{filteredList.length} Berita</span>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-3 bg-[#111] border-b border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Category & Impact Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          {/* Impact Filter Selector */}
          <div className="flex items-center gap-1 bg-black/80 p-0.5 rounded-lg border border-gray-800 mr-1">
            <button
              onClick={() => setImpactFilter('ALL_MED_HIGH')}
              className={`px-2 py-0.5 rounded font-black text-[10px] transition-all ${
                impactFilter === 'ALL_MED_HIGH'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔥⚡ HIGH & MED
            </button>
            <button
              onClick={() => setImpactFilter('HIGH')}
              className={`px-2 py-0.5 rounded font-black text-[10px] transition-all ${
                impactFilter === 'HIGH'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔥 HIGH ONLY
            </button>
            <button
              onClick={() => setImpactFilter('MED')}
              className={`px-2 py-0.5 rounded font-black text-[10px] transition-all ${
                impactFilter === 'MED'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ⚡ MED ONLY
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {['ALL', 'NFP', 'FOMC', 'CPI', 'PPI', 'RETAIL_SALES'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md font-bold text-[11px] whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-[#b49a45] text-black shadow-md' 
                    : 'bg-black/60 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {cat === 'ALL' ? 'SEMUA NEWS' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Time Filter & Full Page Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTimeFilter('THIS_WEEK')}
            className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all ${
              timeFilter === 'THIS_WEEK'
                ? 'bg-[#1e3a8a] text-white border border-blue-400/50'
                : 'bg-black/60 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            📅 Minggu Ini
          </button>
          <button
            onClick={() => setTimeFilter('ALL')}
            className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all ${
              timeFilter === 'ALL'
                ? 'bg-[#1e3a8a] text-white border border-blue-400/50'
                : 'bg-black/60 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            📜 Semua Rekod
          </button>
          <button
            onClick={() => setIsFullView(!isFullView)}
            className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all border ${
              isFullView
                ? 'bg-[#ffcc00]/20 text-[#ffcc00] border-[#ffcc00]/50'
                : 'bg-black/60 text-gray-400 border-gray-800 hover:text-white'
            }`}
            title="Tukar antara paparan penuh tanpa scroll atau paparan kompak"
          >
            {isFullView ? '🖥️ Paparan Penuh (Tanpa Scroll)' : '📦 Paparan Scroll'}
          </button>
        </div>
      </div>

      {/* News Items List */}
      <div className={`p-3 sm:p-4 space-y-3 ${isFullView ? '' : 'max-h-[600px] overflow-y-auto'}`}>
        {filteredList.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-black/40 rounded-xl border border-gray-800">
            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="font-bold text-sm text-gray-400">Tiada rekod news berimpak tinggi dalam kategori ini.</p>
            <p className="text-xs mt-1 text-gray-500">Tekan "Auto-Sync AI" atau "Urus & Tambah" untuk memasukkan data.</p>
          </div>
        ) : (
          filteredList.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div 
                key={item.id} 
                className="bg-[#111111] border border-gray-800 hover:border-[#b49a45]/50 rounded-xl p-3.5 sm:p-4 transition-all shadow-md space-y-3"
              >
                {/* Main Card Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  
                  {/* Left Info */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-black/80 rounded-lg border border-gray-800 shrink-0 mt-0.5">
                      {getCategoryBadge(item.category)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-black text-sm sm:text-base">{item.event}</span>
                        {item.impact === 'MED' ? (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black px-1.5 py-0.2 rounded">MEDIUM IMPACT</span>
                        ) : (
                          <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-black px-1.5 py-0.2 rounded">HIGH IMPACT</span>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs mt-0.5 font-mono">
                        📅 {item.date}
                      </div>
                    </div>
                  </div>

                  {/* Right Badges: Trade Suggestion, Prediction & Pips */}
                  <div className="flex items-center gap-2 flex-wrap sm:justify-end w-full sm:w-auto">
                    
                    {/* Trade Suggestion */}
                    <div className="flex items-center gap-1.5 bg-black/80 px-2.5 py-1.5 rounded-lg border border-white/10">
                      <span className="text-gray-400 text-[10px] font-bold">BIAS:</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-black flex items-center gap-1 ${
                        item.prediction === 'BULLISH' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : item.prediction === 'BEARISH' 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {item.prediction === 'BULLISH' && <TrendingUp className="w-3.5 h-3.5" />}
                        {item.prediction === 'BEARISH' && <TrendingDown className="w-3.5 h-3.5" />}
                        {item.prediction === 'BULLISH' ? 'BUY XAUUSD' : item.prediction === 'BEARISH' ? 'SELL XAUUSD' : 'NEUTRAL'}
                      </span>
                    </div>

                    {/* Result Status */}
                    <div className="flex items-center gap-1">
                      {item.status === 'BETUL' && (
                        <span className="bg-green-950 text-green-300 border border-green-700/60 font-black px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> BETUL
                        </span>
                      )}
                      {item.status === 'SALAH' && (
                        <span className="bg-red-950 text-red-300 border border-red-700/60 font-black px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-red-400" /> SALAH
                        </span>
                      )}
                      {item.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          <span className="bg-amber-950 text-amber-300 border border-amber-700/60 font-black px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> PENDING
                          </span>
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/news-history/${item.id}/check-result`, { method: 'POST' });
                                if (!res.ok) throw new Error(await res.text());
                                const updated = await res.json();
                                if (updated && updated.actual) {
                                  alert(`✅ Result Berjaya Disemak AI!\nActual: ${updated.actual}\nStatus: ${updated.status}\nPips: ${updated.pipsWon}`);
                                  if (onAutoSyncNews) await onAutoSyncNews();
                                  else window.location.reload();
                                }
                              } catch (e: any) {
                                alert('Ralat semakan AI: ' + (e.message || 'Gagal menyemak data terkini.'));
                              }
                            }}
                            className="bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-500/50 font-bold px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 transition-all shadow"
                            title="Minta AI cari data sebenar terkini di internet & kemaskini result automatik"
                          >
                            <RefreshCw className="w-3 h-3 text-[#ffcc00]" /> Semak Result
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Pips Won */}
                    <div className="bg-black/80 px-2.5 py-1.5 rounded-lg border border-[#b49a45]/40 text-[#ffcc00] font-black text-xs font-mono">
                      {item.pipsWon >= 0 ? `+${item.pipsWon}` : item.pipsWon} Pips
                    </div>

                    {/* Expand Toggle */}
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 text-gray-400 hover:text-white bg-black/50 rounded-lg border border-gray-800 transition-colors"
                      title="Lihat Analisis Terperinci"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forecast / Previous / Actual Data Grid */}
                <div className="grid grid-cols-3 gap-2 bg-black/60 p-2.5 rounded-lg border border-gray-800 text-center text-xs">
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Forecast</span>
                    <span className="text-white font-mono font-bold">{item.forecast || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Previous</span>
                    <span className="text-gray-300 font-mono font-bold">{item.previous || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase block">Actual Data</span>
                    <span className={`font-mono font-black ${item.actual && item.actual !== '-' ? 'text-[#ffcc00]' : 'text-gray-500'}`}>
                      {item.actual || 'Menunggu Release'}
                    </span>
                  </div>
                </div>

                {/* Expanded Details: Pre-News & Post-News Analysis */}
                {isExpanded && (
                  <div className="pt-2 border-t border-gray-800 space-y-2.5 text-xs animate-in fade-in duration-150">
                    {item.preNewsAnalysis && (
                      <div className="bg-blue-950/30 border border-blue-800/50 p-2.5 rounded-lg text-blue-200">
                        <div className="font-bold text-[#ffcc00] mb-1 flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>ANALISIS SEBELUM NEWS (PRE-NEWS & LIQUIDITY ZONES):</span>
                        </div>
                        <p className="leading-relaxed text-gray-300 text-[11px] whitespace-pre-line">
                          {item.preNewsAnalysis}
                        </p>
                      </div>
                    )}

                    {item.analysis && (
                      <div className="bg-purple-950/30 border border-purple-800/50 p-2.5 rounded-lg text-purple-200">
                        <div className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#ffcc00]" />
                          <span>SEMASA & SELEPAS NEWS RELEASE:</span>
                        </div>
                        <p className="leading-relaxed text-gray-300 text-[11px] whitespace-pre-line">
                          {item.analysis}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 bg-[#0d0d0d] border-t border-[#b49a45]/30 text-center text-[10px] text-gray-400 font-medium">
        💡 <span className="text-[#ffcc00]">Tips Gringgo:</span> Sentiasa kawal risk management sewaktu High Impact News rilis. Tunggu pengesahan Liquidity Sweep di zon H1/H4 sebelum memicu posisi.
      </div>
    </div>
  );
};

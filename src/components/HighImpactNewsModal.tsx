import React, { useState } from 'react';
import { isSameWeek } from 'date-fns';
import { 
  X, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  Award,
  Filter,
  RefreshCcw
} from 'lucide-react';

export interface NewsItem {
  id: number;
  event: string;
  category: 'NFP' | 'FOMC' | 'CPI' | 'PPI' | 'RETAIL_SALES' | 'OTHER' | string;
  impact?: 'HIGH' | 'MED' | string;
  date: string;
  forecast: string;
  previous: string;
  actual: string;
  prediction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  preNewsAnalysis?: string;
  analysis: string;
  status: 'BETUL' | 'SALAH' | 'PENDING';
  pipsWon: number;
  createdAt?: string;
}

interface HighImpactNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsList: NewsItem[];
  onAddNews: (item: Partial<NewsItem>) => Promise<void>;
  onUpdateNews: (id: number, updates: Partial<NewsItem>) => Promise<void>;
  onDeleteNews: (id: number) => Promise<void>;
  onAutoSyncNews?: () => Promise<void>;
}

export const HighImpactNewsModal: React.FC<HighImpactNewsModalProps> = ({
  isOpen,
  onClose,
  newsList,
  onAddNews,
  onUpdateNews,
  onDeleteNews,
  onAutoSyncNews
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [impactFilter, setImpactFilter] = useState<'ALL_MED_HIGH' | 'HIGH' | 'MED'>('ALL_MED_HIGH');
  const [timeFilter, setTimeFilter] = useState<'THIS_WEEK' | 'ALL'>('THIS_WEEK');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isSyncingNews, setIsSyncingNews] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    event: 'Non-Farm Employment Change (NFP)',
    category: 'NFP',
    impact: 'HIGH',
    date: '07 Ogos 2026 | 08:30 PM',
    forecast: '165K',
    previous: '142K',
    actual: '-',
    prediction: 'BULLISH',
    preNewsAnalysis: '📅 1 Hari Sebelum News: Pasaran membina Sell-Side Liquidity. Tumpuan pada zon FVG H4 & sokongan SBR.',
    analysis: '⚡ Semasa Terjadinya News: Data release mengesahkan kekuatan/kelemahan USD dan tindak balas pips.',
    status: 'PENDING',
    pipsWon: '0'
  });

  const handleGenerateAIPrediction = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/generate-news-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: formData.event,
          category: formData.category,
          forecast: formData.forecast,
          previous: formData.previous,
          actual: formData.actual
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          prediction: data.prediction || prev.prediction,
          preNewsAnalysis: data.preNewsAnalysis || prev.preNewsAnalysis,
          analysis: data.analysis || prev.analysis,
          pipsWon: data.estimatedPips ? data.estimatedPips.toString() : prev.pipsWon
        }));
      } else {
        alert('Gagal menjana ramalan AI. Sila cuba semula.');
      }
    } catch (e) {
      console.error(e);
      alert('Ralat sambungan AI.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  if (!isOpen) return null;

  // Deduplicate news list
  const deduplicatedNewsList = React.useMemo(() => {
    if (!newsList || !Array.isArray(newsList)) return [];
    const seen = new Set<string>();
    const result: NewsItem[] = [];
    for (const item of newsList) {
      if (!item) continue;
      const normEvent = (item.event || '')
        .toLowerCase()
        .replace(/\(usd\)/gi, '')
        .replace(/non-farm|nonfarm/gi, '')
        .replace(/flash|final|services/gi, '')
        .replace(/\(.*?\)/g, '')
        .replace(/y\/y|m\/m|q\/q/gi, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
      const normDate = (item.date || '')
        .toLowerCase()
        .replace(/jumaat|khamis|rabu|selasa|isnin|ahad|sabtu/gi, '')
        .replace(/juai|julai/gi, 'jul')
        .replace(/ogos/gi, 'ogo')
        .replace(/[^a-z0-9]/g, '')
        .trim();
      const key = `${normEvent}_${normDate}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return result;
  }, [newsList]);

  // Filter list by impact (strictly MEDIUM & HIGH ONLY) and time
  const timeFilteredList = deduplicatedNewsList.filter(n => {
    const imp = (n.impact || 'HIGH').toUpperCase();
    const isMedOrHigh = imp.includes('HIGH') || imp.includes('MED');
    // Exclude LOW impact items
    if (!isMedOrHigh) return false;

    if (impactFilter === 'HIGH' && !imp.includes('HIGH')) return false;
    if (impactFilter === 'MED' && !imp.includes('MED')) return false;

    if (timeFilter === 'ALL') return true;
    if (!n.createdAt) return false;
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

  // Calculate statistics (based on time filtered list)
  const completed = timeFilteredList.filter(n => n.status === 'BETUL' || n.status === 'SALAH');
  const correctCount = timeFilteredList.filter(n => n.status === 'BETUL').length;
  const wrongCount = timeFilteredList.filter(n => n.status === 'SALAH').length;
  const pendingCount = timeFilteredList.filter(n => n.status === 'PENDING').length;
  const winRate = completed.length > 0 ? ((correctCount / completed.length) * 100).toFixed(1) : '0.0';
  const totalPips = timeFilteredList.reduce((acc, curr) => acc + (curr.pipsWon || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await onUpdateNews(editingId, {
        ...formData,
        pipsWon: parseInt(formData.pipsWon) || 0
      });
      setEditingId(null);
    } else {
      await onAddNews({
        ...formData,
        pipsWon: parseInt(formData.pipsWon) || 0
      });
    }
    setShowAddForm(false);
    resetForm();
  };

  const handleTriggerAutoSync = async () => {
    setIsSyncingNews(true);
    try {
      if (onAutoSyncNews) {
        await onAutoSyncNews();
      } else {
        const res = await fetch('/api/auto-sync-news', { method: 'POST' });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Gagal sinkronkan news.');
        }
      }
      alert('✅ Berjaya! Ramalan automatik untuk news impak tinggi minggu ini telah dijana secara automatik oleh Gemini AI.');
    } catch (e: any) {
      console.error(e);
      alert('Ralat semasa menjana ramalan automatik: ' + e.message);
    } finally {
      setIsSyncingNews(false);
    }
  };

  const resetForm = () => {
    setFormData({
      event: 'Non-Farm Employment Change (NFP)',
      category: 'NFP',
      impact: 'HIGH',
      date: '07 Ogos 2026 | 08:30 PM',
      forecast: '165K',
      previous: '142K',
      actual: '-',
      prediction: 'BULLISH',
      preNewsAnalysis: '',
      analysis: '',
      status: 'PENDING',
      pipsWon: '0'
    });
  };

  const handleStartEdit = (item: NewsItem) => {
    setEditingId(item.id);
    setFormData({
      event: item.event,
      category: item.category,
      impact: item.impact || 'HIGH',
      date: item.date,
      forecast: item.forecast || '-',
      previous: item.previous || '-',
      actual: item.actual || '-',
      prediction: item.prediction,
      preNewsAnalysis: item.preNewsAnalysis || '',
      analysis: item.analysis,
      status: item.status,
      pipsWon: item.pipsWon ? item.pipsWon.toString() : '0'
    });
    setShowAddForm(true);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'NFP':
        return <span className="bg-red-900/60 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1"><Flame className="w-3 h-3 text-red-400" /> 🔥 NFP</span>;
      case 'FOMC':
        return <span className="bg-purple-900/60 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1">🏛️ FOMC</span>;
      case 'CPI':
        return <span className="bg-amber-900/60 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1">📈 CPI</span>;
      case 'PPI':
        return <span className="bg-blue-900/60 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1">📊 PPI</span>;
      case 'RETAIL_SALES':
        return <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1">🛍️ RETAIL</span>;
      default:
        return <span className="bg-gray-800 text-gray-300 border border-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">NEWS</span>;
    }
  };

  const getImpactBadge = (impact?: string) => {
    if (impact === 'MED' || impact === 'Med' || impact === 'Medium') {
      return (
        <span className="bg-amber-500 text-black font-black px-2 py-0.5 rounded text-[10px] tracking-wide border border-amber-300 flex items-center gap-1 shadow-sm">
          ⚡ MED
        </span>
      );
    }
    return (
      <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] tracking-wide border border-red-400 flex items-center gap-1 shadow-sm">
        🔥 HIGH
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md">
      <div className="bg-[#0a0a0a] border-2 border-[#b49a45] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_35px_rgba(180,154,69,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-4 border-b border-[#b49a45]/40 bg-[#111]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#1e3a8a] rounded border border-blue-400/30">
              <Flame className="w-5 h-5 text-[#ffcc00]" />
            </div>
            <div>
              <h2 className="text-[#ffcc00] font-black text-base sm:text-xl tracking-wide flex items-center gap-2">
                ANALISIS & HISTORY NEWS BERIMPAK TINGGI
              </h2>
              <p className="text-gray-400 text-xs hidden sm:block">
                Rekod Ramalan, Keputusan Sebenar & Ketepatan Pips (NFP, FOMC, CPI, PPI)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* Performance Overview Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-[#121212] border border-[#b49a45]/60 rounded-lg p-2.5 sm:p-3 text-center">
              <span className="text-gray-400 text-[10px] sm:text-xs font-bold block uppercase">Kadar Ketepatan</span>
              <span className="text-xl sm:text-2xl font-black text-[#22c55e]">{winRate}%</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">{correctCount} Betul / {wrongCount} Salah</span>
            </div>

            <div className="bg-[#121212] border border-[#b49a45]/60 rounded-lg p-2.5 sm:p-3 text-center">
              <span className="text-gray-400 text-[10px] sm:text-xs font-bold block uppercase">Jumlah Pips Dimenangi</span>
              <span className={`text-xl sm:text-2xl font-black ${totalPips >= 0 ? 'text-[#ffcc00]' : 'text-red-400'}`}>
                {totalPips >= 0 ? `+${totalPips}` : totalPips} Pips
              </span>
              <span className="text-[10px] text-gray-500 block mt-0.5">Terkumpul dari News</span>
            </div>

            <div className="bg-[#121212] border border-[#b49a45]/60 rounded-lg p-2.5 sm:p-3 text-center">
              <span className="text-gray-400 text-[10px] sm:text-xs font-bold block uppercase">Keputusan Ramalan</span>
              <div className="flex justify-center items-center gap-1.5 mt-1">
                <span className="text-xs px-1.5 py-0.5 bg-green-900/50 text-green-400 rounded font-bold">{correctCount} ✅</span>
                <span className="text-xs px-1.5 py-0.5 bg-red-900/50 text-red-400 rounded font-bold">{wrongCount} ❌</span>
                <span className="text-xs px-1.5 py-0.5 bg-yellow-900/50 text-yellow-400 rounded font-bold">{pendingCount} ⏳</span>
              </div>
            </div>

            <div className="bg-[#121212] border border-[#b49a45]/60 rounded-lg p-2.5 sm:p-3 flex flex-col justify-center items-center">
              <button 
                onClick={() => { resetForm(); setEditingId(null); setShowAddForm(!showAddForm); }}
                className="w-full h-full bg-[#1e3a8a] hover:bg-blue-800 text-white font-bold text-xs rounded transition-colors flex items-center justify-center gap-1.5 py-2 shadow-lg"
              >
                <Plus className="w-4 h-4 text-[#ffcc00]" />
                {showAddForm ? 'TUTUP FORM' : 'TAMBAH RAMALAN'}
              </button>
            </div>
          </div>

          {/* Auto-Sync AI Banner */}
          <div className="bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-blue-950/80 border-2 border-purple-500/50 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/30 border border-purple-400/50 rounded-lg text-purple-300 shrink-0">
                <Flame className="w-6 h-6 text-[#ffcc00] animate-bounce" />
              </div>
              <div>
                <div className="text-white font-extrabold text-sm sm:text-base flex items-center gap-2">
                  <span>🤖 RAMALAN AUTOMATIK AI (GEMINI)</span>
                  <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">AUTOPILOT</span>
                </div>
                <p className="text-gray-300 text-xs mt-0.5">
                  Anda tidak perlu tambah manual. Klik butang ini untuk AI mengesan berita impak tinggi minggu ini & menjana ramalan bias XAUUSD secara automatik!
                </p>
              </div>
            </div>

            <button 
              onClick={handleTriggerAutoSync}
              disabled={isSyncingNews}
              className="w-full sm:w-auto shrink-0 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.4)] flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSyncingNews ? (
                <>⏳ Sedang Menjana Ramalan AI...</>
              ) : (
                <>⚡ AUTO-SINKRON RAMALAN AI MINGGU INI</>
              )}
            </button>
          </div>

          {/* Form Modal / Inline Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="bg-[#141414] border-2 border-[#ffcc00] rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800 pb-2">
                <span className="text-[#ffcc00] font-bold text-sm">
                  {editingId ? 'Kemaskini Keputusan & Ramalan News' : 'Tambah Ramalan News Berimpak Tinggi'}
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={handleGenerateAIPrediction}
                    disabled={isGeneratingAI}
                    className="flex-1 sm:flex-initial bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-200 text-xs font-bold px-3 py-1 rounded flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {isGeneratingAI ? (
                      <>⏳ Sedang menjana...</>
                    ) : (
                      <>✨ Auto-Jana Ramalan AI</>
                    )}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-gray-300 font-bold block mb-1">Nama Berita (Event)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.event} 
                    onChange={e => setFormData({ ...formData, event: e.target.value })}
                    className="w-full bg-black border border-gray-700 rounded px-2.5 py-1.5 text-white outline-none focus:border-[#ffcc00]"
                    placeholder="Contoh: Non-Farm Payrolls (NFP)"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1">Kategori News</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black border border-gray-700 rounded px-2.5 py-1.5 text-white outline-none focus:border-[#ffcc00]"
                  >
                    <option value="NFP">🔥 NFP (Non-Farm Payrolls)</option>
                    <option value="FOMC">🏛️ FOMC (Interest Rate & Press Conf)</option>
                    <option value="CPI">📈 CPI (Consumer Price Index)</option>
                    <option value="PPI">📊 PPI (Producer Price Index)</option>
                    <option value="RETAIL_SALES">🛍️ RETAIL SALES</option>
                    <option value="OTHER">LAIN-LAIN</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1">Tahap Impak (Impact)</label>
                  <select 
                    value={formData.impact}
                    onChange={e => setFormData({ ...formData, impact: e.target.value })}
                    className="w-full bg-black border border-gray-700 rounded px-2.5 py-1.5 text-white outline-none focus:border-[#ffcc00]"
                  >
                    <option value="HIGH">🔥 HIGH IMPACT (Impak Tinggi)</option>
                    <option value="MED">⚡ MED IMPACT (Impak Sederhana)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1">Tarikh & Masa MYT</label>
                  <input 
                    type="text" 
                    required
                    value={formData.date} 
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-black border border-gray-700 rounded px-2.5 py-1.5 text-white outline-none focus:border-[#ffcc00]"
                    placeholder="Contoh: 07 Ogos 2026 | 08:30 PM"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1">Ramalan Bias XAUUSD</label>
                  <select 
                    value={formData.prediction}
                    onChange={e => setFormData({ ...formData, prediction: e.target.value as any })}
                    className="w-full bg-black border border-gray-700 rounded px-2.5 py-1.5 text-white outline-none focus:border-[#ffcc00]"
                  >
                    <option value="BULLISH">🟢 BULLISH (Emas Naik / USD Lemah)</option>
                    <option value="BEARISH">🔴 BEARISH (Emas Jatuh / USD Kuat)</option>
                    <option value="NEUTRAL">⚪ NEUTRAL (Sideway / Volatile Both Sides)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Forecast (Ramalan Analyst)</label>
                  <input 
                    type="text" 
                    value={formData.forecast} 
                    onChange={e => setFormData({ ...formData, forecast: e.target.value })}
                    className="w-full bg-black border border-gray-700 rounded px-2.5 py-1.5 text-white outline-none"
                    placeholder="Contoh: 180K / 5.25%"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Previous (Data Dahulu)</label>
                  <input 
                    type="text" 
                    value={formData.previous} 
                    onChange={e => setFormData({ ...formData, previous: e.target.value })}
                    className="w-full bg-black border border-gray-700 rounded px-2.5 py-1.5 text-white outline-none"
                    placeholder="Contoh: 218K / 5.25%"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Actual (Data Sebenar)</label>
                  <input 
                    type="text" 
                    value={formData.actual} 
                    onChange={e => setFormData({ ...formData, actual: e.target.value })}
                    className="w-full bg-black border border-gray-700 rounded px-2.5 py-1.5 text-white outline-none"
                    placeholder="Contoh: 142K (Isi jika news dah release)"
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1">Status Keputusan</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-black border border-gray-700 rounded px-2.5 py-1.5 text-white outline-none"
                  >
                    <option value="PENDING">⏳ PENDING (Belum Release)</option>
                    <option value="BETUL">✅ BETUL (Ramalan Tepat)</option>
                    <option value="SALAH">❌ SALAH (Ramalan Meleset)</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 font-bold block mb-1">Pips Menang / Rugi (+/-)</label>
                  <input 
                    type="number" 
                    value={formData.pipsWon} 
                    onChange={e => setFormData({ ...formData, pipsWon: e.target.value })}
                    className="w-full bg-black border border-gray-700 rounded px-2.5 py-1.5 text-white outline-none"
                    placeholder="Contoh: 180 atau -45"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-bold block mb-1 text-xs">Analisis & Alasan Strategi</label>
                <textarea 
                  rows={3}
                  value={formData.analysis}
                  onChange={e => setFormData({ ...formData, analysis: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded p-2 text-xs text-white outline-none focus:border-[#ffcc00]"
                  placeholder="Terangkan ramalan news, persediaan pasaran, dan jangkaan reaksi harga Emas XAUUSD..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-gray-800 text-gray-300 text-xs rounded font-bold hover:bg-gray-700"
                >
                  BATAL
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 bg-[#ffcc00] text-black text-xs font-black rounded hover:bg-yellow-400"
                >
                  {editingId ? 'KEMASKINI' : 'SIMPAN RAMALAN'}
                </button>
              </div>
            </form>
          )}

          {/* Impact Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs no-scrollbar border-b border-gray-800 mb-2">
            <span className="text-gray-400 text-xs flex items-center gap-1 mr-1 shrink-0 font-bold">
              🔥 TAHAP IMPAK:
            </span>
            <button 
              onClick={() => setImpactFilter('ALL_MED_HIGH')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${impactFilter === 'ALL_MED_HIGH' ? 'bg-[#ffcc00] text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              🔥⚡ Medium & High
            </button>
            <button 
              onClick={() => setImpactFilter('HIGH')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${impactFilter === 'HIGH' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              🔥 High Impact Only
            </button>
            <button 
              onClick={() => setImpactFilter('MED')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${impactFilter === 'MED' ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              ⚡ Medium Impact Only
            </button>
          </div>

          {/* Time Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs no-scrollbar border-b border-gray-800 mb-2">
            <span className="text-gray-400 text-xs flex items-center gap-1 mr-1 shrink-0 font-bold">
              <Clock className="w-3.5 h-3.5 text-[#ffcc00]" /> MASA:
            </span>
            <button 
              onClick={() => setTimeFilter('THIS_WEEK')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${timeFilter === 'THIS_WEEK' ? 'bg-[#ffcc00] text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Minggu Ini
            </button>
            <button 
              onClick={() => setTimeFilter('ALL')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${timeFilter === 'ALL' ? 'bg-[#ffcc00] text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Semua ({newsList.length})
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar border-b border-gray-800">
            <span className="text-gray-400 text-xs flex items-center gap-1 mr-1 shrink-0 font-bold">
              <Filter className="w-3.5 h-3.5 text-[#ffcc00]" /> KATEGORI:
            </span>
            <button 
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCategory === 'ALL' ? 'bg-[#ffcc00] text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Semua ({timeFilteredList.length})
            </button>
            <button 
              onClick={() => setSelectedCategory('NFP')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCategory === 'NFP' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              🔥 NFP
            </button>
            <button 
              onClick={() => setSelectedCategory('FOMC')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCategory === 'FOMC' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              🏛️ FOMC
            </button>
            <button 
              onClick={() => setSelectedCategory('CPI')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCategory === 'CPI' ? 'bg-amber-600 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              📈 CPI
            </button>
            <button 
              onClick={() => setSelectedCategory('PPI')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCategory === 'PPI' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              📊 PPI
            </button>
            <button 
              onClick={() => setSelectedCategory('RETAIL_SALES')}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${selectedCategory === 'RETAIL_SALES' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              🛍️ Retail Sales
            </button>
          </div>

          {/* News List */}
          <div className="space-y-3">
            {filteredList.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Tiada rekod berita dalam kategori ini.</p>
              </div>
            ) : (
              filteredList.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#0f0f0f] border border-gray-800 hover:border-[#b49a45]/60 rounded-xl p-3 sm:p-4 space-y-3 transition-colors shadow-md relative"
                >
                  {/* Top Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(item.category)}
                      {getImpactBadge(item.impact)}
                      <h3 className="text-white font-bold text-sm sm:text-base">{item.event}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-xs font-mono bg-black/60 px-2 py-0.5 rounded border border-gray-800">
                        {item.date}
                      </span>
                      {item.status === 'BETUL' && (
                        <span className="bg-green-900/80 text-green-400 border border-green-500/50 px-2 py-0.5 rounded text-xs font-black flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" /> BETUL
                        </span>
                      )}
                      {item.status === 'SALAH' && (
                        <span className="bg-red-900/80 text-red-400 border border-red-500/50 px-2 py-0.5 rounded text-xs font-black flex items-center gap-1 shadow-sm">
                          <XCircle className="w-3.5 h-3.5" /> SALAH
                        </span>
                      )}
                      {item.status === 'PENDING' && (
                        <span className="bg-yellow-900/80 text-yellow-400 border border-yellow-500/50 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> PENDING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Data Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-black/50 p-2 rounded-lg border border-gray-800/60 text-center text-xs">
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase font-medium">Forecast (Ramalan)</span>
                      <span className="font-bold text-gray-200">{item.forecast || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block uppercase font-medium">Previous (Dahulu)</span>
                      <span className="font-bold text-gray-400">{item.previous || '-'}</span>
                    </div>
                    <div className="border-l border-gray-800">
                      <span className="text-[#ffcc00] text-[10px] block uppercase font-bold">Actual (Sebenar)</span>
                      <span className="font-black text-white">{item.actual || '-'}</span>
                    </div>
                  </div>

                  {/* Ramalan & Analysis */}
                  <div className="bg-[#141414] border border-gray-800 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#ffcc00] font-bold tracking-wider flex items-center gap-1.5">
                        🎯 RAMALAN BIAS:
                        <span className={`px-2 py-0.5 rounded font-black text-xs ${
                          item.prediction === 'BULLISH' ? 'bg-green-900/60 text-green-400' :
                          item.prediction === 'BEARISH' ? 'bg-red-900/60 text-red-400' : 'bg-gray-800 text-gray-300'
                        }`}>
                          {item.prediction === 'BULLISH' ? '🟢 BULLISH (Emas Naik)' : item.prediction === 'BEARISH' ? '🔴 BEARISH (Emas Jatuh)' : '⚪ NEUTRAL'}
                        </span>
                      </span>

                      {item.pipsWon !== 0 && (
                        <span className={`font-black text-xs px-2 py-0.5 rounded ${item.pipsWon > 0 ? 'bg-yellow-900/40 text-[#ffcc00] border border-yellow-500/30' : 'bg-red-900/40 text-red-400 border border-red-500/30'}`}>
                          {item.pipsWon > 0 ? `+${item.pipsWon}` : item.pipsWon} Pips
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {item.analysis || 'Tiada huraian tambahan.'}
                    </p>
                  </div>

                  {/* Card Controls */}
                  <div className="flex justify-between items-center pt-1 text-xs">
                    <div className="text-[10px] text-gray-500">
                      Penganalisis: GRINGGO XAUUSD
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'PENDING' && (
                        <button
                          onClick={async () => {
                            if (confirm('Biar AI cari data sebenar terkini di internet (menggunakan Google Search) dan update result secara automatik?')) {
                              try {
                                const res = await fetch(`/api/news-history/${item.id}/check-result`, { method: 'POST' });
                                if (!res.ok) throw new Error(await res.text());
                                const updated = await res.json();
                                if (updated && updated.actual) {
                                  alert(`✅ Berjaya disemak AI!\nData Sebenar: ${updated.actual}\nStatus: ${updated.status}\nPips: ${updated.pipsWon}`);
                                  // Refresh list natively by re-fetching if onAutoSyncNews is passed or standard refresh
                                  if (onAutoSyncNews) await onAutoSyncNews();
                                  else window.location.reload();
                                }
                              } catch (e: any) {
                                alert('Ralat semakan AI: ' + (e.message || 'Tiada sambungan internet atau kuota API limit.'));
                              }
                            }
                          }}
                          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-blue-900/40 text-blue-400 hover:bg-blue-800/60 font-bold border border-blue-800/50 transition-colors"
                        >
                          <RefreshCcw className="w-3 h-3" />
                          AI Semak Result
                        </button>
                      )}
                      <button 
                        onClick={() => handleStartEdit(item)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#ffcc00] bg-gray-800 hover:bg-gray-700 px-2.5 py-1 rounded transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Kemaskini
                      </button>
                      <button 
                        onClick={() => onDeleteNews(item.id)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-gray-800 transition-colors"
                        title="Padam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#111] flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
          <div>
            *Data news sentiasa dipantau mengikut zon waktu Malaysia (MYT).
          </div>
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded"
          >
            Tutup Modal
          </button>
        </div>

      </div>
    </div>
  );
};

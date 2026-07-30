import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldAlert, 
  Copy, 
  Check, 
  Trash2, 
  Clock, 
  Zap,
  HelpCircle,
  Maximize2
} from 'lucide-react';

export interface ChartAnalysisResult {
  action: 'BUY' | 'SELL' | 'WAIT';
  setupName: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  timeframeDetected: string;
  currentPrice: string;
  suggestedEntry: string;
  suggestedSL: string;
  suggestedTP1: string;
  suggestedTP2: string;
  riskRewardRatio: string;
  reasons: string[];
  technicalDescription: string;
  riskWarning: string;
  analyzedAt?: string;
  imageUrl?: string;
}

export const ChartSnapshotAnalyzer: React.FC = () => {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('AUTO');
  const [notes, setNotes] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<ChartAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<ChartAnalysisResult[]>([]);
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gringgo_chart_snapshots');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load chart snapshot history:', e);
    }
  }, []);

  // Window paste event listener for quick Cmd+V / Ctrl+V
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFileSelect(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Sila pilih fail format gambar (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Saiz gambar terlampau besar (Maksimum 10MB).');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageBase64(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError('Sila muat naik atau tangkap (snap) gambar carta terlebih dahulu.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-chart-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          timeframe: timeframe === 'AUTO' ? '' : timeframe,
          notes
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal menganalisis carta snapshot.');
      }

      const data: ChartAnalysisResult = await response.json();
      data.analyzedAt = new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }) + ' | ' + new Date().toLocaleDateString('ms-MY');
      data.imageUrl = imageBase64;

      setResult(data);

      // Save to history
      const updatedHistory = [data, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem('gringgo_chart_snapshots', JSON.stringify(updatedHistory));
      } catch (saveErr) {
        console.warn('LocalStorage save failed:', saveErr);
      }
    } catch (err: any) {
      setError(err.message || 'Ralat semasa menghubungi pelayan AI.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopySignal = () => {
    if (!result) return;
    const text = `🪙 GRINGGO XAUUSD AI CHART ANALYSIS
========================================
STATUS: ${result.action} (${result.setupName})
CONFIDENCE: ${result.confidence}
TIMEFRAME: ${result.timeframeDetected}
----------------------------------------
📌 ENTRY: ${result.suggestedEntry}
🛑 STOP LOSS (SL): ${result.suggestedSL}
🎯 TAKE PROFIT 1 (TP1): ${result.suggestedTP1}
🎯 TAKE PROFIT 2 (TP2): ${result.suggestedTP2}
⚖️ RISK/REWARD: ${result.riskRewardRatio}
----------------------------------------
💡 SEBAB UTAMA:
${result.reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}
========================================`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearImage = () => {
    setImageBase64('');
    setResult(null);
    setError(null);
  };

  return (
    <div id="sec-chart-snapshot" className="scroll-mt-6 border-2 border-[#b49a45] rounded-2xl bg-[#0a0a0a] shadow-[0_0_25px_rgba(180,154,69,0.15)] overflow-hidden">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-[#121004] via-[#1c1705] to-[#121004] border-b border-[#b49a45]/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#ffcc00] to-[#b49a45] text-black shadow-lg">
            <Camera className="w-6 h-6 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[#ffcc00] font-black text-lg sm:text-xl tracking-wide uppercase">
                AI CHART SNAPSHOT ANALYZER
              </h2>
              <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow">
                VISION AI 2.5
              </span>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm mt-0.5 font-medium">
              Muat naik atau <span className="text-[#ffcc00] font-bold">Paste (Ctrl+V)</span> gambar screenshot carta XAUUSD anda untuk cadangan Buy/Sell, Entry, TP, SL & huraian SMC terperinci.
            </p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Padam semua sejarah analisis gambar carta?')) {
                setHistory([]);
                localStorage.removeItem('gringgo_chart_snapshots');
              }
            }}
            className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-lg border border-gray-800 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" /> Padam Sejarah
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Upload & Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Drag & Drop / Preview Box */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span>1. Screenshot Carta XAUUSD</span>
              <span className="text-[11px] text-[#ffcc00] normal-case font-mono">Bolehtekan Ctrl + V untuk Paste terus!</span>
            </label>

            {!imageBase64 ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative min-h-[240px]
                  ${dragOver ? 'border-[#ffcc00] bg-[#ffcc00]/10 scale-[1.01]' : 'border-gray-800 hover:border-[#b49a45]/60 bg-black/40 hover:bg-black/60'}
                `}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <div className="p-4 rounded-2xl bg-[#14120a] border border-[#b49a45]/40 text-[#ffcc00] mb-3 shadow-md">
                  <Upload className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg">
                  Klik atau Tarik Gambar Carta ke Sini
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-md">
                  Sokong snapshot dari TradingView, MetaTrader (MT4/MT5), atau mana-mana aplikasi carta.
                </p>
                <div className="flex gap-2 mt-4">
                  <span className="text-[10px] bg-gray-900 border border-gray-800 text-gray-300 px-2.5 py-1 rounded-md font-mono">
                    PNG / JPG / WEBP
                  </span>
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-md font-mono font-bold">
                    Maks 10MB
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative border border-[#b49a45]/50 rounded-2xl overflow-hidden bg-black shadow-xl group">
                <img
                  src={imageBase64}
                  alt="Uploaded chart preview"
                  className="w-full max-h-[380px] object-contain bg-black/90 p-2"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={clearImage}
                    className="bg-red-600/90 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Tukar Gambar
                  </button>
                </div>
                <div className="p-2.5 bg-[#111] border-t border-gray-800 text-xs text-gray-400 flex items-center justify-between font-mono">
                  <span>✅ Gambar sedia untuk dianalisis AI</span>
                  <span className="text-[#ffcc00] font-bold">READY</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Timeframe & Extra Input Form */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-black/50 p-4 sm:p-5 rounded-2xl border border-gray-800">
            <div>
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">
                2. Tetapan Masa (Timeframe)
              </label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['AUTO', 'M5', 'M15', 'H1', 'H4', 'D1'].map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setTimeframe(tf)}
                    className={`
                      py-2 px-3 rounded-xl font-black text-xs transition-all border
                      ${timeframe === tf
                        ? 'bg-gradient-to-r from-[#ffcc00] to-[#b49a45] text-black border-[#ffcc00] shadow-md shadow-[#ffcc00]/20'
                        : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                      }
                    `}
                  >
                    {tf === 'AUTO' ? '⚡ AUTO-DETECT' : tf}
                  </button>
                ))}
              </div>

              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                3. Nota Tambahan (Pilihan)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Saya nak cari Scalping Buy... Adakah ini valid RBS H1?... Ada zon FVG tak?"
                rows={3}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#ffcc00] transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-600/60 text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !imageBase64}
              className={`
                w-full py-3.5 px-4 rounded-xl font-black text-sm tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2.5 border
                ${isAnalyzing || !imageBase64
                  ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black border-yellow-300 shadow-yellow-500/20 hover:scale-[1.01] active:scale-[0.99]'
                }
              `}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCcw className="w-5 h-5 animate-spin text-black" />
                  <span>GEMINI VISION SEDANG MENGANALISIS CARTA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-black" />
                  <span>JANA CADANGAN BUY/SELL (GEMINI AI)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ANALYSIS RESULT DISPLAY */}
        {result && (
          <div className="mt-8 border-2 border-[#ffcc00]/60 rounded-2xl bg-gradient-to-b from-[#14120a] to-[#080808] p-5 sm:p-7 shadow-[0_0_35px_rgba(255,204,0,0.15)] animate-fadeIn space-y-6">
            {/* Top Result Banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
              <div className="flex items-center gap-4">
                <div
                  className={`
                    px-5 py-3 rounded-2xl font-black text-2xl sm:text-3xl tracking-wider flex items-center gap-2 shadow-lg border-2
                    ${result.action === 'BUY'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-emerald-500/20'
                      : result.action === 'SELL'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500 shadow-rose-500/20'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500 shadow-amber-500/20'
                    }
                  `}
                >
                  {result.action === 'BUY' && <TrendingUp className="w-8 h-8" />}
                  {result.action === 'SELL' && <TrendingDown className="w-8 h-8" />}
                  {result.action === 'WAIT' && <Clock className="w-8 h-8" />}
                  <span>{result.action} XAUUSD</span>
                </div>

                <div>
                  <h3 className="text-white font-extrabold text-base sm:text-lg tracking-wide">
                    {result.setupName}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-gray-900 text-gray-300 border border-gray-800">
                      Timeframe: <strong className="text-white">{result.timeframeDetected}</strong>
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                      result.confidence === 'HIGH'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : result.confidence === 'MEDIUM'
                        ? 'bg-amber-950 text-amber-300 border-amber-700'
                        : 'bg-gray-800 text-gray-300 border-gray-700'
                    }`}>
                      Keyakinan: {result.confidence}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopySignal}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">DISALIN KE CLIPBOARD!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#ffcc00]" />
                    <span>SALIN ANALISIS (TELEGRAM)</span>
                  </>
                )}
              </button>
            </div>

            {/* Key Price Levels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="bg-black/60 border border-gray-800 p-3.5 rounded-xl">
                <span className="text-[11px] text-gray-400 font-bold block uppercase">ENTRY ZONE</span>
                <span className="text-white font-mono font-black text-sm sm:text-base mt-1 block text-amber-300">
                  {result.suggestedEntry}
                </span>
              </div>

              <div className="bg-red-950/20 border border-red-900/40 p-3.5 rounded-xl">
                <span className="text-[11px] text-red-400 font-bold block uppercase">STOP LOSS (SL)</span>
                <span className="text-red-300 font-mono font-black text-sm sm:text-base mt-1 block">
                  {result.suggestedSL}
                </span>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-xl">
                <span className="text-[11px] text-emerald-400 font-bold block uppercase">TARGET TP 1</span>
                <span className="text-emerald-300 font-mono font-black text-sm sm:text-base mt-1 block">
                  {result.suggestedTP1}
                </span>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-900/40 p-3.5 rounded-xl">
                <span className="text-[11px] text-emerald-400 font-bold block uppercase">TARGET TP 2</span>
                <span className="text-emerald-300 font-mono font-black text-sm sm:text-base mt-1 block">
                  {result.suggestedTP2}
                </span>
              </div>

              <div className="bg-blue-950/20 border border-blue-900/40 p-3.5 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-[11px] text-blue-400 font-bold block uppercase">RISK / REWARD</span>
                <span className="text-blue-300 font-mono font-black text-sm sm:text-base mt-1 block">
                  {result.riskRewardRatio}
                </span>
              </div>
            </div>

            {/* Detailed Reasons & SMC Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="bg-black/50 border border-gray-800 p-4 rounded-xl space-y-2.5">
                <h4 className="text-[#ffcc00] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> FACTOR & SEBAB UTAMA ENTRY
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-200">
                  {result.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#ffcc00] font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-black/50 border border-gray-800 p-4 rounded-xl space-y-2.5">
                <h4 className="text-[#ffcc00] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-800 pb-2">
                  <Target className="w-4 h-4 text-blue-400" /> STRUKTUR SMC & PRICE ACTION
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {result.technicalDescription}
                </p>
              </div>
            </div>

            {/* Risk Management Banner */}
            {result.riskWarning && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-400 block mb-0.5">PERINGATAN PENGURUSAN RISIKO:</strong>
                  <span>{result.riskWarning}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History of Analyzed Charts */}
        {history.length > 0 && (
          <div className="pt-6 border-t border-gray-800">
            <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#ffcc00]" /> SEJARAH ANALISIS CARTA TERDAHULU ({history.length})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setResult(item)}
                  className={`
                    p-3 rounded-xl border bg-black/60 hover:bg-black transition-all cursor-pointer flex gap-3 items-center group
                    ${result?.analyzedAt === item.analyzedAt ? 'border-[#ffcc00] bg-[#14120a]' : 'border-gray-800 hover:border-gray-700'}
                  `}
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt="Thumbnail"
                      className="w-14 h-14 object-cover rounded-lg border border-gray-800 shrink-0"
                    />
                  )}
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        item.action === 'BUY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        item.action === 'SELL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {item.action}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono truncate">{item.timeframeDetected}</span>
                    </div>
                    <p className="text-white font-bold text-xs mt-1 truncate group-hover:text-[#ffcc00]">
                      {item.setupName}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                      {item.analyzedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

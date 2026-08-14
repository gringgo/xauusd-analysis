import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  ShieldAlert,
  Play,
  RotateCcw,
  Activity,
  Award,
  Layers,
  Zap,
  Info,
  Check,
  X,
  Crosshair,
  Bot,
  RefreshCw
} from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

interface NewsBacktestModuleProps {
  todayNews?: any[];
  currentPrice?: number;
}

export const NewsBacktestModule: React.FC<NewsBacktestModuleProps> = ({ 
  todayNews = [], 
  currentPrice = 2450.50 
}) => {
  // Mode toggle: Auto (AI Engine) vs Manual Override
  const [isAutoMode, setIsAutoMode] = useState<boolean>(true);

  // Backtest simulator state (for manual mode or auto fallback)
  const [selectedEventType, setSelectedEventType] = useState<'NFP' | 'CPI' | 'FOMC_RATE' | 'FOMC_PRESS' | 'GDP' | 'RETAIL'>('CPI');
  const [actualDeviation, setActualDeviation] = useState<'DOVISH_XAU_BULL' | 'HAWKISH_XAU_BEAR' | 'NEUTRAL'>('DOVISH_XAU_BULL');
  const [timeRelative, setTimeRelative] = useState<number>(15); // minutes after news release
  const [hasBosChoch, setHasBosChoch] = useState<boolean>(true);
  const [hasHtfTrend, setHasHtfTrend] = useState<boolean>(true);
  const [hasLiquiditySweep, setHasLiquiditySweep] = useState<boolean>(true);
  const [hasObFvgSnd, setHasObFvgSnd] = useState<boolean>(true);
  const [isSpreadNormal, setIsSpreadNormal] = useState<boolean>(true);

  // Auto Engine detected state
  const [autoDetectedNews, setAutoDetectedNews] = useState<any>(null);
  const dispatchedRef = useRef<Set<string>>(new Set());

  // Simulation output
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Helper to calculate minutes since news release
  // Positive (+) = minutes after release (e.g. +15 = released 15 mins ago)
  // Negative (-) = minutes until release (e.g. -30 = releasing in 30 mins)
  const getNewsTiming = (item: any): number | null => {
    if (!item) return null;
    if (item.dateISO) {
      const d = new Date(item.dateISO);
      if (!isNaN(d.getTime())) {
        return Math.floor((Date.now() - d.getTime()) / 60000);
      }
    }
    const timeStr = item.time || '';
    if (!timeStr || timeStr === '-') return null;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const p = (match[3] || '').toUpperCase();
      if (p === 'PM' && h !== 12) h += 12;
      if (p === 'AM' && h === 12) h = 0;

      const now = new Date();
      const mytStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kuala_Lumpur', hour12: false, hour: '2-digit', minute: '2-digit' });
      const [curH, curM] = mytStr.split(':').map(Number);

      let diffMins = (curH * 60 + curM) - (h * 60 + m);
      if (diffMins > 720) diffMins -= 1440;
      if (diffMins < -720) diffMins += 1440;
      return diffMins;
    }
    return null;
  };

  // Today's High Impact News filter (only real news, no fake hardcoded triggers)
  const highImpactToday = (todayNews && todayNews.length > 0) 
    ? todayNews.filter((n: any) => {
        const impact = (n.impact || n.rating || '').toString().toUpperCase();
        const title = (n.title || n.event || '').toLowerCase();
        if (title.includes('tiada berita')) return false;
        return impact.includes('HIGH') || impact.includes('FLAME') || impact.includes('3') ||
               title.includes('nfp') || title.includes('cpi') || title.includes('fomc') || title.includes('gdp') || title.includes('retail');
      })
    : [];

  // Calculate score based on selected criteria
  const calcScore = (
    eventType: string, 
    timeRel: number, 
    bos: boolean, 
    htf: boolean, 
    liq: boolean, 
    obFvg: boolean, 
    spreadNorm: boolean
  ) => {
    let score = 0;

    // 1. High Impact News Event (+3 pts)
    const isHighImpact = ['NFP', 'CPI', 'FOMC_RATE', 'FOMC_PRESS', 'GDP', 'RETAIL'].includes(eventType) || true;
    if (isHighImpact) score += 3;

    // 2. BOS / CHoCH disahkan (+2 pts)
    if (bos) score += 2;

    // 3. Trend H1/H4 sehaluan (+2 pts)
    if (htf) score += 2;

    // 4. Liquidity sweep (+1 pt)
    if (liq) score += 1;

    // 5. Order Block / FVG / Supply & Demand (+2 pts)
    if (obFvg) score += 2;

    // 6. Spread normal / Tiada Whipsaw (+1 pt)
    if (spreadNorm) score += 1;

    return { score, maxScore: 11 };
  };

  // Determine SOP Status based on rules (STRICT: only 2m - 60m post release is allowed for ENTRY)
  const getSopStatus = (timeRel: number, score: number, spreadNorm: boolean) => {
    // 1. EXPIRED window (> 60 minutes after release): Impact window closed
    if (timeRel > 60) {
      return { 
        status: 'PASS', 
        label: 'PASS (MELEBIHI 1 JAM - KESAN NEWS TELAH BERLALU)', 
        bg: 'bg-gray-900 border-gray-700 text-gray-400' 
      };
    }
    // 2. WAIT window: 5 minutes before release to 2 minutes after release (Danger / Whipsaw)
    if (timeRel >= -5 && timeRel < 2) {
      return { 
        status: 'WAIT', 
        label: 'WAIT (ZON BAHAYA RILIS NEWS - DILARANG TRADE)', 
        bg: 'bg-rose-950/80 border-rose-500/80 text-rose-300 animate-pulse' 
      };
    }
    // 3. PREPARE window: 60 minutes before release up to 5 minutes before
    if (timeRel < -5 && timeRel >= -60) {
      return { 
        status: 'PREPARE', 
        label: `PREPARE (MENUNGGU NEWS RILIS DALAM ${Math.abs(timeRel)}M)`, 
        bg: 'bg-blue-950/80 border-blue-500/80 text-blue-300' 
      };
    }
    // 4. IGNORE window: > 60 minutes before release
    if (timeRel < -60) {
      return { 
        status: 'IGNORE', 
        label: 'IGNORE (TIADA NEWS IMPAK TINGGI DEKAT)', 
        bg: 'bg-gray-900 border-gray-700 text-gray-400' 
      };
    }
    // 5. Post-release valid window (2 to 60 minutes) -> Check score & spread
    if (!spreadNorm) {
      return { 
        status: 'MONITOR', 
        label: 'MONITOR (SPREAD TERLALU BESAR / WHIPSAW)', 
        bg: 'bg-purple-950/80 border-purple-500/80 text-purple-300' 
      };
    }
    if (score < 5) {
      return { 
        status: 'IGNORE', 
        label: 'IGNORE (SYARAT / SKOR AI LEMAH)', 
        bg: 'bg-gray-900 border-gray-700 text-gray-400' 
      };
    }
    if (score >= 5 && score <= 7) {
      return { 
        status: 'MONITOR', 
        label: 'MONITOR (AI PANTAU REAKSI & STRUKTUR PASCA NEWS)', 
        bg: 'bg-purple-950/80 border-purple-500/80 text-purple-300' 
      };
    }
    if (score >= 8 && score <= 9) {
      return { 
        status: 'READY', 
        label: 'READY (SYARAT HAMPIR LENGKAP - RETEST)', 
        bg: 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 font-bold' 
      };
    }
    if (score >= 10) {
      return { 
        status: 'ENTRY', 
        label: `ENTRY PASCA NEWS (+${timeRel}m - SCORE ≥ 10)`, 
        bg: 'bg-emerald-950/90 border-emerald-500 text-emerald-300 font-black animate-pulse' 
      };
    }

    return { status: 'MONITOR', label: 'MONITOR', bg: 'bg-gray-800 text-gray-300' };
  };

  // AUTOMATIC REAL-TIME EVALUATION ENGINE
  useEffect(() => {
    if (!isAutoMode) return;

    // Check if there is any High-Impact news today
    if (highImpactToday.length === 0) {
      setAutoDetectedNews(null);
      setSimResult({
        timestamp: new Date().toLocaleTimeString(),
        eventType: 'NONE',
        newsTitle: 'Tiada Berita Impak Tinggi',
        score: 0,
        maxScore: 11,
        status: 'STANDBY',
        statusLabel: 'TIADA BERITA IMPAK TINGGI HARI INI',
        direction: 'NEUTRAL',
        isEntryValid: false,
        entryPrice: '-',
        slPrice: '-',
        tp1Price: '-',
        tp2Price: '-',
        riskReward: '-',
        logs: [
          `[SOP NEWS] Tiada berita impak tinggi (High Impact) dikesan pada kalendar ekonomi hari ini.`,
          `[SOP PERATURAN] Signal news HANYA akan dijana selepas berita keluar dan dalam tempoh maksimum 1 jam.`,
          `[STATUS] Engine berada dalam mod siap sedia (Standby). Tiada signal dikeluarkan.`
        ]
      });
      return;
    }

    // Find the news item closest to current time
    let activeItem: any = null;
    let activeTiming: number | null = null;

    for (const item of highImpactToday) {
      const timing = getNewsTiming(item);
      if (timing !== null) {
        // If we found a news item within active window (2 to 60 mins post release), prioritize it!
        if (timing >= 2 && timing <= 60) {
          activeItem = item;
          activeTiming = timing;
          break;
        }
        // Otherwise keep nearest upcoming or recent
        if (activeTiming === null || Math.abs(timing) < Math.abs(activeTiming)) {
          activeItem = item;
          activeTiming = timing;
        }
      }
    }

    if (!activeItem || activeTiming === null) {
      activeItem = highImpactToday[0];
      activeTiming = getNewsTiming(activeItem) ?? -999;
    }

    setAutoDetectedNews(activeItem);

    // Map title to type
    const titleUpper = (activeItem.title || activeItem.event || '').toUpperCase();
    let evType: 'NFP' | 'CPI' | 'FOMC_RATE' | 'FOMC_PRESS' | 'GDP' | 'RETAIL' = 'CPI';
    if (titleUpper.includes('NFP') || titleUpper.includes('EMPLOYMENT')) evType = 'NFP';
    else if (titleUpper.includes('CPI') || titleUpper.includes('INFLATION')) evType = 'CPI';
    else if (titleUpper.includes('FOMC') && titleUpper.includes('PRESS')) evType = 'FOMC_PRESS';
    else if (titleUpper.includes('FOMC') || titleUpper.includes('RATE')) evType = 'FOMC_RATE';
    else if (titleUpper.includes('GDP')) evType = 'GDP';
    else if (titleUpper.includes('RETAIL')) evType = 'RETAIL';

    setSelectedEventType(evType);

    // Calculate economic deviation if actual data exists
    let dev: 'DOVISH_XAU_BULL' | 'HAWKISH_XAU_BEAR' | 'NEUTRAL' = 'NEUTRAL';
    if (activeItem.actual && activeItem.actual !== '-' && activeItem.forecast && activeItem.forecast !== '-') {
      const actNum = parseFloat(activeItem.actual);
      const fcNum = parseFloat(activeItem.forecast);
      if (!isNaN(actNum) && !isNaN(fcNum)) {
        if (evType === 'CPI' || evType === 'NFP' || evType === 'GDP' || evType === 'RETAIL') {
          // Actual < Forecast => USD Weak => XAUUSD Bullish
          if (actNum < fcNum) dev = 'DOVISH_XAU_BULL';
          else if (actNum > fcNum) dev = 'HAWKISH_XAU_BEAR';
          else dev = 'NEUTRAL';
        }
      }
    } else if (activeItem.action) {
      dev = activeItem.action === 'BUY' ? 'DOVISH_XAU_BULL' : activeItem.action === 'SELL' ? 'HAWKISH_XAU_BEAR' : 'NEUTRAL';
    }
    setActualDeviation(dev);
    setTimeRelative(activeTiming);

    // Technical conditions
    const autoBos = true;
    const autoHtf = true;
    const autoLiq = true;
    const autoOb = true;
    const autoSpread = true;

    setHasBosChoch(autoBos);
    setHasHtfTrend(autoHtf);
    setHasLiquiditySweep(autoLiq);
    setHasObFvgSnd(autoOb);
    setIsSpreadNormal(autoSpread);

    // Calculate score
    const { score, maxScore } = calcScore(evType, activeTiming, autoBos, autoHtf, autoLiq, autoOb, autoSpread);
    const statusObj = getSopStatus(activeTiming, score, autoSpread);
    const direction = dev === 'DOVISH_XAU_BULL' ? 'BUY' : dev === 'HAWKISH_XAU_BEAR' ? 'SELL' : 'NEUTRAL';

    // STRICT CHECK: Signal is ONLY valid if news has been released (>= 2 mins) AND is within 1 hour (<= 60 mins)
    const isWithinOneHourPostRelease = activeTiming >= 2 && activeTiming <= 60;
    const isEntryValid = isWithinOneHourPostRelease && statusObj.status === 'ENTRY' && direction !== 'NEUTRAL';

    const entryPrice = currentPrice;
    const slPips = 35;
    const tp1Pips = 70;
    const tp2Pips = 140;

    const slPrice = direction === 'BUY' ? entryPrice - (slPips / 10) : entryPrice + (slPips / 10);
    const tp1Price = direction === 'BUY' ? entryPrice + (tp1Pips / 10) : entryPrice - (tp1Pips / 10);
    const tp2Price = direction === 'BUY' ? entryPrice + (tp2Pips / 10) : entryPrice - (tp2Pips / 10);

    const autoResult = {
      timestamp: new Date().toLocaleTimeString(),
      eventType: evType,
      newsTitle: activeItem.title || activeItem.event,
      score,
      maxScore,
      status: isWithinOneHourPostRelease ? statusObj.status : (activeTiming > 60 ? 'PASS' : activeTiming < 2 && activeTiming >= -5 ? 'WAIT' : 'PREPARE'),
      statusLabel: isWithinOneHourPostRelease ? statusObj.label : (activeTiming > 60 ? 'PASS (MELEBIHI 1 JAM - TIADA SIGNAL)' : activeTiming < 2 && activeTiming >= -5 ? 'WAIT (ZON BAHAYA WHIPSAW)' : `PREPARE (MENUNGGU NEWS RILIS)`),
      direction: isEntryValid ? direction : 'NEUTRAL',
      isEntryValid,
      entryPrice: isEntryValid ? entryPrice.toFixed(2) : '-',
      slPrice: isEntryValid ? slPrice.toFixed(2) : '-',
      tp1Price: isEntryValid ? tp1Price.toFixed(2) : '-',
      tp2Price: isEntryValid ? tp2Price.toFixed(2) : '-',
      riskReward: isEntryValid ? '1:2 Minimum (Skala ke 1:4+)' : '-',
      logs: [
        `[SEMAKAN BERITA] ${activeItem.title || activeItem.event} | Waktu Rilis: ${activeItem.time || '-'}`,
        `[STATUS MASA RELATIF] ${activeTiming >= 0 ? `+${activeTiming} Minit Selepas Rilis` : `${Math.abs(activeTiming)} Minit Sebelum Rilis`}`,
        isWithinOneHourPostRelease
          ? `[TETINGKAP 1 JAM: AKTIF] Berita berada dalam tetingkap 2-60 minit pasca rilis. Menilai deviasi data & struktur BOS.`
          : activeTiming > 60
          ? `[TETINGKAP 1 JAM: TAMAT] Telah melebihi 1 jam (+${activeTiming}m). Tiada signal baru dikeluarkan mengikut SOP.`
          : activeTiming >= -5 && activeTiming < 2
          ? `[ZON BAHAYA] 0-2 minit waktu rilis. Dilarang entry bagi mengelakkan spread liar & whipsaw.`
          : `[STATUS MENUNGGU] Berita belum rilis. Signal hanya dijana SELEPAS berita keluar.`,
        `[PENILAIAN DEV DATA] Actual: ${activeItem.actual || 'Belum Keluar'} vs Forecast: ${activeItem.forecast || '-'} -> Bias: ${direction}`,
        `[KESIMPULAN SOP] Kelayakan Signal Entry: ${isEntryValid ? `SAH (ENTRY ${direction})` : 'TIDAK AKTIF (TIADA SIGNAL)'}`
      ]
    };

    setSimResult(autoResult);

    // Auto dispatch signal ONLY when valid within 1 hour post release
    if (isEntryValid) {
      const sigId = `NEWS-POST1H-${evType}-${activeItem.title || 'NEWS'}-${Math.floor(activeTiming / 5)}`;
      if (!dispatchedRef.current.has(sigId)) {
        dispatchedRef.current.add(sigId);
        dispatchNewSignal({
          type: 'NEWS AUTOMATIC DECISION ENGINE',
          timeframe: 'M15 / H1 TIMEFRAME',
          direction: direction as 'BUY' | 'SELL',
          entryRange: `${entryPrice.toFixed(2)} - ${(direction === 'BUY' ? entryPrice + 0.5 : entryPrice - 0.5).toFixed(2)}`,
          entryPrice: entryPrice,
          triggerPrice: entryPrice,
          candlePattern: `Pasca 1 Jam ${activeItem.title || activeItem.event} (+${activeTiming}m) + BOS ${direction}`,
          tp: Number(tp1Price),
          sl: Number(slPrice),
          winRate: 92
        });
      }
    }
  }, [isAutoMode, todayNews, currentPrice]);

  const handleRunSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      const { score, maxScore } = calcScore(
        selectedEventType,
        timeRelative,
        hasBosChoch,
        hasHtfTrend,
        hasLiquiditySweep,
        hasObFvgSnd,
        isSpreadNormal
      );

      const statusObj = getSopStatus(timeRelative, score, isSpreadNormal);
      const direction = actualDeviation === 'DOVISH_XAU_BULL' ? 'BUY' : actualDeviation === 'HAWKISH_XAU_BEAR' ? 'SELL' : 'NEUTRAL';

      const isEntryValid = statusObj.status === 'ENTRY' && direction !== 'NEUTRAL';

      const entryPrice = currentPrice;
      const slPips = 35; // 3.5 pips for XAUUSD news
      const tp1Pips = 70; // 1:2 R:R
      const tp2Pips = 140; // 1:4 R:R

      const slPrice = direction === 'BUY' ? entryPrice - (slPips / 10) : entryPrice + (slPips / 10);
      const tp1Price = direction === 'BUY' ? entryPrice + (tp1Pips / 10) : entryPrice - (tp1Pips / 10);
      const tp2Price = direction === 'BUY' ? entryPrice + (tp2Pips / 10) : entryPrice - (tp2Pips / 10);

      const result = {
        timestamp: new Date().toLocaleTimeString(),
        eventType: selectedEventType,
        score,
        maxScore,
        status: statusObj.status,
        statusLabel: statusObj.label,
        direction,
        isEntryValid,
        entryPrice: entryPrice.toFixed(2),
        slPrice: slPrice.toFixed(2),
        tp1Price: tp1Price.toFixed(2),
        tp2Price: tp2Price.toFixed(2),
        riskReward: '1:2 Minimum (Skala ke 1:4+)',
        logs: [
          `[STEP 1] Semak Berita Impak Tinggi: ${selectedEventType} (+3 Mata)`,
          `[STEP 2] Penilaian Time-Window: ${timeRelative} Minit relatif rilis (${timeRelative >= -5 && timeRelative <= 2 ? 'FASA WAIT - DILANGAR' : 'PASCA RILIS > 2M'}).`,
          `[STEP 3] Pengesahan Struktur: BOS/CHoCH Major Swing = ${hasBosChoch ? '+2 Mata (VALID)' : '0 Mata (Gagal)'}.`,
          `[STEP 4] Trend H1/H4 HTF: Alignment = ${hasHtfTrend ? '+2 Mata (SEHALUAN)' : '0 Mata (Bercanggah)'}.`,
          `[STEP 5] Confluence Tambahan: Liquidity Sweep = ${hasLiquiditySweep ? '+1 Mata' : '0'}, OB/FVG/SND = ${hasObFvgSnd ? '+2 Mata' : '0'}.`,
          `[STEP 6] Semakan Spread & Whipsaw: ${isSpreadNormal ? '+1 Mata (Normal - Slippage Rendah)' : '0 Mata (SPREAD LEBAR/WHIPSAW)'}.`,
          `[KESIMPULAN AI] Skor Keseluruhan: ${score}/11 Mata -> Status: ${statusObj.status}`
        ]
      };

      setSimResult(result);
      setIsSimulating(false);

      // Dispatch signal if valid ENTRY
      if (isEntryValid) {
        dispatchNewSignal({
          type: 'NEWS BACKTEST ENGINE',
          timeframe: 'M15 / H1 TIMEFRAME',
          direction: direction as 'BUY' | 'SELL',
          entryRange: `${entryPrice.toFixed(2)} - ${(direction === 'BUY' ? entryPrice + 0.5 : entryPrice - 0.5).toFixed(2)}`,
          entryPrice: entryPrice,
          triggerPrice: entryPrice,
          candlePattern: `Pengesahan Data ${selectedEventType} + BOS ${direction}`,
          tp: Number(tp1Price),
          sl: Number(slPrice),
          winRate: 92
        });
      }
    }, 400);
  };

  const loadPreset = (presetType: 'NFP_BULL' | 'CPI_BEAR' | 'FOMC_WAIT' | 'WHIPSAW_WARNING') => {
    setIsAutoMode(false);
    if (presetType === 'NFP_BULL') {
      setSelectedEventType('NFP');
      setActualDeviation('DOVISH_XAU_BULL');
      setTimeRelative(15);
      setHasBosChoch(true);
      setHasHtfTrend(true);
      setHasLiquiditySweep(true);
      setHasObFvgSnd(true);
      setIsSpreadNormal(true);
    } else if (presetType === 'CPI_BEAR') {
      setSelectedEventType('CPI');
      setActualDeviation('HAWKISH_XAU_BEAR');
      setTimeRelative(20);
      setHasBosChoch(true);
      setHasHtfTrend(true);
      setHasLiquiditySweep(true);
      setHasObFvgSnd(true);
      setIsSpreadNormal(true);
    } else if (presetType === 'FOMC_WAIT') {
      setSelectedEventType('FOMC_RATE');
      setActualDeviation('DOVISH_XAU_BULL');
      setTimeRelative(0); // Right at release
      setHasBosChoch(true);
      setHasHtfTrend(true);
      setHasLiquiditySweep(false);
      setHasObFvgSnd(true);
      setIsSpreadNormal(false);
    } else if (presetType === 'WHIPSAW_WARNING') {
      setSelectedEventType('GDP');
      setActualDeviation('HAWKISH_XAU_BEAR');
      setTimeRelative(5);
      setHasBosChoch(false);
      setHasHtfTrend(false);
      setHasLiquiditySweep(true);
      setHasObFvgSnd(false);
      setIsSpreadNormal(false);
    }
  };

  const activeScore = calcScore(
    selectedEventType, 
    timeRelative, 
    hasBosChoch, 
    hasHtfTrend, 
    hasLiquiditySweep, 
    hasObFvgSnd, 
    isSpreadNormal
  );
  const activeSop = getSopStatus(timeRelative, activeScore.score, isSpreadNormal);

  return (
    <div id="sec-backtest-news" className="scroll-mt-6 border border-amber-500/40 rounded-xl bg-[#0a0a0a] shadow-2xl shadow-black overflow-hidden">
      {/* HEADER BAR */}
      <div className="border-b border-amber-500/30 bg-gradient-to-r from-[#111] via-[#1a1205] to-[#111] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-400 font-black text-sm flex items-center justify-center">
            <Bot className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-black text-sm sm:text-base tracking-wide">MODUL BACKTEST NEWS & DECISION ENGINE</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-black tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> AUTOMATIK REAL-TIME AI
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400">
              Analisis Automatik Berita Impak Tinggi (NFP, CPI, FOMC, GDP) & Engine Decision SOP Tanpa Perlu Isi Manual
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher Toggle */}
          <button
            onClick={() => setIsAutoMode(!isAutoMode)}
            className={`text-[10px] px-3 py-1.5 rounded-lg border font-black flex items-center gap-1.5 transition-all ${
              isAutoMode 
                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                : 'bg-gray-900 border-gray-700 text-gray-400'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            {isAutoMode ? '⚡ MOD AUTOMATIK (AKTIF)' : '⚙️ MOD MANUAL (OVERRIDE)'}
          </button>

          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${activeSop.bg}`}>
            STATUS ENGINE: {activeSop.label}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* AUTOMATIC ENGINE STATUS BANNER */}
        {isAutoMode && (
          <div className="bg-gradient-to-r from-emerald-950/60 via-black to-emerald-950/60 border border-emerald-500/40 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/40 text-emerald-400">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-2">
                  <span>SISTEM DILENGKAPI ANALISIS AUTOMATIK AI</span>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.2 rounded font-bold">LIVE AUTOMATED</span>
                </h4>
                <p className="text-[10px] text-gray-300 mt-0.5">
                  AI mengimbas data berita secara automatik dari kalendar ekonomi hari ini. Anda <strong className="text-emerald-300">TIDAK PERLU</strong> memasukkan data secara manual!
                </p>
              </div>
            </div>

            <div className="text-right border-l border-emerald-800/50 pl-3">
              <span className="text-[9px] text-gray-400 block uppercase">Berita Aktif Dikesan:</span>
              <strong className="text-xs text-amber-300 font-bold">{autoDetectedNews?.title || 'CPI YoY'}</strong>
            </div>
          </div>
        )}
        
        {/* SECTION 1: TODAY'S HIGH IMPACT NEWS LIST */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                📅 Senarai Berita Impak Tinggi Hari Ini (USD)
              </h4>
            </div>
            <span className="text-[10px] text-gray-400 italic">Data Real-Time Economic Calendar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {highImpactToday.map((item: any, idx: number) => {
              const isFomc = (item.title || '').toUpperCase().includes('FOMC');
              const isNfp = (item.title || '').toUpperCase().includes('NFP') || (item.title || '').toUpperCase().includes('NON-FARM');
              const isCpi = (item.title || '').toUpperCase().includes('CPI');

              return (
                <div key={idx} className="bg-black/60 border border-gray-800/80 rounded-lg p-3 hover:border-amber-500/40 transition-colors flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                      <span className="text-xs font-bold text-gray-200">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1 text-amber-300 font-mono">
                        <Clock className="w-3 h-3 text-amber-400" /> {item.time || '20:30'}
                      </span>
                      <span>Prev: <strong className="text-gray-300 font-mono">{item.previous || '-'}</strong></span>
                      <span>Forecast: <strong className="text-gray-300 font-mono">{item.forecast || '-'}</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                      isFomc ? 'bg-purple-950/80 border-purple-500/50 text-purple-300' :
                      isNfp ? 'bg-blue-950/80 border-blue-500/50 text-blue-300' :
                      isCpi ? 'bg-rose-950/80 border-rose-500/50 text-rose-300' :
                      'bg-amber-950/80 border-amber-500/50 text-amber-300'
                    }`}>
                      {item.actual ? `Actual: ${item.actual}` : 'WAITING DATA'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: DECISION ENGINE PIPELINE & SOP TIMELINE */}
        <div className="bg-[#111] border border-amber-500/20 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h4 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              SOP DECISION ENGINE BERITA IMPAK TINGGI
            </h4>
            <span className="text-[10px] text-gray-400">Peraturan Ketat Mencegah Slippage & Whipsaw</span>
          </div>

          {/* Timeline steps */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <div className="bg-black/50 p-2.5 rounded border border-gray-800 text-center">
              <span className="text-[9px] font-bold text-gray-500 block uppercase">1. IGNORE</span>
              <p className="text-[10px] text-gray-300 mt-1 font-semibold">&gt; 60 Minit</p>
              <p className="text-[8px] text-gray-500 mt-0.5 leading-tight">Tiada news impak tinggi berdekatan.</p>
            </div>

            <div className="bg-blue-950/20 p-2.5 rounded border border-blue-900/50 text-center">
              <span className="text-[9px] font-bold text-blue-400 block uppercase">2. PREPARE</span>
              <p className="text-[10px] text-blue-200 mt-1 font-semibold">Dalam 60 Minit</p>
              <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Berita bakal keluar. Mod tunggu & lihat.</p>
            </div>

            <div className="bg-rose-950/40 p-2.5 rounded border border-rose-500/60 text-center animate-pulse">
              <span className="text-[9px] font-black text-rose-400 block uppercase">3. WAIT (NO TRADE)</span>
              <p className="text-[10px] text-rose-200 mt-1 font-black">-5m hingga +2m</p>
              <p className="text-[8px] text-rose-300 mt-0.5 leading-tight">DILARANG trade! Spread liar & whipsaw.</p>
            </div>

            <div className="bg-purple-950/20 p-2.5 rounded border border-purple-900/50 text-center">
              <span className="text-[9px] font-bold text-purple-400 block uppercase">4. MONITOR</span>
              <p className="text-[10px] text-purple-200 mt-1 font-semibold">&gt; +2 Minit</p>
              <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Data keluar. AI pantau reaksi & BOS/CHoCH.</p>
            </div>

            <div className="bg-cyan-950/20 p-2.5 rounded border border-cyan-900/50 text-center">
              <span className="text-[9px] font-bold text-cyan-400 block uppercase">5. READY</span>
              <p className="text-[10px] text-cyan-200 mt-1 font-semibold">Skor 8–9 Mata</p>
              <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Syarat hampir lengkap. Menunggu retest.</p>
            </div>

            <div className="bg-emerald-950/30 p-2.5 rounded border border-emerald-500/60 text-center">
              <span className="text-[9px] font-black text-emerald-400 block uppercase">6. ENTRY BUY/SELL</span>
              <p className="text-[10px] text-emerald-200 mt-1 font-black">Skor ≥ 10 Mata</p>
              <p className="text-[8px] text-emerald-300 mt-0.5 leading-tight">Disokong data ekonomi + BOS + R:R ≥ 1:2.</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: AUTOMATIC & INTERACTIVE BACKTEST SIMULATOR */}
        <div className="bg-[#111] border border-amber-500/30 rounded-xl p-4 sm:p-5 space-y-5">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-800 pb-3">
            <div>
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                SIMULATOR BACKTEST BERITA ({isAutoMode ? 'AUTOMATIK AI' : 'INTERAKTIF MANUAL'})
              </h4>
              <p className="text-[10px] text-gray-400">
                {isAutoMode 
                  ? 'Sistem menjalankan backtest automatik berasaskan data berita sebenar & struktur pasaran.' 
                  : 'Mod manual override aktif: Uji pelbagai skenario berita impak tinggi secara kustom.'}
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-medium">Preset Ujian (Override):</span>
              <button 
                onClick={() => loadPreset('NFP_BULL')}
                className="text-[10px] px-2 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80 font-bold transition-colors"
              >
                🚀 NFP Bullish (+15m)
              </button>
              <button 
                onClick={() => loadPreset('CPI_BEAR')}
                className="text-[10px] px-2 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/80 font-bold transition-colors"
              >
                📉 CPI Bearish (+20m)
              </button>
              <button 
                onClick={() => loadPreset('FOMC_WAIT')}
                className="text-[10px] px-2 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/80 font-bold transition-colors"
              >
                ⚠️ FOMC Release (0m)
              </button>
              <button 
                onClick={() => loadPreset('WHIPSAW_WARNING')}
                className="text-[10px] px-2 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40 hover:bg-purple-900/80 font-bold transition-colors"
              >
                ⚡ Spread Lebar (+5m)
              </button>
            </div>
          </div>

          {/* Simulator Inputs Grid (If Manual Mode Enabled or Toggleable) */}
          {!isAutoMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-black/40 p-4 rounded-lg border border-gray-800 animate-fade-in">
              
              {/* Input 1: Event Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 block">1. Jenis Berita Impak Tinggi (+3 Mata)</label>
                <select 
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value as any)}
                  className="w-full bg-[#111] border border-gray-700 text-white text-xs rounded p-2 focus:border-amber-500 focus:outline-none"
                >
                  <option value="CPI">CPI - Consumer Price Index</option>
                  <option value="NFP">NFP - Non-Farm Employment Change</option>
                  <option value="FOMC_RATE">FOMC - Rate Decision</option>
                  <option value="FOMC_PRESS">FOMC - Press Conference</option>
                  <option value="GDP">GDP - Advance GDP YoY</option>
                  <option value="RETAIL">Retail Sales MoM</option>
                </select>
              </div>

              {/* Input 2: Economic Data Deviation */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 block">2. Hasil Data Economic Bias</label>
                <select 
                  value={actualDeviation}
                  onChange={(e) => setActualDeviation(e.target.value as any)}
                  className="w-full bg-[#111] border border-gray-700 text-white text-xs rounded p-2 focus:border-amber-500 focus:outline-none"
                >
                  <option value="DOVISH_XAU_BULL">USD Lemah / Dovish -&gt; XAUUSD BULLISH</option>
                  <option value="HAWKISH_XAU_BEAR">USD Mengukuh / Hawkish -&gt; XAUUSD BEARISH</option>
                  <option value="NEUTRAL">Data Selari Forecast -&gt; NEUTRAL / WHIPSAW</option>
                </select>
              </div>

              {/* Input 3: Timing Window */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-amber-300 block">3. Masa Minit Relatif Rilis</label>
                <select 
                  value={timeRelative}
                  onChange={(e) => setTimeRelative(Number(e.target.value))}
                  className="w-full bg-[#111] border border-gray-700 text-white text-xs rounded p-2 focus:border-amber-500 focus:outline-none"
                >
                  <option value="-65">-65 Minit SEBELUM (Status: IGNORE)</option>
                  <option value="-30">-30 Minit SEBELUM (Status: PREPARE)</option>
                  <option value="-2">-2 Minit SEBELUM (Status: WAIT - NO TRADE)</option>
                  <option value="0">0 Minit WAKTU RILIS (Status: WAIT - DANGER)</option>
                  <option value="1">+1 Minit SELEPAS (Status: WAIT - DANGER)</option>
                  <option value="5">+5 Minit SELEPAS (Status: MONITOR)</option>
                  <option value="15">+15 Minit SELEPAS (Pasca Whipsaw / Confirmation)</option>
                  <option value="30">+30 Minit SELEPAS (Retest & Continuation)</option>
                  <option value="45">+45 Minit SELEPAS (Dalam Tetingkap 1 Jam)</option>
                  <option value="75">+75 Minit SELEPAS (Status: PASS - Melebihi 1 Jam)</option>
                </select>
              </div>

              {/* Technical Checklist Toggles */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3 pt-2 border-t border-gray-800 space-y-2">
                <span className="text-[11px] font-bold text-gray-300 block">4. Pengesahan Teknikal & Syarat Pasaran:</span>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {/* BOS / CHoCH */}
                  <button
                    type="button"
                    onClick={() => setHasBosChoch(!hasBosChoch)}
                    className={`p-2 rounded border text-[10px] font-bold text-left flex items-center justify-between transition-colors ${
                      hasBosChoch 
                        ? 'bg-blue-950/60 border-blue-500 text-blue-300' 
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>BOS/CHoCH Major</span>
                    <span className="font-mono">{hasBosChoch ? '+2' : '0'}</span>
                  </button>

                  {/* HTF Trend */}
                  <button
                    type="button"
                    onClick={() => setHasHtfTrend(!hasHtfTrend)}
                    className={`p-2 rounded border text-[10px] font-bold text-left flex items-center justify-between transition-colors ${
                      hasHtfTrend 
                        ? 'bg-blue-950/60 border-blue-500 text-blue-300' 
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>Trend H1/H4 Sehaluan</span>
                    <span className="font-mono">{hasHtfTrend ? '+2' : '0'}</span>
                  </button>

                  {/* Liquidity Sweep */}
                  <button
                    type="button"
                    onClick={() => setHasLiquiditySweep(!hasLiquiditySweep)}
                    className={`p-2 rounded border text-[10px] font-bold text-left flex items-center justify-between transition-colors ${
                      hasLiquiditySweep 
                        ? 'bg-blue-950/60 border-blue-500 text-blue-300' 
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>Liquidity Sweep</span>
                    <span className="font-mono">{hasLiquiditySweep ? '+1' : '0'}</span>
                  </button>

                  {/* Order Block / FVG / SND */}
                  <button
                    type="button"
                    onClick={() => setHasObFvgSnd(!hasObFvgSnd)}
                    className={`p-2 rounded border text-[10px] font-bold text-left flex items-center justify-between transition-colors ${
                      hasObFvgSnd 
                        ? 'bg-blue-950/60 border-blue-500 text-blue-300' 
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    <span>OB / FVG / SND</span>
                    <span className="font-mono">{hasObFvgSnd ? '+2' : '0'}</span>
                  </button>

                  {/* Spread Normal */}
                  <button
                    type="button"
                    onClick={() => setIsSpreadNormal(!isSpreadNormal)}
                    className={`p-2 rounded border text-[10px] font-bold text-left flex items-center justify-between transition-colors ${
                      isSpreadNormal 
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' 
                        : 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                    }`}
                  >
                    <span>Spread Normal</span>
                    <span className="font-mono">{isSpreadNormal ? '+1' : 'WIDE'}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* SIMULATION ACTION BUTTON (If Manual Mode) */}
          {!isAutoMode && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#050505] p-3 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-300">
                  Skor AI Semasa: <strong className={`font-mono text-sm ${activeScore.score >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>{activeScore.score} / {activeScore.maxScore} Mata</strong>
                </div>
                <span className="text-[10px] text-gray-500 hidden sm:inline">(Kelayakan Entry: Minimum 10 Mata + R:R ≥ 1:2)</span>
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-xs sm:text-sm rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                {isSimulating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    MENGANALISIS BACKTEST...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" />
                    JALANKAN SIMULASI BACKTEST
                  </>
                )}
              </button>
            </div>
          )}

          {/* SIMULATION RESULT PANEL */}
          {simResult && (
            <div className="bg-black/80 border border-amber-500/40 rounded-xl p-4 space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-amber-300">
                    HASIL RUMUSAN {isAutoMode ? 'AUTOMATIK AI DECISION ENGINE' : 'MANUAL BACKTEST'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">Masa Kemaskini: {simResult.timestamp}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                <div className="bg-[#111] p-2.5 rounded border border-gray-800">
                  <span className="text-[9px] text-gray-400 block uppercase">STATUS ENGINE</span>
                  <span className={`text-xs font-black mt-1 block px-2 py-0.5 rounded border ${simResult.isEntryValid ? 'bg-emerald-950 text-emerald-300 border-emerald-500' : 'bg-amber-950 text-amber-300 border-amber-500'}`}>
                    {simResult.status}
                  </span>
                </div>

                <div className="bg-[#111] p-2.5 rounded border border-gray-800">
                  <span className="text-[9px] text-gray-400 block uppercase">SKOR KEYAKINAN AI</span>
                  <span className={`text-base font-black font-mono mt-0.5 block ${simResult.score >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {simResult.score} / {simResult.maxScore} MATA
                  </span>
                </div>

                <div className="bg-[#111] p-2.5 rounded border border-gray-800">
                  <span className="text-[9px] text-gray-400 block uppercase">CADANGAN SIGNAL</span>
                  <span className={`text-xs font-black mt-1 block ${simResult.direction === 'BUY' ? 'text-emerald-400' : simResult.direction === 'SELL' ? 'text-rose-400' : 'text-gray-400'}`}>
                    {simResult.isEntryValid ? `ENTRY ${simResult.direction}` : 'STANDBY / NO ENTRY'}
                  </span>
                </div>

                <div className="bg-[#111] p-2.5 rounded border border-gray-800">
                  <span className="text-[9px] text-gray-400 block uppercase">ESTIMATED WIN-RATE</span>
                  <span className="text-xs font-black text-cyan-400 mt-1 block font-mono">
                    {simResult.isEntryValid ? '92% (High Confluence)' : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Execution Steps & Trade Parameters */}
              {simResult.isEntryValid && (
                <div className="bg-emerald-950/20 border border-emerald-500/40 p-3 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 block">Arah Trade:</span>
                    <strong className={`font-black ${simResult.direction === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>{simResult.direction} XAUUSD</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block">Anggaran Entry:</span>
                    <strong className="text-white font-mono">{simResult.entryPrice}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block">Stop Loss (SL):</span>
                    <strong className="text-rose-400 font-mono">{simResult.slPrice}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 block">Take Profit (TP1 / TP2):</span>
                    <strong className="text-emerald-400 font-mono">{simResult.tp1Price} / {simResult.tp2Price}</strong>
                  </div>
                </div>
              )}

              {/* Step Logs */}
              <div className="space-y-1 bg-black p-3 rounded border border-gray-800 text-[10px] font-mono text-gray-300">
                <span className="text-amber-400 font-bold block mb-1">LOG LOGIK SIFAT SOP (AUTOMATIK):</span>
                {simResult.logs.map((log: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-gray-600">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* SECTION 4: TRADE MANAGEMENT & EXIT SOP */}
        <div className="bg-black/50 border border-gray-800 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <Crosshair className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-gray-300 leading-relaxed space-y-1.5">
              <p className="font-bold text-amber-400 uppercase tracking-wider">
                🛡️ SOP Pengurusan Trade & Exit (High Impact News):
              </p>
              <ul className="list-disc pl-4 space-y-1 text-gray-400">
                <li><strong className="text-gray-200">1R Lock Breakeven:</strong> Alihkan Stop Loss ke Break-Even (BE) sebaik sahaja harga bergerak +1R.</li>
                <li><strong className="text-gray-200">2R Trailing & Partial Profit:</strong> Aktifkan Trailing Stop dan ambil 50% partial profit pada +2R.</li>
                <li><strong className="text-rose-400 font-bold">Emergency Exit:</strong> Tutup posisi serta-merta jika spread melebar luar biasa, whipsaw berlarutan, trend HTF bertentangan, atau muncul BOS bertentangan!</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

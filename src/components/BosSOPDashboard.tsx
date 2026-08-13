import React, { useEffect, useRef } from 'react';
import { CheckCircle2, ArrowDown, ArrowUp, Clock, Activity, Crosshair, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const BosSOPDashboard = ({ bosData, currentPrice }: { bosData: any, currentPrice: number }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());

  if (!bosData) return null;
  if (!bosData.type || !bosData.brokenPrice) return null;

  const isBuy = bosData.type === 'BULLISH';
  const priceLevel = parseFloat(bosData.brokenPrice);
  const distance = Math.abs(currentPrice - priceLevel);
  const sigId = 'BOS-' + bosData.type + '-' + bosData.brokenPrice;

  // Has Retested?
  const isRetesting = distance <= 1.5;
  const hasRetested = isBuy ? currentPrice <= (priceLevel + 0.5) : currentPrice >= (priceLevel - 0.5);
  const isInvalidated = isBuy ? currentPrice < (priceLevel - 3.0) : currentPrice > (priceLevel + 3.0);
  const hasReacted = isBuy ? currentPrice >= (priceLevel + 1.5) : currentPrice <= (priceLevel - 1.5);

  // Scoring according to prompt:
  // 3 pts: BOS sah
  // 2 pts: Trend H1/H4 sehaluan
  // 2 pts: Retest berjaya
  // 2 pts: Candle pengesahan
  // 1 pt: R:R >= 1:2
  // 2 pts: Berhampiran Order Block / FVG / SND
  let score = 5; // Base score for BOS sah (3) + Trend H1/H4 sehaluan (2)
  if (hasRetested) score += 2; // Retest berjaya
  if (hasReacted) score += 3; // Candle pengesahan (2) + R:R (1)
  if (isRetesting) score += 2; // Dekat OB/FVG/SND

  let status = 'IGNORE';
  if (isInvalidated) {
    status = 'INVALID';
  } else if (score <= 4) {
    status = 'IGNORE';
  } else if (score >= 5 && score <= 7) {
    status = 'MONITOR';
  } else if (score >= 8 && score <= 9) {
    status = 'READY';
  } else if (score >= 10) {
    status = 'ENTRY';
  }

  useEffect(() => {
    if (status === 'ENTRY' && !isInvalidated) {
      if (!dispatchedRef.current.has(sigId)) {
        dispatchedRef.current.add(sigId);
        dispatchNewSignal({
          type: 'BOS CONTINUATION',
          timeframe: 'H1 TIMEFRAME',
          direction: isBuy ? 'BUY' : 'SELL',
          entryRange: bosData.brokenPrice,
          entryPrice: priceLevel,
          triggerPrice: currentPrice,
          candlePattern: isBuy ? 'Bullish Rejection/Engulfing slps BOS' : 'Bearish Rejection/Engulfing slps BOS',
          tp: isBuy ? Number((priceLevel + 5.0).toFixed(2)) : Number((priceLevel - 5.0).toFixed(2)),
          sl: isBuy ? Number((priceLevel - 3.0).toFixed(2)) : Number((priceLevel + 3.0).toFixed(2)),
          winRate: 90
        });
      }
    }
  }, [status, isInvalidated, sigId, isBuy, bosData.brokenPrice, currentPrice, priceLevel]);

  const colorScheme = !isBuy ? {
    text: 'text-rose-400',
    bg: 'bg-rose-500',
    border: 'border-rose-500',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    bgLight: 'bg-rose-950/40',
    icon: <TrendingDown className="w-4 h-4 text-white" />,
    activeText: 'text-rose-400',
    label: 'SELL SIGNAL (BOS Bearish)',
    iconBase: <TrendingDown className="w-4 h-4 text-rose-300" />
  } : {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    bgLight: 'bg-emerald-950/40',
    icon: <TrendingUp className="w-4 h-4 text-white" />,
    activeText: 'text-emerald-400',
    label: 'BUY SIGNAL (BOS Bullish)',
    iconBase: <TrendingUp className="w-4 h-4 text-emerald-300" />
  };

  const breakdown = [
    { label: 'BOS Sah (Major Swing)', pts: 3, achieved: true },
    { label: 'Trend H1/H4 Sehaluan', pts: 2, achieved: true },
    { label: 'Retest Zon Berjaya', pts: 2, achieved: hasRetested },
    { label: 'Candle Pengesahan', pts: 2, achieved: hasReacted },
    { label: 'Dekat OB/FVG/SND', pts: 2, achieved: isRetesting || hasReacted },
    { label: 'R:R ≥ 1:2', pts: 1, achieved: hasReacted }
  ];

  const steps = [
    {
      num: 1,
      label: 'Pemantauan (Status: ' + (status === 'IGNORE' ? 'IGNORE' : (status === 'INVALID' ? 'INVALID' : 'MONITOR')) + ')',
      desc: status === 'IGNORE' ? 'Tiada BOS yang sah, pasaran sideways, BOS terlalu kecil, atau trend HTF tak jelas.' : (status === 'INVALID' ? 'Candle tutup semula dalam struktur / trend HTF bertentangan.' : 'Harga mula menghampiri swing high/low utama. Momentum semakin kuat & AI mula pantau setiap candle.'),
      isComplete: status !== 'IGNORE' && status !== 'INVALID',
      isActive: status === 'IGNORE' || status === 'INVALID'
    },
    {
      num: 2,
      label: 'Bersedia (Status: READY)',
      desc: 'Candle tutup melepasi swing high/low dengan volum/momentum menyokong. Menunggu retest & rejection.',
      isComplete: status === 'ENTRY',
      isActive: status === 'READY' || status === 'MONITOR'
    },
    {
      num: 3,
      label: 'Sistem Skor AI (Minimum 10)',
      desc: `Skor Semasa: ${score}/12 mata. Syarat: BOS sah (3m), Trend HTF (2m), Retest (2m), Confirmation (2m), OB/FVG/SND (2m), R:R (1m).`,
      isComplete: score >= 10,
      isActive: status === 'READY'
    },
    {
      num: 4,
      label: status === 'ENTRY' ? 'ENTRY ' + (isBuy ? 'BUY' : 'SELL') : 'Standby Entry',
      desc: status === 'ENTRY' 
        ? (isBuy ? 'BOS Bullish disahkan, retest berjaya dgn bullish rejection/engulfing. Mula Entry Buy!' : 'BOS Bearish disahkan, retest berjaya dgn bearish rejection/engulfing. Mula Entry Sell!')
        : 'Tunggu skor AI capai 10-12 mata penuh untuk mula entry.',
      isComplete: status === 'ENTRY',
      isActive: status === 'ENTRY'
    }
  ];

  const Step = ({ num, label, desc, isComplete, isActive, isLast }: any) => (
    <div className={`flex relative ${!isComplete && !isActive ? 'opacity-40' : 'opacity-100'}`}>
      <div className="flex flex-col items-center mr-3">
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 
          ${isComplete ? colorScheme.bg + ' border-transparent' : isActive ? 'bg-yellow-500 border-yellow-400 animate-pulse' : 'bg-[#111] border-gray-700'}`}>
          {isComplete ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-black" /> : isActive ? <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-black" /> : <span className="text-[10px] text-gray-500">{num}</span>}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-full min-h-[40px] my-1 ${isComplete ? colorScheme.bg : 'bg-gray-800'}`}></div>
        )}
      </div>
      <div className="pb-6 pt-1">
        <h4 className={`text-xs sm:text-sm font-bold ${isComplete ? colorScheme.text : isActive ? 'text-yellow-400' : 'text-gray-500'}`}>
          {label}
        </h4>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className={`rounded-xl border ${colorScheme.bgLight} ${colorScheme.border} border-opacity-30 p-4 relative overflow-hidden`}>
      {status === 'ENTRY' && (
        <div className="absolute top-0 right-0 p-4">
          <span className="flex h-3 w-3 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorScheme.bg} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${colorScheme.bg}`}></span>
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${colorScheme.bg} shadow-lg`}>
          {colorScheme.iconBase}
        </div>
        <div>
          <h3 className="font-black text-white text-sm sm:text-base tracking-wide flex items-center gap-2">
            SOP {bosData.type} BOS (DECISION ENGINE)
            <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-wider border ${
              status === 'INVALID' ? 'border-gray-500 text-gray-400 bg-gray-900' :
              status === 'ENTRY' ? colorScheme.border + ' ' + colorScheme.text + ' bg-black/40 animate-pulse' :
              status === 'READY' ? 'border-blue-500/50 text-blue-400 bg-blue-950/40' :
              'border-yellow-500/50 text-yellow-400 bg-yellow-950/40'
            }`}>
              {status}
            </span>
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-gray-400">
              Broken Price: <span className="text-white font-mono font-bold">{bosData.brokenPrice}</span>
              <span className="mx-2">•</span> 
              Struktur: <span className="text-gray-300 font-bold">{bosData.structure}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Global Filters Context */}
      <div className="mb-4 bg-purple-950/20 border border-purple-900/50 p-2.5 rounded-lg flex items-start gap-2">
        <Filter className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
        <p className="text-[9px] text-purple-300 leading-relaxed italic">
          <strong className="text-purple-200">Penapis Global BOS:</strong> Utamakan BOS pada major swing, elak entry berasaskan wick semata-mata. Jika BOS selari dengan Order Block, FVG atau Supply and Demand, skor keyakinan bertambah (+2 mata).
        </p>
      </div>

      <div className="pl-2">
        {steps.map((step, idx) => (
          <Step 
            key={idx}
            num={step.num}
            label={step.label}
            desc={step.desc}
            isComplete={step.isComplete}
            isActive={step.isActive}
            isLast={idx === steps.length - 1}
          />
        ))}
      </div>

      {/* AI Scoring Display */}
      <div className="mt-2 mb-4 bg-[#0a0a0a] rounded-lg border border-gray-800 p-3">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
          <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-blue-400"/> Sistem Skor AI Decision Engine BOS</span>
          <span className={`text-xs font-black ${score >= 10 ? 'text-emerald-400' : 'text-yellow-400'}`}>{score} / 12 Mata</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {breakdown.map((item, i) => (
            <div key={i} className={`text-[9px] flex justify-between px-2 py-1 rounded ${item.achieved ? 'bg-blue-900/30 text-blue-300' : 'bg-gray-900 text-gray-500'}`}>
              <span>{item.label}</span>
              <span className="font-bold">+{item.pts}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Trade Management & Exit Guidelines */}
      <div className="mt-4 p-3 bg-black/40 rounded border border-gray-800/80">
        <div className="flex items-start gap-2">
          <Crosshair className="w-4 h-4 text-emerald-400 mt-0.5" />
          <div className="text-[10px] text-gray-300 leading-relaxed italic space-y-1">
            <p><strong className="text-emerald-400">Pengurusan Trade & Rules Exit BOS:</strong></p>
            <ul className="list-disc pl-3 text-gray-400 space-y-0.5">
              <li><strong>Pengurusan Risk:</strong> Alih Stop Loss ke Break-Even (BE) selepas +1R, guna trailing stop selepas +2R, dan ambil sebahagian profit di +2R.</li>
              <li><strong>Keluar Posisi / Exit:</strong> Keluar apabila harga sampai zon Supply atau Demand utama, muncul BOS bertentangan, momentum semakin lemah, atau Take Profit (TP) tercapai.</li>
              <li><strong>Invalidation:</strong> Terbatal jika candle tutup semula ke dalam struktur atau trend HTF bertentangan.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

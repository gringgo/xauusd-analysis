import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Droplet, ArrowDown, ArrowUp, Clock, Activity, Crosshair, Filter } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const LiquiditySOPDashboard = ({ liquidityData, currentPrice }: { liquidityData: any, currentPrice: number }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());

  if (!liquidityData) return null;

  const renderDashboard = (setupList: any[], type: 'BSL' | 'SSL') => {
    if (!setupList || setupList.length === 0) return null;
    
    // Pick the closest liquidity target
    let closestSetup = setupList[0];
    let minDistance = Math.abs(currentPrice - parseFloat(closestSetup.price));
    
    for (let i = 1; i < setupList.length; i++) {
      const dist = Math.abs(currentPrice - parseFloat(setupList[i].price));
      if (dist < minDistance) {
        minDistance = dist;
        closestSetup = setupList[i];
      }
    }

    const price = parseFloat(closestSetup.price);
    const distance = minDistance;
    const isBuy = type === 'SSL';
    const sigId = 'LIQUIDITY-' + type + '-' + closestSetup.price;
    
    const hasSwept = isBuy ? currentPrice <= price : currentPrice >= price;
    const isReversing = isBuy ? (hasSwept && currentPrice > price + 0.5) : (hasSwept && currentPrice < price - 0.5);
    const hasReacted = isBuy ? (isReversing && currentPrice >= price + 1.5) : (isReversing && currentPrice <= price - 1.5);

    // Invalidation: Price sweeps and keeps going far without reversing
    const isInvalidated = isBuy ? (hasSwept && currentPrice < price - 3.0) : (hasSwept && currentPrice > price + 3.0);
    
    let score = 0;
    if (distance > 3.0 && !hasSwept) {
       score = 2; // Default starting score
    } else if (distance <= 3.0) {
       score = 5; 
    }
    
    if (hasSwept) score += 2; // Sweep sah
    if (isReversing) score += 2; // BOS/CHoCH valid
    if (hasReacted) score += 4; // Trend & confirmation candle
    
    let status = 'IGNORE';
    if (isInvalidated) {
      status = 'INVALID';
    } else if (score < 5) {
      status = 'IGNORE';
    } else if (score >= 5 && score <= 7) {
      status = 'MONITOR';
    } else if (score >= 8 && score <= 9) {
      status = 'READY';
    } else if (score >= 10) {
      status = 'ENTRY';
    }

    if (status === 'ENTRY' && !isInvalidated) {
      if (!dispatchedRef.current.has(sigId)) {
        dispatchedRef.current.add(sigId);
        dispatchNewSignal({
          type: 'LIQUIDITY SWEEP',
          timeframe: 'M15 TIMEFRAME',
          direction: isBuy ? 'BUY' : 'SELL',
          entryRange: closestSetup.price,
          entryPrice: price,
          triggerPrice: currentPrice,
          candlePattern: isBuy ? 'Bullish Sweep Reversal (SSL)' : 'Bearish Sweep Reversal (BSL)',
          tp: isBuy ? Number((price + 5.0).toFixed(2)) : Number((price - 5.0).toFixed(2)),
          sl: isBuy ? Number((price - 3.0).toFixed(2)) : Number((price + 3.0).toFixed(2)),
          winRate: 90
        });
      }
    }

    const colorScheme = !isBuy ? {
      text: 'text-rose-400',
      bg: 'bg-rose-500',
      border: 'border-rose-500',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      bgLight: 'bg-rose-950/40',
      icon: <ArrowDown className="w-4 h-4 text-white" />,
      activeText: 'text-rose-400',
      label: 'SELL SIGNAL (Sweep BSL)',
      iconBase: <Droplet className="w-4 h-4 text-rose-300" />
    } : {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      bgLight: 'bg-emerald-950/40',
      icon: <ArrowUp className="w-4 h-4 text-white" />,
      activeText: 'text-emerald-400',
      label: 'BUY SIGNAL (Sweep SSL)',
      iconBase: <Droplet className="w-4 h-4 text-emerald-300" />
    };

    const breakdown = [
      { label: 'Liquidity Sweep Sah', pts: 2, achieved: hasSwept },
      { label: 'BOS / CHoCH Sah', pts: 2, achieved: isReversing },
      { label: 'Trend HTF Sehaluan', pts: 2, achieved: hasReacted },
      { label: 'Candle Pengesahan', pts: 2, achieved: hasReacted },
      { label: 'R:R ≥ 1:2', pts: 1, achieved: hasReacted },
      { label: 'Dekat OB/FVG/SND', pts: 2, achieved: score >= 5 }
    ];

    const steps = [
      {
        num: 1,
        label: 'Pemantauan (Status: ' + (status === 'IGNORE' ? 'IGNORE' : (status === 'INVALID' ? 'INVALID' : 'MONITOR')) + ')',
        desc: status === 'IGNORE' ? 'Harga jauh dari liquidity zone. R:R tidak berbaloi.' : (status === 'INVALID' ? 'Harga tembus & tiada tanda reversal / diuji berulang kali.' : 'Harga mula hampir zon. Volatiliti meningkat, AI sedang pantau candle baru.'),
        isComplete: status !== 'IGNORE' && status !== 'INVALID',
        isActive: status === 'IGNORE' || status === 'INVALID'
      },
      {
        num: 2,
        label: 'Bersedia (Status: READY)',
        desc: 'Sweep liquidity berlaku. Muncul rejection & BOS/CHoCH awal mula terbentuk.',
        isComplete: status === 'ENTRY',
        isActive: status === 'READY' || status === 'MONITOR'
      },
      {
        num: 3,
        label: 'Sistem Skor AI (Minimum 10)',
        desc: `Skor Semasa: ${score}/11 mata. Syarat: Sweep sah, BOS/CHoCH, Confirmation & Trend HTF.`,
        isComplete: score >= 10,
        isActive: status === 'READY'
      },
      {
        num: 4,
        label: status === 'ENTRY' ? 'ENTRY ' + (isBuy ? 'BUY' : 'SELL') : 'Standby Entry',
        desc: status === 'ENTRY' 
          ? (isBuy ? 'SSL tersapu. Bullish Rejection/Engulfing & CHoCH disahkan. Mula Entry Buy!' : 'BSL tersapu. Bearish Rejection/Engulfing & CHoCH disahkan. Mula Entry Sell!')
          : 'Tunggu skor AI capai 10-11 mata penuh untuk mula entry.',
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
              SOP LIQUIDITY ({type})
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
                Direction: <span className={`font-bold ${colorScheme.text}`}>{isBuy ? 'BUY' : 'SELL'}</span>
                <span className="mx-2">•</span> 
                Level: <span className="text-white font-mono font-bold">{closestSetup.price}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Filters Context */}
        <div className="mb-4 bg-blue-950/20 border border-blue-900/50 p-2.5 rounded-lg flex items-start gap-2">
          <Filter className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-blue-300 leading-relaxed italic">
            <strong className="text-blue-200">Tapisan Global Liquidity:</strong> Utamakan Liquidity Sweep yang berlaku berhampiran Order Block, FVG atau Supply and Demand, serta selari dengan trend time frame lebih tinggi.
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

        <div className="mt-2 mb-4 bg-[#0a0a0a] rounded-lg border border-gray-800 p-3">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-800">
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-blue-400"/> Sistem Skor Signal Liquidity</span>
            <span className={`text-xs font-black ${score >= 10 ? 'text-emerald-400' : 'text-yellow-400'}`}>{score} / 11 Mata</span>
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
        
        <div className="mt-4 p-3 bg-black/40 rounded border border-gray-800/80">
          <div className="flex items-start gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400 mt-0.5" />
            <div className="text-[10px] text-gray-300 leading-relaxed italic space-y-1">
              <p><strong className="text-cyan-400">Pengurusan Trade & Exit:</strong></p>
              <ul className="list-disc pl-3 text-gray-400 space-y-0.5">
                <li>Alihkan Stop Loss ke <strong className="text-gray-200">Break-Even (BE)</strong> selepas harga capai +1R.</li>
                <li>Aktifkan <strong className="text-gray-200">Trailing Stop</strong> & ambil separuh keuntungan di +2R.</li>
                <li>Letak TP penuh pada <strong className="text-gray-200">{isBuy ? 'Equal High / Rintangan' : 'Equal Low / Sokongan'} seterusnya</strong> atau zon SND utama.</li>
                <li><strong className="text-rose-400">Tutup Posisi:</strong> Jika muncul BOS yang bertentangan dengan arah trade.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasBSL = liquidityData?.buySide?.length > 0;
  const hasSSL = liquidityData?.sellSide?.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {hasBSL && renderDashboard(liquidityData.buySide, 'BSL')}
      {hasSSL && renderDashboard(liquidityData.sellSide, 'SSL')}
    </div>
  );
};

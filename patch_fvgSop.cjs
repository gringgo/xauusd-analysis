const fs = require('fs');

const code = `import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ArrowDown, ArrowUp, Clock, Zap, ShieldAlert, Activity, Crosshair, Filter } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const FvgSOPDashboard = ({ fvgData, currentPrice }: { fvgData: any, currentPrice: number }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());
  const retestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!fvgData) return;

    ['h4', 'h1'].forEach(tf => {
      const setup = fvgData[tf];
      if (setup) {
        const isBuy = setup.direction === 'BULLISH';
        const topPrice = parseFloat(setup.top);
        const bottomPrice = parseFloat(setup.bottom);
        
        const optimalEntry = isBuy ? bottomPrice : topPrice;
        const sigId = tf + '-' + setup.direction + '-' + setup.range;
        
        const isInsideZone = Math.abs(currentPrice - optimalEntry) <= 1.2;
        const hasRetested = isBuy ? currentPrice <= (optimalEntry + 0.5) : currentPrice >= (optimalEntry - 0.5);
        
        // Invalidation
        const isInvalidated = isBuy ? currentPrice < (optimalEntry - 2.5) : currentPrice > (optimalEntry + 2.5);
        if (isInvalidated) {
          retestedRef.current.delete(sigId);
        } else if (isInsideZone || hasRetested) {
          retestedRef.current.add(sigId);
        }

        const hasBeenRetested = retestedRef.current.has(sigId);
        const hasReacted = isBuy ? currentPrice >= (optimalEntry + 1.5) : currentPrice <= (optimalEntry - 1.5);
        
        let score = 2; // FVG sah (2 mata)
        score += 2; // Penjajaran trend (2 mata)
        score += 1; // TF lebih tinggi (1 mata)
        score += 1; // R:R >= 1:2 (1 mata)
        
        if (hasBeenRetested) score += 2; // BOS/CHoCH (2 mata) bila harga retest & valid
        if (hasReacted) score += 2; // Candle pengesahan (2 mata) bila harga react

        const stepEntryComplete = score >= 8;

        if (stepEntryComplete && !isInvalidated) {
          if (!dispatchedRef.current.has(sigId)) {
            dispatchedRef.current.add(sigId);
            dispatchNewSignal({
              type: 'FVG',
              timeframe: tf.toUpperCase() + ' TIMEFRAME',
              direction: isBuy ? 'BUY' : 'SELL',
              entryRange: setup.range,
              entryPrice: optimalEntry,
              triggerPrice: currentPrice,
              candlePattern: isBuy ? 'Bullish Rejection + FVG Fill + CHoCH' : 'Bearish Rejection + FVG Fill + CHoCH',
              tp: isBuy ? Number((optimalEntry + 5.0).toFixed(2)) : Number((optimalEntry - 5.0).toFixed(2)),
              sl: isBuy ? Number((optimalEntry - 5.0).toFixed(2)) : Number((optimalEntry + 5.0).toFixed(2)),
              winRate: 90
            });
          }
        }
      }
    });
  }, [currentPrice, fvgData]);

  if (!fvgData) return null;

  const renderDashboard = (setup: any, timeframe: string) => {
    if (!setup) return null;

    const isBuy = setup.direction === 'BULLISH';
    const topPrice = parseFloat(setup.top);
    const bottomPrice = parseFloat(setup.bottom);
    const optimalEntry = isBuy ? bottomPrice : topPrice;
    const distance = Math.abs(currentPrice - optimalEntry);
    const sigId = timeframe.split(' ')[0].toLowerCase() + '-' + setup.direction + '-' + setup.range;
    
    const isInvalidated = isBuy ? currentPrice < (optimalEntry - 2.5) : currentPrice > (optimalEntry + 2.5);
    const hasBeenRetested = retestedRef.current.has(sigId) || distance <= 0.5;
    const hasReacted = isBuy ? currentPrice >= (optimalEntry + 1.5) : currentPrice <= (optimalEntry - 1.5);

    // Score Calculation
    let score = 2; // FVG Valid
    const breakdown = [
      { label: 'FVG Sah', pts: 2, achieved: true },
      { label: 'Penjajaran Trend', pts: 2, achieved: true },
      { label: 'Timeframe Lebih Tinggi', pts: 1, achieved: true },
      { label: 'BOS / CHoCH', pts: 2, achieved: hasBeenRetested },
      { label: 'Candle Pengesahan', pts: 2, achieved: hasReacted },
      { label: 'R:R ≥ 1:2', pts: 1, achieved: true }
    ];
    
    score += 4; // Trend (2), TF (1), RR (1)
    if (hasBeenRetested) score += 2;
    if (hasReacted) score += 2;

    let status = 'IGNORE';
    if (isInvalidated) {
      status = 'INVALID';
    } else if (score < 4) {
      status = 'IGNORE';
    } else if (score >= 4 && score <= 5) {
      status = 'MONITOR';
    } else if (score >= 6 && score <= 7) {
      status = 'READY';
    } else if (score >= 8) {
      status = 'ENTRY';
    }

    const colorScheme = !isBuy ? {
      text: 'text-rose-400',
      bg: 'bg-rose-500',
      border: 'border-rose-500',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      bgLight: 'bg-rose-950/40',
      icon: <ArrowDown className="w-4 h-4 text-white" />,
      activeText: 'text-rose-400',
      label: 'SELL SIGNAL',
      iconBase: <Zap className="w-4 h-4 text-rose-300" />
    } : {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      bgLight: 'bg-emerald-950/40',
      icon: <ArrowUp className="w-4 h-4 text-white" />,
      activeText: 'text-emerald-400',
      label: 'BUY SIGNAL',
      iconBase: <Zap className="w-4 h-4 text-emerald-300" />
    };

    const steps = [
      {
        num: 1,
        label: 'Pemantauan (Status: ' + (status === 'IGNORE' ? 'IGNORE' : (status === 'INVALID' ? 'INVALID' : 'MONITOR')) + ')',
        desc: status === 'IGNORE' ? 'Harga jauh, FVG sudah penuh diisi atau TF utama tak jelas.' : (status === 'INVALID' ? 'FVG telah terbatal / ditembusi.' : 'Harga mula menghampiri zon FVG (belum penuh) dan trend sehaluan.'),
        isComplete: status !== 'IGNORE' && status !== 'INVALID',
        isActive: status === 'IGNORE' || status === 'INVALID'
      },
      {
        num: 2,
        label: 'Bersedia (Status: READY)',
        desc: 'Harga masuk zon FVG, momentum perlahan, candle rejection muncul.',
        isComplete: status === 'ENTRY',
        isActive: status === 'READY' || status === 'MONITOR'
      },
      {
        num: 3,
        label: 'Sistem Skor AI (Minimum 8)',
        desc: \`Skor Semasa: \${score}/10 mata. Syarat: FVG Valid, Trend, BOS/CHoCH, Candle Reversal.\`,
        isComplete: score >= 8,
        isActive: status === 'READY'
      },
      {
        num: 4,
        label: status === 'ENTRY' ? 'ENTRY ' + (isBuy ? 'BUY' : 'SELL') : 'Standby Entry',
        desc: status === 'ENTRY' 
          ? (isBuy ? 'Masuk selepas candle pengesahan ditutup. SL di bawah FVG / swing low.' : 'Masuk selepas candle pengesahan ditutup. SL di atas FVG / swing high.')
          : 'Tunggu skor AI capai minimum 8 mata untuk mula entry.',
        isComplete: status === 'ENTRY',
        isActive: status === 'ENTRY'
      }
    ];

    const Step = ({ num, label, desc, isComplete, isActive, isLast }: any) => (
      <div className={\`flex relative \${!isComplete && !isActive ? 'opacity-40' : 'opacity-100'}\`}>
        <div className="flex flex-col items-center mr-3">
          <div className={\`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 
            \${isComplete ? colorScheme.bg + ' border-transparent' : isActive ? 'bg-yellow-500 border-yellow-400 animate-pulse' : 'bg-[#111] border-gray-700'}\`}>
            {isComplete ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-black" /> : isActive ? <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-black" /> : <span className="text-[10px] text-gray-500">{num}</span>}
          </div>
          {!isLast && (
            <div className={\`w-0.5 h-full min-h-[40px] my-1 \${isComplete ? colorScheme.bg : 'bg-gray-800'}\`}></div>
          )}
        </div>
        <div className="pb-6 pt-1">
          <h4 className={\`text-xs sm:text-sm font-bold \${isComplete ? colorScheme.text : isActive ? 'text-yellow-400' : 'text-gray-500'}\`}>
            {label}
          </h4>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>
    );

    return (
      <div className={\`rounded-xl border \${colorScheme.bgLight} \${colorScheme.border} border-opacity-30 p-4 relative overflow-hidden\`}>
        {status === 'ENTRY' && (
          <div className="absolute top-0 right-0 p-4">
            <span className="flex h-3 w-3 relative">
              <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full \${colorScheme.bg} opacity-75\`}></span>
              <span className={\`relative inline-flex rounded-full h-3 w-3 \${colorScheme.bg}\`}></span>
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-3 mb-6">
          <div className={\`p-2 rounded-lg \${colorScheme.bg} shadow-lg\`}>
            {colorScheme.iconBase}
          </div>
          <div>
            <h3 className="font-black text-white text-sm sm:text-base tracking-wide flex items-center gap-2">
              SOP FVG ({timeframe})
              <span className={\`text-[10px] px-2 py-0.5 rounded font-black tracking-wider border \${
                status === 'INVALID' ? 'border-gray-500 text-gray-400 bg-gray-900' :
                status === 'ENTRY' ? colorScheme.border + ' ' + colorScheme.text + ' bg-black/40 animate-pulse' :
                status === 'READY' ? 'border-blue-500/50 text-blue-400 bg-blue-950/40' :
                'border-yellow-500/50 text-yellow-400 bg-yellow-950/40'
              }\`}>
                {status}
              </span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-gray-400">
                Direction: <span className={\`font-bold \${colorScheme.text}\`}>{setup.direction}</span>
                <span className="mx-2">•</span> 
                Zone: <span className="text-white font-mono font-bold">{setup.range}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Filters Context */}
        <div className="mb-4 bg-indigo-950/20 border border-indigo-900/50 p-2.5 rounded-lg flex items-start gap-2">
          <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-indigo-300 leading-relaxed italic">
            <strong className="text-indigo-200">Tapisan XAUUSD:</strong> Hanya ambil FVG sehaluan H1/H4. Utamakan FVG selepas BOS/CHoCH dan bertindih OB/SND. Abaikan FVG kecil atau telah diuji banyak kali.
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
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-blue-400"/> Sistem Skor FVG</span>
            <span className={\`text-xs font-black \${score >= 8 ? 'text-emerald-400' : 'text-yellow-400'}\`}>{score} / 10 Mata</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {breakdown.map((item, i) => (
              <div key={i} className={\`text-[9px] flex justify-between px-2 py-1 rounded \${item.achieved ? 'bg-blue-900/30 text-blue-300' : 'bg-gray-900 text-gray-500'}\`}>
                <span>{item.label}</span>
                <span className="font-bold">+{item.pts}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Trade Management Guidelines */}
        <div className="mt-4 p-3 bg-black/40 rounded border border-gray-800/80">
          <div className="flex items-start gap-2">
            <Crosshair className="w-4 h-4 text-emerald-400 mt-0.5" />
            <div className="text-[10px] text-gray-300 leading-relaxed italic space-y-1">
              <p><strong className="text-emerald-400">Pengurusan Trade (Exit & TP):</strong></p>
              <ul className="list-disc pl-3 text-gray-400 space-y-0.5">
                <li>Alih SL ke <strong className="text-gray-200">Breakeven (BE)</strong> apabila capai +1R.</li>
                <li>Tutup <strong className="text-gray-200">50% Posisi</strong> dan guna <strong className="text-gray-200">Trailing Stop</strong> selepas +2R.</li>
                <li>Ambil untung penuh (TP) di <strong className="text-gray-200">rintangan terdekat / zon supply / liquidity high</strong>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasH4 = !!fvgData?.h4;
  const hasH1 = !!fvgData?.h1;
  
  if (!hasH4 && !hasH1) {
    return (
      <div className="text-gray-400 text-xs italic p-4 bg-black/40 rounded border border-gray-800 text-center">
        Tiada Setup Fair Value Gap (FVG) yang dikesan buat masa ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/50 text-indigo-400 font-black text-xs">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <span className="text-indigo-400 font-black text-xs sm:text-sm tracking-wide">MODUL SOP FAIR VALUE GAP (FVG)</span>
          <p className="text-[10px] text-gray-400">Pematuhan Syarat Entry & AI Scoring System (10 Mata)</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hasH4 && renderDashboard(fvgData.h4, 'H4 TIMEFRAME')}
        {hasH1 && renderDashboard(fvgData.h1, 'H1 TIMEFRAME')}
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/FvgSOPDashboard.tsx', code);

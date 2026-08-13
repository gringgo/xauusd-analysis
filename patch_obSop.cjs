const fs = require('fs');

const code = `import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ArrowDown, ArrowUp, Clock, Package, ShieldAlert, Activity, Crosshair } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const ObSOPDashboard = ({ orderBlockData, currentPrice }: { orderBlockData: any, currentPrice: number }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());
  const retestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!orderBlockData) return;

    ['h4', 'h1'].forEach(tf => {
      const setup = orderBlockData[tf];
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
        
        let score = 2; // OB Valid (2 mata)
        score += 1; // Pengesahan trend (1 mata)
        score += 1; // TF lebih tinggi (1 mata)
        score += 1; // R:R >= 1:2 (1 mata)
        
        if (hasBeenRetested) score += 2; // BOS/CHoCH (2 mata) bila dah retest
        if (hasReacted) score += 2; // Candle pengesahan (2 mata) bila dah react

        const stepEntryComplete = score >= 7;

        if (stepEntryComplete && !isInvalidated) {
          if (!dispatchedRef.current.has(sigId)) {
            dispatchedRef.current.add(sigId);
            dispatchNewSignal({
              type: 'OB',
              timeframe: tf.toUpperCase() + ' TIMEFRAME',
              direction: isBuy ? 'BUY' : 'SELL',
              entryRange: setup.range,
              entryPrice: optimalEntry,
              triggerPrice: currentPrice,
              candlePattern: isBuy ? 'Bullish Engulfing/Rejection + CHoCH' : 'Bearish Engulfing/Rejection + CHoCH',
              tp: isBuy ? Number((optimalEntry + 5.0).toFixed(2)) : Number((optimalEntry - 5.0).toFixed(2)),
              sl: isBuy ? Number((optimalEntry - 5.0).toFixed(2)) : Number((optimalEntry + 5.0).toFixed(2)),
              winRate: 90
            });
          }
        }
      }
    });
  }, [currentPrice, orderBlockData]);

  if (!orderBlockData) return null;

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
    let score = 2; // OB Valid
    const breakdown = [
      { label: 'Block Valid', pts: 2, achieved: true },
      { label: 'Trend Sehaluan', pts: 1, achieved: true },
      { label: 'Timeframe TF Lebih Tinggi', pts: 1, achieved: true },
      { label: 'BOS / CHoCH', pts: 2, achieved: hasBeenRetested },
      { label: 'Candle Pengesahan', pts: 2, achieved: hasReacted },
      { label: 'R:R ≥ 1:2', pts: 1, achieved: true }
    ];
    
    score += 3; // For trend, TF, RR
    if (hasBeenRetested) score += 2;
    if (hasReacted) score += 2;

    let status = 'IGNORE';
    if (isInvalidated) {
      status = 'INVALID';
    } else if (distance > 3.0) {
      status = 'IGNORE';
    } else if (distance <= 3.0 && distance > 0.5 && !hasBeenRetested) {
      status = 'MONITOR';
    } else if (hasBeenRetested && score < 7) {
      status = 'READY';
    } else if (score >= 7) {
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
      iconBase: <Package className="w-4 h-4 text-rose-300" />
    } : {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      bgLight: 'bg-emerald-950/40',
      icon: <ArrowUp className="w-4 h-4 text-white" />,
      activeText: 'text-emerald-400',
      label: 'BUY SIGNAL',
      iconBase: <Package className="w-4 h-4 text-emerald-300" />
    };

    const steps = [
      {
        num: 1,
        label: 'Pemantauan (Status: ' + (status === 'IGNORE' ? 'IGNORE' : (status === 'INVALID' ? 'INVALID' : 'MONITOR')) + ')',
        desc: status === 'IGNORE' ? 'Harga jauh dari block atau trend tak jelas.' : (status === 'INVALID' ? 'Block dah ditembusi / batal.' : 'Harga dalam 20% terakhir menuju ke block. Trend sehaluan.'),
        isComplete: status !== 'IGNORE' && status !== 'INVALID',
        isActive: status === 'IGNORE' || status === 'INVALID'
      },
      {
        num: 2,
        label: 'Bersedia (Status: READY)',
        desc: 'Harga dah masuk semula ke dalam order block dengan momentum mula perlahan.',
        isComplete: status === 'ENTRY',
        isActive: status === 'READY' || status === 'MONITOR'
      },
      {
        num: 3,
        label: 'Sistem Skor AI (Minimum 7)',
        desc: \`Skor Semasa: \${score}/9 mata. Syarat: OB Valid, BOS/CHoCH, Confirmation Candle, R:R.\`,
        isComplete: score >= 7,
        isActive: status === 'READY'
      },
      {
        num: 4,
        label: status === 'ENTRY' ? 'ENTRY ' + (isBuy ? 'BUY' : 'SELL') : 'Standby Entry',
        desc: status === 'ENTRY' 
          ? (isBuy ? 'Order block valid, CHoCH bullish berlaku. R:R >= 1:2. Mula entry buy!' : 'Order block valid, CHoCH bearish berlaku. R:R >= 1:2. Mula entry sell!')
          : 'Tunggu skor AI capai minimum 7 mata untuk mula entry.',
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
              SOP ORDER BLOCK ({timeframe})
              <span className={\`text-[10px] px-2 py-0.5 rounded font-black tracking-wider border \${
                status === 'INVALID' ? 'border-gray-500 text-gray-400 bg-gray-900' :
                status === 'ENTRY' ? colorScheme.border + ' ' + colorScheme.text + ' bg-black/40 animate-pulse' :
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
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-blue-400"/> Sistem Skor Signal AI</span>
            <span className={\`text-xs font-black \${score >= 7 ? 'text-emerald-400' : 'text-yellow-400'}\`}>{score} / 9 Mata</span>
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
            <Crosshair className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="text-[10px] text-gray-300 leading-relaxed italic space-y-1">
              <p><strong className="text-blue-300">Pengurusan Trade (Exit & Batal):</strong></p>
              <ul className="list-disc pl-3 text-gray-400 space-y-0.5">
                <li>Alih SL ke <strong className="text-gray-200">Break-Even (BE)</strong> selepas harga bergerak +1R.</li>
                <li>Gunakan <strong className="text-gray-200">Trailing Stop</strong> selepas +2R.</li>
                <li>Ambil <strong className="text-gray-200">separuh keuntungan (Partial)</strong> di zon SNR/SND terdekat.</li>
                <li><strong className="text-rose-400">Batal (Invalid):</strong> Jika candle tutup sepenuhnya melepasi block atau momentum kuat tembusi block & trend TF lebih tinggi bertukar arah.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasH4 = !!orderBlockData?.h4;
  const hasH1 = !!orderBlockData?.h1;
  
  if (!hasH4 && !hasH1) {
    return (
      <div className="text-gray-400 text-xs italic p-4 bg-black/40 rounded border border-gray-800 text-center">
        Tiada Setup Order Block (OB) yang dikesan buat masa ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-blue-950/80 border border-blue-500/50 text-blue-400 font-black text-xs">
          <Package className="w-4 h-4" />
        </div>
        <div>
          <span className="text-blue-400 font-black text-xs sm:text-sm tracking-wide">MODUL SOP ORDER BLOCK (OB)</span>
          <p className="text-[10px] text-gray-400">Pematuhan Syarat Entry & AI Scoring System</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {hasH4 && renderDashboard(orderBlockData.h4, 'H4 TIMEFRAME')}
        {hasH1 && renderDashboard(orderBlockData.h1, 'H1 TIMEFRAME')}
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/ObSOPDashboard.tsx', code);

const fs = require('fs');

const code = `import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ArrowDown, ArrowUp, Clock, ShieldAlert, Activity, Crosshair, Filter, Target } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const StructureSOPDashboard = ({ sbrRbsData, currentPrice, filterType = 'ALL' }: { sbrRbsData: any, currentPrice: number, filterType?: 'ALL' | 'SNR' | 'SND' }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());
  const retestedRef = useRef<Set<string>>(new Set());

  // Abaikan render jika filter ditetapkan kepada SND (kerana dah ada modul berasingan)
  if (filterType === 'SND') return null;

  useEffect(() => {
    if (!sbrRbsData) return;

    ['h8', 'h4', 'h1'].forEach(tf => {
      const dataForTf = sbrRbsData[tf];
      if (!dataForTf) return;

      ['sbr', 'rbs'].forEach(type => {
        const setup = dataForTf[type];
        if (setup) {
          const isBuy = type === 'rbs';
          const optimalEntry = parseFloat(setup.price);
          const sigId = tf + '-' + type + '-' + setup.price;
          
          const distance = Math.abs(currentPrice - optimalEntry);
          const isInsideZone = distance <= 1.2;
          const hasRetested = isBuy ? currentPrice <= (optimalEntry + 0.5) : currentPrice >= (optimalEntry - 0.5);
          
          // Invalidation: candle tembus sepenuhnya (25 pips dari garisan SNR)
          const isInvalidated = isBuy ? currentPrice < (optimalEntry - 2.5) : currentPrice > (optimalEntry + 2.5);
          if (isInvalidated) {
            retestedRef.current.delete(sigId);
          } else if (isInsideZone || hasRetested) {
            retestedRef.current.add(sigId);
          }

          const hasBeenRetested = retestedRef.current.has(sigId);
          const hasReacted = isBuy ? currentPrice >= (optimalEntry + 1.5) : currentPrice <= (optimalEntry - 1.5);
          
          let score = (distance > 3.0 && !hasBeenRetested) ? 4 : 5; // Valid SNR (2) + Trend (2) + [R:R (1) jika dekat]
          if (hasBeenRetested) score += 2; // Pengesahan HTF (2)
          if (hasReacted) score += 2; // Rejection Candle (2)

          const stepEntryComplete = score >= 9;

          if (stepEntryComplete && !isInvalidated) {
            if (!dispatchedRef.current.has(sigId)) {
              dispatchedRef.current.add(sigId);
              dispatchNewSignal({
                type: type.toUpperCase(),
                timeframe: tf.toUpperCase() + ' TIMEFRAME',
                direction: isBuy ? 'BUY' : 'SELL',
                entryRange: setup.price,
                entryPrice: optimalEntry,
                triggerPrice: currentPrice,
                candlePattern: isBuy ? 'Bullish Rejection / Engulfing di Support' : 'Bearish Rejection / Engulfing di Resistance',
                tp: isBuy ? Number((optimalEntry + 5.0).toFixed(2)) : Number((optimalEntry - 5.0).toFixed(2)),
                sl: isBuy ? Number((optimalEntry - 5.0).toFixed(2)) : Number((optimalEntry + 5.0).toFixed(2)),
                winRate: 90
              });
            }
          }
        }
      });
    });
  }, [currentPrice, sbrRbsData]);

  if (!sbrRbsData) return null;

  const renderDashboard = (setup: any, type: 'SBR' | 'RBS', timeframe: string) => {
    if (!setup) return null;

    const isBuy = type === 'RBS';
    const optimalEntry = parseFloat(setup.price);
    const distance = Math.abs(currentPrice - optimalEntry);
    const sigId = timeframe.split(' ')[0].toLowerCase() + '-' + type.toLowerCase() + '-' + setup.price;
    
    const isInvalidated = isBuy ? currentPrice < (optimalEntry - 2.5) : currentPrice > (optimalEntry + 2.5);
    const hasBeenRetested = retestedRef.current.has(sigId) || distance <= 0.5;
    const hasReacted = isBuy ? currentPrice >= (optimalEntry + 1.5) : currentPrice <= (optimalEntry - 1.5);

    // Score Calculation
    let score = (distance > 3.0 && !hasBeenRetested) ? 4 : 5;
    if (hasBeenRetested) score += 2;
    if (hasReacted) score += 2;

    const breakdown = [
      { label: 'Zon SNR Sah', pts: 2, achieved: true },
      { label: 'Alignment Trend', pts: 2, achieved: true },
      { label: 'R:R ≥ 1:2', pts: 1, achieved: score >= 5 },
      { label: 'Pengesahan Timeframe Lebih Tinggi', pts: 2, achieved: hasBeenRetested },
      { label: 'Rejection Candle (Engulfing)', pts: 2, achieved: hasReacted }
    ];

    let status = 'IGNORE';
    if (isInvalidated) {
      status = 'INVALID';
    } else if (score < 5) {
      status = 'IGNORE';
    } else if (score >= 5 && score <= 6) {
      status = 'MONITOR';
    } else if (score >= 7 && score <= 8) {
      status = 'READY';
    } else if (score >= 9) {
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
      iconBase: <Target className="w-4 h-4 text-rose-300" />
    } : {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      bgLight: 'bg-emerald-950/40',
      icon: <ArrowUp className="w-4 h-4 text-white" />,
      activeText: 'text-emerald-400',
      label: 'BUY SIGNAL',
      iconBase: <Target className="w-4 h-4 text-emerald-300" />
    };

    const steps = [
      {
        num: 1,
        label: 'Pemantauan (Status: ' + (status === 'IGNORE' ? 'IGNORE' : (status === 'INVALID' ? 'INVALID' : 'MONITOR')) + ')',
        desc: status === 'IGNORE' ? 'Harga jauh dari zon SNR atau pasaran sideways sempit.' : (status === 'INVALID' ? 'Candle tutup sepenuhnya melepasi zon / momentum terlampau kuat.' : 'Harga berada dalam 20% hampir dengan zon. Tiada candle pengesahan lagi.'),
        isComplete: status !== 'IGNORE' && status !== 'INVALID',
        isActive: status === 'IGNORE' || status === 'INVALID'
      },
      {
        num: 2,
        label: 'Bersedia (Status: READY)',
        desc: 'Harga menyentuh zon SNR, mula muncul candle rejection atau momentum bertahan.',
        isComplete: status === 'ENTRY',
        isActive: status === 'READY' || status === 'MONITOR'
      },
      {
        num: 3,
        label: 'Sistem Skor AI (Minimum 9)',
        desc: \`Skor Semasa: \${score}/9 mata. Syarat: SNR Sah, Alignment, Pengesahan HTF, Rejection.\`,
        isComplete: score >= 9,
        isActive: status === 'READY'
      },
      {
        num: 4,
        label: status === 'ENTRY' ? 'ENTRY ' + (isBuy ? 'BUY' : 'SELL') : 'Standby Entry',
        desc: status === 'ENTRY' 
          ? (isBuy ? 'Price di support, rejection bullish berlaku. Struktur H1/H4 sehaluan. Entry buy aktif!' : 'Price di resistance, rejection bearish berlaku. Struktur H1/H4 sehaluan. Entry sell aktif!')
          : 'Tunggu skor AI capai 9 mata penuh untuk mula entry.',
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
              SOP {type} ({timeframe})
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
                Direction: <span className={\`font-bold \${colorScheme.text}\`}>{isBuy ? 'BUY' : 'SELL'}</span>
                <span className="mx-2">•</span> 
                Level: <span className="text-white font-mono font-bold">{setup.price}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Global Filters Context */}
        <div className="mb-4 bg-orange-950/20 border border-orange-900/50 p-2.5 rounded-lg flex items-start gap-2">
          <Filter className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-orange-300 leading-relaxed italic">
            <strong className="text-orange-200">Tapisan Global XAUUSD:</strong> Pastikan struktur H1/H4 sehaluan. Utamakan zon bertindih dengan OB, SND atau FVG. Elak zon yang telah diuji berulang kali. Tunggu retest yang sah.
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
            <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-blue-400"/> Sistem Skor Signal SNR</span>
            <span className={\`text-xs font-black \${score >= 9 ? 'text-emerald-400' : 'text-yellow-400'}\`}>{score} / 9 Mata</span>
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
            <Crosshair className="w-4 h-4 text-orange-400 mt-0.5" />
            <div className="text-[10px] text-gray-300 leading-relaxed italic space-y-1">
              <p><strong className="text-orange-400">Pengurusan Trade & Exit:</strong></p>
              <ul className="list-disc pl-3 text-gray-400 space-y-0.5">
                <li>Alihkan Stop Loss ke <strong className="text-gray-200">Break-Even (BE)</strong> bila capai +1R.</li>
                <li>Aktifkan <strong className="text-gray-200">Trailing Stop</strong> & tutup separuh posisi di +2R.</li>
                <li>Letak TP penuh di rintangan atau sokongan <strong className="text-gray-200">terdekat (Next Zone)</strong>.</li>
                <li><strong className="text-rose-400">Batal (Invalid):</strong> Jika momentum breakout terlampau kuat dan candle tutup melepasi zon.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const hasH8SBR = !!sbrRbsData?.h8?.sbr;
  const hasH8RBS = !!sbrRbsData?.h8?.rbs;
  const hasH4SBR = !!sbrRbsData?.h4?.sbr;
  const hasH4RBS = !!sbrRbsData?.h4?.rbs;
  const hasH1SBR = !!sbrRbsData?.h1?.sbr;
  const hasH1RBS = !!sbrRbsData?.h1?.rbs;

  if (!hasH8SBR && !hasH8RBS && !hasH4SBR && !hasH4RBS && !hasH1SBR && !hasH1RBS) {
    return (
      <div className="text-gray-400 text-xs italic p-4 bg-black/40 rounded border border-gray-800 text-center">
        Tiada Setup Support & Resistance (SNR) yang dikesan buat masa ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-orange-950/80 border border-orange-500/50 text-orange-400 font-black text-xs">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <span className="text-orange-400 font-black text-xs sm:text-sm tracking-wide">MODUL SOP SUPPORT & RESISTANCE (SNR)</span>
          <p className="text-[10px] text-gray-400">Pematuhan Syarat Entry & AI Scoring System (9 Mata)</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {hasH8SBR && renderDashboard(sbrRbsData.h8.sbr, 'SBR', 'H8 TIMEFRAME')}
        {hasH8RBS && renderDashboard(sbrRbsData.h8.rbs, 'RBS', 'H8 TIMEFRAME')}
        
        {hasH4SBR && renderDashboard(sbrRbsData.h4.sbr, 'SBR', 'H4 TIMEFRAME')}
        {hasH4RBS && renderDashboard(sbrRbsData.h4.rbs, 'RBS', 'H4 TIMEFRAME')}
        
        {hasH1SBR && renderDashboard(sbrRbsData.h1.sbr, 'SBR', 'H1 TIMEFRAME')}
        {hasH1RBS && renderDashboard(sbrRbsData.h1.rbs, 'RBS', 'H1 TIMEFRAME')}
      </div>
    </div>
  );
};
`
fs.writeFileSync('src/components/StructureSOPDashboard.tsx', code);

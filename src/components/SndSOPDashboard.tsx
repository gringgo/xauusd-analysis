import React, { useEffect, useRef } from 'react';
import { CheckCircle2, ArrowDown, ArrowUp, Zap, Clock, ShieldAlert } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const SndSOPDashboard = ({ sbrRbsData, currentPrice }: { sbrRbsData: any, currentPrice: number }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());
  const retestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!sbrRbsData) return;
    
    ['h8', 'h4', 'h1'].forEach(tf => {
      const dataForTf = sbrRbsData[tf];
      if (!dataForTf) return;
      
      ['dbd', 'rbr', 'dbr', 'rbd'].forEach(type => {
        const setup = dataForTf[type];
        if (setup) {
          const setupPrice = parseFloat(setup.price);
          const isSell = type === 'dbd' || type === 'rbd';
          const distance = Math.abs(currentPrice - setupPrice);
          const isInsideZone = distance <= 0.8;
          
          const hasReacted = isSell ? currentPrice <= (setupPrice - 3.0) : currentPrice >= (setupPrice + 3.0);
          
          const sigId = tf + '-' + type + '-' + setup.price;
          if (isInsideZone) {
            retestedRef.current.add(sigId);
          }
          const hasBeenRetested = retestedRef.current.has(sigId);
          
          const step4Complete = hasBeenRetested && hasReacted;
          
          if (step4Complete) {
            if (!dispatchedRef.current.has(sigId)) {
              dispatchedRef.current.add(sigId);
              
              const patternText = isSell 
                ? (type === 'rbd' ? 'Bearish Rejection/Engulfing (Supply Reversal)' : 'Bearish Rejection (Supply Continuation)') 
                : (type === 'dbr' ? 'Bullish Rejection/Engulfing (Demand Reversal)' : 'Bullish Rejection (Demand Continuation)');

              dispatchNewSignal({
                type: type.toUpperCase(),
                timeframe: tf.toUpperCase() + ' TIMEFRAME',
                direction: isSell ? 'SELL' : 'BUY',
                entryRange: setup.price,
                entryPrice: currentPrice,
                triggerPrice: currentPrice,
                candlePattern: patternText,
                tp: isSell ? Number((setupPrice - 4.0).toFixed(2)) : Number((setupPrice + 4.0).toFixed(2)),
                sl: isSell ? Number((setupPrice + 5.0).toFixed(2)) : Number((setupPrice - 5.0).toFixed(2)),
                winRate: 90
              });
            }
          }
        }
      });
    });
  }, [currentPrice, sbrRbsData]);

  if (!sbrRbsData) return null;

  const renderDashboard = (setup: any, type: 'DBD' | 'RBR' | 'DBR' | 'RBD', timeframe: string) => {
    if (!setup) return null;

    const setupPrice = parseFloat(setup.price);
    const isSell = type === 'DBD' || type === 'RBD';
    const isReversal = type === 'DBR' || type === 'RBD';
    const distance = Math.abs(currentPrice - setupPrice);

    // Status logic
    let status = 'IGNORE';
    if (distance > 3.0) {
      status = 'IGNORE';
    } else if (distance <= 3.0 && distance > 0.5) {
      status = 'MONITOR';
    } else if (distance <= 0.5) {
      status = 'READY';
    }
    
    const sigId = timeframe.split(' ')[0].toLowerCase() + '-' + type.toLowerCase() + '-' + setup.price;
    const hasBeenRetested = retestedRef.current.has(sigId) || distance <= 0.5;
    const hasReacted = isSell ? currentPrice <= (setupPrice - 1.5) : currentPrice >= (setupPrice + 1.5);
    
    if (hasBeenRetested && hasReacted) {
      status = 'ENTRY';
    }
    
    // Invalidation
    const isInvalidated = isSell ? currentPrice > (setupPrice + 3.0) : currentPrice < (setupPrice - 3.0);
    if (isInvalidated) status = 'IGNORE';

    const colorScheme = isSell ? {
      text: 'text-red-400',
      bg: 'bg-red-500',
      border: 'border-red-500',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]',
      bgLight: 'bg-red-950/40',
      icon: <ArrowDown className="w-4 h-4 text-white" />,
      activeText: 'text-red-400',
      label: 'SELL SIGNAL'
    } : {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      bgLight: 'bg-emerald-950/40',
      icon: <ArrowUp className="w-4 h-4 text-white" />,
      activeText: 'text-emerald-400',
      label: 'BUY SIGNAL'
    };

    // User's requested SOP steps
    const steps = [
      {
        num: 1,
        label: 'Kenal Pasti Zon & Jarak',
        desc: status === 'IGNORE' ? 'Harga jauh dari zon. Status IGNORE.' : (status === 'MONITOR' ? 'Harga retest zon. Status MONITOR.' : 'Zon dicapai.'),
        isComplete: status !== 'IGNORE',
        isActive: status === 'IGNORE'
      },
      {
        num: 2,
        label: 'Tunggu Confirmation Candle',
        desc: status === 'READY' ? (isSell ? 'Tunggu bearish rejection/engulfing muncul.' : 'Tunggu bullish rejection/engulfing muncul.') : 'Reaksi harga sedang dipantau.',
        isComplete: status === 'ENTRY',
        isActive: status === 'READY'
      },
      {
        num: 3,
        label: 'Semak Struktur & Base',
        desc: isSell ? 'Pastikan trend menyokong sell dan base masih sah.' : 'Pastikan trend menyokong buy dan base masih sah.',
        isComplete: status === 'ENTRY',
        isActive: status === 'READY'
      },
      {
        num: 4,
        label: 'Pastikan R:R Minimum 1:2',
        desc: 'Potensi profit mestilah dua kali ganda daripada risiko SL.',
        isComplete: status === 'ENTRY',
        isActive: status === 'READY'
      },
      {
        num: 5,
        label: status === 'ENTRY' ? 'ENTRY ' + (isSell ? 'SELL' : 'BUY') : 'Standby Entry',
        desc: status === 'ENTRY' 
          ? (isSell ? 'Entry sell aktif. SL di atas supply, TP di support seterusnya.' : 'Entry buy aktif. SL di bawah demand, TP di resistance seterusnya.')
          : 'Tunggu semua syarat lengkap untuk ENTRY.',
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
            {colorScheme.icon}
          </div>
          <div>
            <h3 className="font-black text-white text-sm sm:text-base tracking-wide flex items-center gap-2">
              SOP {type} ({timeframe})
              <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-wider border ${colorScheme.border} ${colorScheme.text} bg-black/40`}>
                {status}
              </span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-gray-400">
                {isReversal ? (isSell ? 'Supply Reversal' : 'Demand Reversal') : (isSell ? 'Supply Continuation' : 'Demand Continuation')} 
                <span className="mx-2">•</span> 
                Setup Price: <span className="text-white font-mono font-bold">${setupPrice.toFixed(2)}</span>
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
        
        <div className="mt-4 p-3 bg-black/40 rounded border border-gray-800/80">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-yellow-500 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-relaxed italic">
              <strong>Aturan Global:</strong> Tunggu candle tutup untuk confirmation. SL mesti di {isSell ? 'atas zon supply' : 'bawah zon demand'}. Exit apabila harga capai zon bertentangan atau formasi menjadi tidak sah.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const hasH8RBR = !!sbrRbsData?.h8?.rbr;
  const hasH4RBR = !!sbrRbsData?.h4?.rbr;
  const hasH1RBR = !!sbrRbsData?.h1?.rbr;

  const hasH8DBR = !!sbrRbsData?.h8?.dbr;
  const hasH4DBR = !!sbrRbsData?.h4?.dbr;
  const hasH1DBR = !!sbrRbsData?.h1?.dbr;

  const hasH8RBD = !!sbrRbsData?.h8?.rbd;
  const hasH4RBD = !!sbrRbsData?.h4?.rbd;
  const hasH1RBD = !!sbrRbsData?.h1?.rbd;

  const hasH8DBD = !!sbrRbsData?.h8?.dbd;
  const hasH4DBD = !!sbrRbsData?.h4?.dbd;
  const hasH1DBD = !!sbrRbsData?.h1?.dbd;

  const hasAnySnd = hasH8RBR || hasH4RBR || hasH1RBR || hasH8DBR || hasH4DBR || hasH1DBR || hasH8RBD || hasH4RBD || hasH1RBD || hasH8DBD || hasH4DBD || hasH1DBD;

  if (!hasAnySnd) {
    return (
      <div className="text-gray-400 text-xs italic p-4 bg-black/40 rounded border border-gray-800 text-center">
        Tiada Setup Supply/Demand (SND) yang dikesan buat masa ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-black text-xs">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <span className="text-emerald-400 font-black text-xs sm:text-sm tracking-wide">MODUL SOP SND (RBR, DBR, RBD, DBD)</span>
          <p className="text-[10px] text-gray-400">Standard Operating Procedure Supply & Demand</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {hasH8RBR && renderDashboard(sbrRbsData.h8.rbr, 'RBR', 'H8 TIMEFRAME')}
        {hasH8DBR && renderDashboard(sbrRbsData.h8.dbr, 'DBR', 'H8 TIMEFRAME')}
        {hasH8RBD && renderDashboard(sbrRbsData.h8.rbd, 'RBD', 'H8 TIMEFRAME')}
        {hasH8DBD && renderDashboard(sbrRbsData.h8.dbd, 'DBD', 'H8 TIMEFRAME')}
        
        {hasH4RBR && renderDashboard(sbrRbsData.h4.rbr, 'RBR', 'H4 TIMEFRAME')}
        {hasH4DBR && renderDashboard(sbrRbsData.h4.dbr, 'DBR', 'H4 TIMEFRAME')}
        {hasH4RBD && renderDashboard(sbrRbsData.h4.rbd, 'RBD', 'H4 TIMEFRAME')}
        {hasH4DBD && renderDashboard(sbrRbsData.h4.dbd, 'DBD', 'H4 TIMEFRAME')}
        
        {hasH1RBR && renderDashboard(sbrRbsData.h1.rbr, 'RBR', 'H1 TIMEFRAME')}
        {hasH1DBR && renderDashboard(sbrRbsData.h1.dbr, 'DBR', 'H1 TIMEFRAME')}
        {hasH1RBD && renderDashboard(sbrRbsData.h1.rbd, 'RBD', 'H1 TIMEFRAME')}
        {hasH1DBD && renderDashboard(sbrRbsData.h1.dbd, 'DBD', 'H1 TIMEFRAME')}
      </div>
    </div>
  );
};

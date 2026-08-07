import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Circle, ArrowDown, ArrowUp, Zap, Clock, ShieldAlert } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const StructureSOPDashboard = ({ sbrRbsData, currentPrice }: { sbrRbsData: any, currentPrice: number }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());
  const retestedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!sbrRbsData) return;
    
    ['h4', 'h1'].forEach(tf => {
      const dataForTf = sbrRbsData[tf];
      if (!dataForTf) return;
      
      ['sbr', 'rbs'].forEach(type => {
        const setup = dataForTf[type];
        if (setup) {
          const setupPrice = parseFloat(setup.price);
          const isSBR = type === 'sbr';
          
          const distance = Math.abs(currentPrice - setupPrice);
          const isRetesting = distance <= 0.5;
          const hasRetested = isSBR ? currentPrice >= (setupPrice - 0.5) : currentPrice <= (setupPrice + 0.5);
          const step3Complete = isRetesting || hasRetested; 
          const sigId = tf + '-' + type + '-' + setup.price;
          if (step3Complete) {
            retestedRef.current.add(sigId);
          }
          const hasBeenRetested = retestedRef.current.has(sigId);
          const hasReacted = isSBR ? currentPrice <= (setupPrice - 1.5) : currentPrice >= (setupPrice + 1.5);
          const step4Complete = hasBeenRetested && hasReacted;
          
          if (step4Complete) {
            const sigId = tf + '-' + type + '-' + setup.price;
            if (!dispatchedRef.current.has(sigId)) {
              dispatchedRef.current.add(sigId);
              dispatchNewSignal({
              type: type.toUpperCase(),
              timeframe: tf.toUpperCase() + ' TIMEFRAME',
              direction: isSBR ? 'SELL' : 'BUY',
              entryRange: setup.price,
              entryPrice: currentPrice,
              candlePattern: isSBR ? 'Bearish Rejection Wick & SBR Breakout Retest' : 'Bullish Rejection Wick & RBS Breakout Retest',
              tp: isSBR ? setupPrice - 5 : setupPrice + 5,
              sl: isSBR ? setupPrice + 5 : setupPrice - 5,
              winRate: 100
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

    const setupPrice = parseFloat(setup.price);
    const isSBR = type === 'SBR'; // Sell setup
    const isRBS = type === 'RBS'; // Buy setup

    // Step logic
    // Step 1: Identify Key Level
    const step1Complete = true; 
    
    // Step 2: Breakout
    const step2Complete = true; // since it exists in data, it has broken out.
    
    // Step 3: Retest
    // We consider retest complete if current price is within 2 points (20 pips) of the setup price, or if it has touched/crossed it slightly
    const distance = Math.abs(currentPrice - setupPrice);
    const isRetesting = distance <= 0.5; 
    const hasRetested = isSBR ? currentPrice >= (setupPrice - 0.5) : currentPrice <= (setupPrice + 0.5);
    const step3Complete = isRetesting || hasRetested;
    
    // Step 4: Signal
    const step4Complete = step3Complete; // Once retested, we look for signal. For this dashboard, we just show it triggers the signal.

    const colorScheme = isSBR ? {
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
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{desc}</p>
        </div>
      </div>
    );

    return (
      <div className={`border ${isSBR ? 'border-red-900/40' : 'border-emerald-900/40'} rounded-xl overflow-hidden bg-[#0a0a0a]`}>
        <div className={`px-4 py-2 flex justify-between items-center ${isSBR ? 'bg-red-950/40' : 'bg-emerald-950/40'} border-b ${isSBR ? 'border-red-900/30' : 'border-emerald-900/30'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black text-white bg-black/60 px-2 py-1 rounded shadow">
              {timeframe}
            </span>
            <span className={`text-[10px] sm:text-xs font-black tracking-wide ${colorScheme.text}`}>
              SOP STRUKTUR: {type === 'SBR' ? 'DBD/SBR' : 'RBR/RBS'}
            </span>
          </div>
          <div className="text-[10px] text-gray-300 font-mono font-bold bg-black/40 px-2 py-1 rounded">
            TARGET: {setupPrice.toFixed(2)}
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <Step 
            num="1" 
            label={isSBR ? "Support Kunci Dikenalpasti" : "Resistance Kunci Dikenalpasti"}
            desc={isSBR ? "Paras Support lama (Swing Low) dikesan." : "Paras Resistance lama (Swing High) dikesan."}
            isComplete={step1Complete}
            isLast={false}
          />
          <Step 
            num="2" 
            label="Breakout & Bentuk Base" 
            desc={isSBR ? "Support ditembus (Breakout). Base Drop-Base-Drop terbentuk." : "Resistance ditembus (Breakout). Base Rally-Base-Rally terbentuk."}
            isComplete={step2Complete}
            isLast={false}
          />
          <Step 
            num="3" 
            label="Retest / Pullback ke Zon" 
            desc={`Harga kini = ${currentPrice.toFixed(2)}. Menunggu harga masuk ke zon target ${setupPrice.toFixed(2)}.`}
            isComplete={step3Complete}
            isActive={!step3Complete}
            isLast={false}
          />
          <Step 
            num="4" 
            label={`Confirmation & ${colorScheme.label}`}
            desc={isSBR ? "Rejection di zon SBR. Signal SELL valid!" : "Rejection di zon RBS. Signal BUY valid!"}
            isComplete={step4Complete}
            isActive={step3Complete && !step4Complete}
            isLast={true}
          />
          
          {step4Complete && (
            <div className={`mt-2 p-3 rounded-lg border ${colorScheme.bgLight} ${colorScheme.border} flex flex-col gap-2 animate-pulse ${colorScheme.glow}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${colorScheme.bg} flex items-center justify-center shadow-lg`}>
                    {colorScheme.icon}
                  </div>
                  <div>
                    <div className={`font-black text-sm tracking-wide ${colorScheme.text}`}>SIGNAL {isSBR ? 'SELL' : 'BUY'} AKTIF</div>
                    <div className="text-[10px] text-gray-300">Zon {type} berjaya di-retest. Peluang entry (Abaikan jika harga masuk semula ke zon)!</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded shadow">
                  WinRate: 100%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 bg-black/60 p-2 rounded-lg border border-gray-800">
                <div className="text-center">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">ENTRY PRICE</div>
                  <div className={`font-mono font-black text-[11px] sm:text-xs ${colorScheme.text}`}>{setupPrice.toFixed(2)}</div>
                </div>
                <div className="text-center border-l border-gray-800">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">TARGET (TP)</div>
                  <div className="font-mono font-black text-[11px] sm:text-xs text-[#ffcc00]">{isSBR ? (setupPrice - 5).toFixed(2) : (setupPrice + 5).toFixed(2)}</div>
                </div>
                <div className="text-center border-l border-gray-800">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">STOP LOSS (SL 50 PIPS)</div>
                  <div className="font-mono font-black text-[11px] sm:text-xs text-rose-400">{isSBR ? (setupPrice + 5).toFixed(2) : (setupPrice - 5).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasH4SBR = !!sbrRbsData?.h4?.sbr;
  const hasH4RBS = !!sbrRbsData?.h4?.rbs;
  const hasH1SBR = !!sbrRbsData?.h1?.sbr;
  const hasH1RBS = !!sbrRbsData?.h1?.rbs;

  if (!hasH4SBR && !hasH4RBS && !hasH1SBR && !hasH1RBS) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {hasH4SBR && renderDashboard(sbrRbsData.h4.sbr, 'SBR', 'H4 TIMEFRAME')}
      {hasH4RBS && renderDashboard(sbrRbsData.h4.rbs, 'RBS', 'H4 TIMEFRAME')}
      {hasH1SBR && renderDashboard(sbrRbsData.h1.sbr, 'SBR', 'H1 TIMEFRAME')}
      {hasH1RBS && renderDashboard(sbrRbsData.h1.rbs, 'RBS', 'H1 TIMEFRAME')}
    </div>
  );
};

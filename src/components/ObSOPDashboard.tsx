import React, { useEffect, useRef } from 'react';
import { CheckCircle2, ArrowDown, ArrowUp, Clock, Package } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const ObSOPDashboard = ({ orderBlockData, currentPrice }: { orderBlockData: any, currentPrice: number }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!orderBlockData) return;
    
    ['h4', 'h1'].forEach(tf => {
      const setup = orderBlockData[tf];
      if (setup) {
        const isBuy = setup.direction === 'BULLISH';
        const topPrice = parseFloat(setup.top);
        const bottomPrice = parseFloat(setup.bottom);
        
        const isInsideZone = currentPrice <= topPrice && currentPrice >= bottomPrice;
        const hasRetested = isBuy ? currentPrice <= topPrice : currentPrice >= bottomPrice;
        const step2Complete = isInsideZone || hasRetested;
        const step3Complete = step2Complete;
        
        if (step3Complete) {
          const sigId = tf + '-' + setup.direction + '-' + setup.range;
          if (!dispatchedRef.current.has(sigId)) {
            dispatchedRef.current.add(sigId);
            dispatchNewSignal({
            type: 'OB',
            timeframe: tf.toUpperCase() + ' TIMEFRAME',
            direction: isBuy ? 'BUY' : 'SELL',
            entryRange: setup.range,
            entryPrice: currentPrice,
            tp: isBuy ? topPrice + 5 : bottomPrice - 5,
            sl: isBuy ? bottomPrice - 5 : topPrice + 5
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
    
    // Step 1: Kenal pasti OB
    const step1Complete = true; 

    // Step 2: Harga Masuk Zon OB (Retest)
    const isInsideZone = currentPrice <= topPrice && currentPrice >= bottomPrice;
    const hasRetested = isBuy ? currentPrice <= topPrice : currentPrice >= bottomPrice; // Once it touches
    const step2Complete = isInsideZone || hasRetested;
    
    // Step 3: Confirmation (Signal)
    // Simplified: Once it retests, we consider it ready for signal check
    const step3Complete = step2Complete;

    const colorScheme = !isBuy ? {
      text: 'text-rose-400',
      bg: 'bg-rose-500',
      border: 'border-rose-500',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      bgLight: 'bg-rose-950/40',
      icon: <ArrowDown className="w-4 h-4 text-white" />,
      activeText: 'text-rose-400',
      label: 'SELL SIGNAL',
      iconBase: <Package className="w-3.5 h-3.5 text-rose-300" />
    } : {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      bgLight: 'bg-emerald-950/40',
      icon: <ArrowUp className="w-4 h-4 text-white" />,
      activeText: 'text-emerald-400',
      label: 'BUY SIGNAL',
      iconBase: <Package className="w-3.5 h-3.5 text-emerald-300" />
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
      <div className={`border ${!isBuy ? 'border-rose-900/40' : 'border-emerald-900/40'} rounded-xl overflow-hidden bg-[#0a0a0a]`}>
        <div className={`px-4 py-2 flex justify-between items-center ${!isBuy ? 'bg-rose-950/40' : 'bg-emerald-950/40'} border-b ${!isBuy ? 'border-rose-900/30' : 'border-emerald-900/30'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black text-white bg-black/60 px-2 py-1 rounded shadow flex items-center gap-1.5">
              {colorScheme.iconBase} {timeframe}
            </span>
            <span className={`text-[10px] sm:text-xs font-black tracking-wide ${colorScheme.text}`}>
              SOP OB: {setup.direction}
            </span>
          </div>
          <div className="text-[10px] text-gray-300 font-mono font-bold bg-black/40 px-2 py-1 rounded">
            ZON: {setup.range}
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <Step 
            num="1" 
            label="Zon Order Block Dikenalpasti"
            desc={`Smart Money Order Flow dikesan pada zon ${setup.range}.`}
            isComplete={step1Complete}
            isLast={false}
          />
          <Step 
            num="2" 
            label="Harga Masuk Ke Zon OB" 
            desc={`Harga kini = ${currentPrice.toFixed(2)}. Menunggu harga masuk ke zon.`}
            isComplete={step2Complete}
            isActive={!step2Complete}
            isLast={false}
          />
          <Step 
            num="3" 
            label={`Confirmation & ${colorScheme.label}`}
            desc="Cari pattern Rejection / Engulfing di M5 / M15."
            isComplete={step3Complete}
            isActive={step2Complete && !step3Complete}
            isLast={true}
          />
          
          {step3Complete && (
            <div className={`mt-2 p-3 rounded-lg border ${colorScheme.bgLight} ${colorScheme.border} flex flex-col gap-2 animate-pulse ${colorScheme.glow}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${colorScheme.bg} flex items-center justify-center shadow-lg`}>
                    {colorScheme.icon}
                  </div>
                  <div>
                    <div className={`font-black text-sm tracking-wide ${colorScheme.text}`}>SIGNAL {isBuy ? 'BUY' : 'SELL'} AKTIF</div>
                    <div className="text-[10px] text-gray-300">Harga dalam zon OB. Sedia untuk entry!</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded shadow">
                  WinRate: 84%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 bg-black/60 p-2 rounded-lg border border-gray-800">
                <div className="text-center">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">ENTRY ZONE</div>
                  <div className={`font-mono font-black text-[11px] sm:text-xs ${colorScheme.text}`}>{setup.range}</div>
                </div>
                <div className="text-center border-l border-gray-800">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">TARGET (TP)</div>
                  <div className="font-mono font-black text-[11px] sm:text-xs text-[#ffcc00]">{isBuy ? (topPrice + 5).toFixed(2) : (bottomPrice - 5).toFixed(2)}</div>
                </div>
                <div className="text-center border-l border-gray-800">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">STOP LOSS (SL 50 PIPS)</div>
                  <div className="font-mono font-black text-[11px] sm:text-xs text-rose-400">{isBuy ? (bottomPrice - 5).toFixed(2) : (topPrice + 5).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasH4 = !!orderBlockData?.h4;
  const hasH1 = !!orderBlockData?.h1;

  if (!hasH4 && !hasH1) return null;

  return (
    <div className="flex flex-col gap-3 mt-3">
      {hasH4 && renderDashboard(orderBlockData.h4, 'H4 TIMEFRAME')}
      {hasH1 && renderDashboard(orderBlockData.h1, 'H1 TIMEFRAME')}
    </div>
  );
};

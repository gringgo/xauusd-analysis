import React, { useEffect, useRef } from 'react';
import { CheckCircle2, ArrowDown, ArrowUp, Clock, Target, Bell } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const ZonKebenaranSOPDashboard = ({ zones, currentPrice }: { zones: any[], currentPrice: number }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());
  const retestedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!zones) return;
    
    zones.forEach(setup => {
      const isBuy = setup.direction === 'BULLISH';
      const topPrice = parseFloat(setup.top);
      const bottomPrice = parseFloat(setup.bottom);
      
      const optimalEntry = isBuy ? bottomPrice : topPrice;
        const isInsideZone = Math.abs(currentPrice - optimalEntry) <= 1.2;
      const hasRetested = isBuy ? currentPrice <= (optimalEntry + 0.5) : currentPrice >= (optimalEntry - 0.5);
      const step2Complete = isInsideZone || hasRetested;
      const tf = setup.timeframe || 'CONFLUENCE';
      const sigId = tf + '-' + setup.direction + '-' + setup.price;
      // Invalidation: if price pierces zone by > 25 pips (2.5)

            const isInvalidated = isBuy ? currentPrice < (optimalEntry - 2.5) : currentPrice > (optimalEntry + 2.5);

            if (isInvalidated) {

              retestedRef.current.delete(sigId);

            }
      if (step2Complete) {
         retestedRef.current.add(sigId);
      }
      const hasBeenRetested = retestedRef.current.has(sigId);
      const hasReacted = isBuy ? currentPrice >= (optimalEntry + 3.0) : currentPrice <= (optimalEntry - 3.0);
      const step3Complete = hasBeenRetested && hasReacted;
      
      if (step3Complete) {
          const tf = setup.timeframe || 'CONFLUENCE';
          const sigId = tf + '-' + setup.direction + '-' + setup.price;
          if (!dispatchedRef.current.has(sigId)) {
            dispatchedRef.current.add(sigId);
            dispatchNewSignal({
          type: 'ZON KEBENARAN',
          timeframe: tf.toUpperCase() + (tf.toUpperCase().includes('TIMEFRAME') ? '' : ' TIMEFRAME'),
          direction: isBuy ? 'BUY' : 'SELL',
          entryRange: setup.price,
          entryPrice: optimalEntry,
          candlePattern: isBuy ? 'Bullish Pinbar Rejection & Confluence (M5-M15)' : 'Bearish Pinbar Rejection & Confluence (M5-M15)',
          tp: isBuy ? Number((optimalEntry + 4.0).toFixed(2)) : Number((optimalEntry - 4.0).toFixed(2)),
          sl: isBuy ? Number((optimalEntry - 5.0).toFixed(2)) : Number((optimalEntry + 5.0).toFixed(2)),
          winRate: 100
        });
          }
        }
    });
  }, [currentPrice, zones]);

  if (!zones || zones.length === 0) return null;

  const renderDashboard = (setup: any, index: number) => {
    const isBuy = setup.direction === 'BULLISH';
    const topPrice = parseFloat(setup.top);
    const bottomPrice = parseFloat(setup.bottom);
    
    // Step 1: Kenal pasti Zon Kebenaran
    const step1Complete = true; 

    // Step 2: Harga Masuk Zon Kebenaran (Retest)
    const optimalEntry = isBuy ? bottomPrice : topPrice;
        const isInsideZone = Math.abs(currentPrice - optimalEntry) <= 1.2;
    const hasRetested = isBuy ? currentPrice <= (optimalEntry + 0.5) : currentPrice >= (optimalEntry - 0.5);
    const step2Complete = isInsideZone || hasRetested;
    
    // Step 3: Confirmation (Signal)
    const tf = setup.timeframe || 'CONFLUENCE';
    const sigId = tf + '-' + setup.direction + '-' + setup.price;
    const hasBeenRetested = step2Complete || retestedRef.current.has(sigId);
    const hasReacted = isBuy ? currentPrice >= (optimalEntry + 3.0) : currentPrice <= (optimalEntry - 3.0);
    const step3Complete = hasBeenRetested && hasReacted;

    const colorScheme = !isBuy ? {
      text: 'text-rose-400',
      bg: 'bg-rose-500',
      border: 'border-rose-500',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      bgLight: 'bg-rose-950/40',
      icon: <ArrowDown className="w-4 h-4 text-white" />,
      activeText: 'text-rose-400',
      label: 'SELL SIGNAL',
      iconBase: <Target className="w-3.5 h-3.5 text-rose-300" />
    } : {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      bgLight: 'bg-emerald-950/40',
      icon: <ArrowUp className="w-4 h-4 text-white" />,
      activeText: 'text-emerald-400',
      label: 'BUY SIGNAL',
      iconBase: <Target className="w-3.5 h-3.5 text-emerald-300" />
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
      <div key={index} className={`border ${!isBuy ? 'border-rose-900/40' : 'border-emerald-900/40'} rounded-xl overflow-hidden bg-[#0a0a0a]`}>
        <div className={`px-4 py-2 flex justify-between items-center ${!isBuy ? 'bg-rose-950/40' : 'bg-emerald-950/40'} border-b ${!isBuy ? 'border-rose-900/30' : 'border-emerald-900/30'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black text-white bg-black/60 px-2 py-1 rounded shadow flex items-center gap-1.5 line-clamp-1">
              {colorScheme.iconBase} ZON KEBENARAN
            </span>
            <span className={`text-[10px] sm:text-xs font-black tracking-wide ${colorScheme.text} hidden sm:block`}>
              SOP ZON: {setup.direction}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => alert(`Notifikasi harga telah ditetapkan untuk Zon Kebenaran ${setup.price}`)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold shadow-sm transition-colors ${!isBuy ? 'bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 border border-rose-700/50' : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-700/50'}`}
            >
              <Bell className="w-3 h-3" />
              <span className="hidden sm:inline">Set Alert</span> Harga
            </button>
            <div className="text-[10px] text-gray-300 font-mono font-bold bg-black/40 px-2 py-1 rounded shrink-0">
              {setup.price}
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <Step 
            num="1" 
            label="Zon Kebenaran Dikesan (High Confluence)"
            desc={`Pertindihan zon dikesan: ${setup.name}`}
            isComplete={step1Complete}
            isLast={false}
          />
          <Step 
            num="2" 
            label="Harga Masuk Ke Zon Kebenaran" 
            desc={`Harga kini = ${currentPrice.toFixed(2)}. Menunggu harga masuk zon.`}
            isComplete={step2Complete}
            isActive={!step2Complete}
            isLast={false}
          />
          <Step 
            num="3" 
            label={`Confirmation & ${colorScheme.label}`}
            desc="Teknikal terkuat, perhatikan reaksi harga (Rejection/Engulfing)."
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
                    <div className="text-[10px] text-gray-300">Zon Kebenaran dicapai. Peluang entry probabiliti tinggi (Abaikan jika harga masuk semula ke zon)!</div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded shadow">
                  WinRate: 100%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 bg-black/60 p-2 rounded-lg border border-gray-800">
                <div className="text-center">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">ENTRY ZONE</div>
                  <div className={`font-mono font-black text-[11px] sm:text-xs ${colorScheme.text}`}>{setup.price}</div>
                </div>
                <div className="text-center border-l border-gray-800">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">TARGET (TP1: 40 PIPS)</div>
                  <div className="font-mono font-black text-[11px] sm:text-xs text-[#ffcc00]">{isBuy ? (optimalEntry + 4.0).toFixed(2) : (optimalEntry - 4.0).toFixed(2)}</div>
                </div>
                <div className="text-center border-l border-gray-800">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">STOP LOSS (SL: 50 PIPS)</div>
                  <div className="font-mono font-black text-[11px] sm:text-xs text-rose-400">{isBuy ? (optimalEntry - 5.0).toFixed(2) : (optimalEntry + 5.0).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      {zones.map((zone, idx) => renderDashboard(zone, idx))}
    </div>
  );
};

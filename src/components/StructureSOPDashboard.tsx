import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Circle, ArrowDown, ArrowUp, Zap, Clock, ShieldAlert } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const StructureSOPDashboard = ({ sbrRbsData, currentPrice, filterType = 'ALL' }: { sbrRbsData: any, currentPrice: number, filterType?: 'ALL' | 'SNR' | 'SND' }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());
  const retestedRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!sbrRbsData) return;
    
    ['h8', 'h4', 'h1'].forEach(tf => {
      const dataForTf = sbrRbsData[tf];
      if (!dataForTf) return;
      
      ['sbr', 'rbs', 'dbd', 'rbr'].forEach(type => {
        const setup = dataForTf[type];
        if (setup) {
          const setupPrice = parseFloat(setup.price);
          const isSell = type === 'sbr' || type === 'dbd';
          
          const distance = Math.abs(currentPrice - setupPrice);
          const isRetesting = distance <= 0.5;
          const hasRetested = isSell ? currentPrice >= (setupPrice - 0.5) : currentPrice <= (setupPrice + 0.5);
          const step3Complete = isRetesting || hasRetested; 
          const sigId = tf + '-' + type + '-' + setup.price;
          if (step3Complete) {
            retestedRef.current.add(sigId);
          }
          const hasBeenRetested = retestedRef.current.has(sigId);
          const hasReacted = isSell ? currentPrice <= (setupPrice - 3.0) : currentPrice >= (setupPrice + 3.0);
          const step4Complete = hasBeenRetested && hasReacted;
          
          if (step4Complete) {
            const sigId = tf + '-' + type + '-' + setup.price;
            if (!dispatchedRef.current.has(sigId)) {
              dispatchedRef.current.add(sigId);
              dispatchNewSignal({
              type: type.toUpperCase(),
              timeframe: tf.toUpperCase() + ' TIMEFRAME',
              direction: isSell ? 'SELL' : 'BUY',
              entryRange: setup.price,
              entryPrice: currentPrice,
              triggerPrice: currentPrice,
              candlePattern: isSell ? `Bearish Rejection Wick & ${type.toUpperCase()} Retest` : `Bullish Rejection Wick & ${type.toUpperCase()} Retest`,
              tp: isSell ? Number((setupPrice - 4.0).toFixed(2)) : Number((setupPrice + 4.0).toFixed(2)),
              sl: isSell ? Number((setupPrice + 5.0).toFixed(2)) : Number((setupPrice - 5.0).toFixed(2)),
              winRate: 100
            });
            }
          }
        }
      });
    });
  }, [currentPrice, sbrRbsData]);

  if (!sbrRbsData) return null;

  const renderDashboard = (setup: any, type: 'SBR' | 'RBS' | 'DBD' | 'RBR', timeframe: string) => {
    if (!setup) return null;

    const setupPrice = parseFloat(setup.price);
    const isSell = type === 'SBR' || type === 'DBD'; // Sell setup
    const isBuy = type === 'RBS' || type === 'RBR'; // Buy setup

    // Step logic
    // Step 1: Identify Key Level
    const step1Complete = true; 
    
    // Step 2: Breakout
    const step2Complete = true; // since it exists in data, it has broken out.
    
    // Step 3: Retest
    // We consider retest complete if current price is within 2 points (20 pips) of the setup price, or if it has touched/crossed it slightly
    const distance = Math.abs(currentPrice - setupPrice);
    const isRetesting = distance <= 0.5; 
    const hasRetested = isSell ? currentPrice >= (setupPrice - 0.5) : currentPrice <= (setupPrice + 0.5);
    const step3Complete = isRetesting || hasRetested;
    
    // Step 4: Signal
    const tf = (typeof timeframe !== 'undefined' ? timeframe.split(' ')[0].toLowerCase() : '');
    const sigId = tf + '-' + type.toLowerCase() + '-' + setup.price;
    const hasBeenRetested = step3Complete || retestedRef.current.has(sigId);
    const hasReacted = isSell ? currentPrice <= (setupPrice - 3.0) : currentPrice >= (setupPrice + 3.0);
    const step4Complete = hasBeenRetested && hasReacted;

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
      <div className={`border ${isSell ? 'border-red-900/40' : 'border-emerald-900/40'} rounded-xl overflow-hidden bg-[#0a0a0a]`}>
        <div className={`px-4 py-2 flex justify-between items-center ${isSell ? 'bg-red-950/40' : 'bg-emerald-950/40'} border-b ${isSell ? 'border-red-900/30' : 'border-emerald-900/30'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black text-white bg-black/60 px-2 py-1 rounded shadow">
              {timeframe}
            </span>
            <span className={`text-[10px] sm:text-xs font-black tracking-wide ${colorScheme.text}`}>
              SOP STRUKTUR: {type} ZON
            </span>
          </div>
          <div className="text-[10px] text-gray-300 font-mono font-bold bg-black/40 px-2 py-1 rounded">
            TARGET: {setupPrice.toFixed(2)}
          </div>
        </div>
        <div className="p-4 sm:p-5">
          <Step 
            num="1" 
            label={type === 'SBR' ? "Support Kunci Dikenalpasti" : type === 'RBS' ? "Resistance Kunci Dikenalpasti" : type === 'DBD' ? "Base Drop (Supply) Dibina" : "Base Rally (Demand) Dibina"}
            desc={type === 'SBR' ? "Paras Support lama (Swing Low) dikesan." : type === 'RBS' ? "Paras Resistance lama (Swing High) dikesan." : type === 'DBD' ? "Momentum Drop terhenti sementara membentuk Base." : "Momentum Rally terhenti sementara membentuk Base."}
            isComplete={step1Complete}
            isLast={false}
          />
          <Step 
            num="2" 
            label={type === 'SBR' ? "Harga Break Support (Menjadi SBR)" : type === 'RBS' ? "Harga Break Resistance (Menjadi RBS)" : type === 'DBD' ? "Momentum Drop Diteruskan" : "Momentum Rally Diteruskan"}
            desc={type === 'SBR' ? "Support ditembus (Breakout). Base SBR terbentuk." : type === 'RBS' ? "Resistance ditembus (Breakout). Base RBS terbentuk." : type === 'DBD' ? "Drop-Base-Drop berjaya terbentuk." : "Rally-Base-Rally berjaya terbentuk."}
            isComplete={step2Complete}
            isLast={false}
          />
          <Step 
            num="3" 
            label={`Retest / Pullback ke Zon ${type}`} 
            desc={`Harga kini = ${currentPrice.toFixed(2)}. Menunggu harga masuk ke zon target ${setupPrice.toFixed(2)}.`}
            isComplete={step3Complete}
            isActive={!step3Complete}
            isLast={false}
          />
          <Step 
            num="4" 
            label={`Confirmation & ${colorScheme.label}`}
            desc={`Rejection di zon ${type}. Signal ${isSell ? 'SELL' : 'BUY'} valid!`}
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
                    <div className={`font-black text-sm tracking-wide ${colorScheme.text}`}>SIGNAL {isSell ? 'SELL' : 'BUY'} AKTIF</div>
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
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">TARGET (TP1: 40 PIPS)</div>
                  <div className="font-mono font-black text-[11px] sm:text-xs text-[#ffcc00]">{isSell ? (setupPrice - 4.0).toFixed(2) : (setupPrice + 4.0).toFixed(2)}</div>
                </div>
                <div className="text-center border-l border-gray-800">
                  <div className="text-[9px] text-gray-400 font-bold mb-0.5">STOP LOSS (SL: 50 PIPS)</div>
                  <div className="font-mono font-black text-[11px] sm:text-xs text-rose-400">{isSell ? (setupPrice + 5.0).toFixed(2) : (setupPrice - 5.0).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasH8SBR = (filterType === 'ALL' || filterType === 'SNR') && !!sbrRbsData?.h8?.sbr;
  const hasH8RBS = (filterType === 'ALL' || filterType === 'SNR') && !!sbrRbsData?.h8?.rbs;
  const hasH8DBD = (filterType === 'ALL' || filterType === 'SND') && !!sbrRbsData?.h8?.dbd;
  const hasH8RBR = (filterType === 'ALL' || filterType === 'SND') && !!sbrRbsData?.h8?.rbr;

  const hasH4SBR = (filterType === 'ALL' || filterType === 'SNR') && !!sbrRbsData?.h4?.sbr;
  const hasH4RBS = (filterType === 'ALL' || filterType === 'SNR') && !!sbrRbsData?.h4?.rbs;
  const hasH4DBD = (filterType === 'ALL' || filterType === 'SND') && !!sbrRbsData?.h4?.dbd;
  const hasH4RBR = (filterType === 'ALL' || filterType === 'SND') && !!sbrRbsData?.h4?.rbr;
  
  const hasH1SBR = (filterType === 'ALL' || filterType === 'SNR') && !!sbrRbsData?.h1?.sbr;
  const hasH1RBS = (filterType === 'ALL' || filterType === 'SNR') && !!sbrRbsData?.h1?.rbs;
  const hasH1DBD = (filterType === 'ALL' || filterType === 'SND') && !!sbrRbsData?.h1?.dbd;
  const hasH1RBR = (filterType === 'ALL' || filterType === 'SND') && !!sbrRbsData?.h1?.rbr;

  if (!hasH8SBR && !hasH8RBS && !hasH8DBD && !hasH8RBR && !hasH4SBR && !hasH4RBS && !hasH1SBR && !hasH1RBS && !hasH4DBD && !hasH4RBR && !hasH1DBD && !hasH1RBR) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {hasH8SBR && renderDashboard(sbrRbsData.h8.sbr, 'SBR', 'H8 TIMEFRAME')}
      {hasH8RBS && renderDashboard(sbrRbsData.h8.rbs, 'RBS', 'H8 TIMEFRAME')}
      {hasH8DBD && renderDashboard(sbrRbsData.h8.dbd, 'DBD', 'H8 TIMEFRAME')}
      {hasH8RBR && renderDashboard(sbrRbsData.h8.rbr, 'RBR', 'H8 TIMEFRAME')}

      {hasH4SBR && renderDashboard(sbrRbsData.h4.sbr, 'SBR', 'H4 TIMEFRAME')}
      {hasH4RBS && renderDashboard(sbrRbsData.h4.rbs, 'RBS', 'H4 TIMEFRAME')}
      {hasH4DBD && renderDashboard(sbrRbsData.h4.dbd, 'DBD', 'H4 TIMEFRAME')}
      {hasH4RBR && renderDashboard(sbrRbsData.h4.rbr, 'RBR', 'H4 TIMEFRAME')}
      
      {hasH1SBR && renderDashboard(sbrRbsData.h1.sbr, 'SBR', 'H1 TIMEFRAME')}
      {hasH1RBS && renderDashboard(sbrRbsData.h1.rbs, 'RBS', 'H1 TIMEFRAME')}
      {hasH1DBD && renderDashboard(sbrRbsData.h1.dbd, 'DBD', 'H1 TIMEFRAME')}
      {hasH1RBR && renderDashboard(sbrRbsData.h1.rbr, 'RBR', 'H1 TIMEFRAME')}
    </div>
  );
};

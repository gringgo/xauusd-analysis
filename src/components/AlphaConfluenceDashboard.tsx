import React, { useEffect, useRef } from 'react';
import { Target } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const AlphaConfluenceDashboard = ({ alphaConfluence, currentPrice }: { alphaConfluence: any[], currentPrice: number }) => {
  const dispatchedRef = useRef<Set<string>>(new Set());
  const retestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!alphaConfluence || alphaConfluence.length === 0 || !currentPrice) return;

    alphaConfluence.forEach((conf: any, idx: number) => {
      const isBuy = conf.type === 'BULLISH';
      const topPrice = parseFloat(conf.top);
      const bottomPrice = parseFloat(conf.bottom);
      
      const optimalEntry = isBuy ? bottomPrice : topPrice;
      const isInsideZone = currentPrice <= topPrice && currentPrice >= bottomPrice;
      
      const hasRetested = isInsideZone || (isBuy ? currentPrice <= (optimalEntry + 0.5) : currentPrice >= (optimalEntry - 0.5));
      
      const sigId = `alpha-${conf.type}-${conf.bottom}-${conf.top}`;
      
      // Invalidation: if price pierces zone significantly
      const isInvalidated = isBuy ? currentPrice < (bottomPrice - 5.0) : currentPrice > (topPrice + 5.0);
      
      if (isInvalidated) {
        retestedRef.current.delete(sigId);
      } else if (hasRetested) {
        retestedRef.current.add(sigId);
      }

      const hasBeenRetested = retestedRef.current.has(sigId);
      
      // Dispatch Signal if price enters zone
      if (hasRetested && !isInvalidated && !dispatchedRef.current.has(sigId)) {
        dispatchedRef.current.add(sigId);
        dispatchNewSignal({
          type: 'ALPHA ZON SNIPER',
          timeframe: 'M15/M5 (Confluence)',
          direction: isBuy ? 'BUY' : 'SELL',
          entryRange: `${bottomPrice.toFixed(2)} - ${topPrice.toFixed(2)}`,
          entryPrice: optimalEntry,
          tp: isBuy ? optimalEntry + 5.0 : optimalEntry - 5.0,
          sl: isBuy ? optimalEntry - 5.0 : optimalEntry + 5.0,
          winRate: conf.winRate || 95,
          notes: `Confluence Elements: ${conf.elements.join(', ')}`
        });
      }
    });
  }, [alphaConfluence, currentPrice]);

  return (
    <div id="sec-alpha" className="scroll-mt-6 border border-[#ffcc00]/40 rounded-xl bg-[#0a0a0a] shadow-[0_0_20px_rgba(255,204,0,0.15)] overflow-hidden mb-3 lg:mb-4">
      <div className="border-b border-[#ffcc00]/30 bg-gradient-to-r from-[#111] via-[#1a1500] to-[#111] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-950/80 border border-yellow-500/50 text-[#ffcc00] font-black text-xs animate-pulse">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[#ffcc00] font-black text-xs sm:text-sm tracking-wide">MODUL ALPHA CONFLUENCE (ZON SNIPER)</span>
            <p className="text-[10px] text-gray-400">Pencarian Zon Pertindihan Kebarangkalian Tinggi (High Probability)</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {(!alphaConfluence || alphaConfluence.length === 0) ? (
          <div className="text-gray-400 text-xs italic p-4 bg-black/40 rounded border border-gray-800 text-center">
            <span className="text-lg block mb-2">⏳</span>
            Tiada Setup High Probability (Confluence) buat masa ini. Sila tunggu, jangan FOMO!
          </div>
        ) : (
          <div className="space-y-4">
            {alphaConfluence.map((conf: any, idx: number) => {
              const sigId = `alpha-${conf.type}-${conf.bottom}-${conf.top}`;
              const isRetested = retestedRef.current.has(sigId);
              const isBuy = conf.type === 'BULLISH';
              
              return (
                <div key={idx} className={`p-4 rounded-xl border ${isBuy ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.1)]'}`}>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-black text-lg ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isBuy ? 'BUY ZONE' : 'SELL ZONE'}
                        </span>
                        <div className="flex items-center gap-1.5 ml-2 bg-black/40 px-2 py-0.5 rounded border border-gray-700/50">
                          <span className="flex items-center gap-0.5 text-[#ffcc00] text-sm">
                            {Array.from({length: conf.stars}).map((_, i) => <span key={i}>⭐</span>)}
                          </span>
                          <span className="text-xs font-bold text-[#ffcc00] ml-1">{conf.winRate || 95}% Win</span>
                        </div>
                      </div>
                      <div className="text-[#ffcc00] font-mono font-black text-2xl tracking-wider">
                        {conf.bottom.toFixed(2)} - {conf.top.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className={`flex-shrink-0 flex items-center justify-center p-3 rounded-lg border ${isBuy ? 'bg-emerald-900/40 border-emerald-500/30' : 'bg-rose-900/40 border-rose-500/30'}`}>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-300 font-bold mb-0.5 uppercase">Cadangan SL (50 Pips)</div>
                        <div className="font-mono font-black text-white">
                          {isBuy ? (conf.bottom - 5.0).toFixed(2) : (conf.top + 5.0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isRetested && (
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded w-fit">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                      ZON SEDANG AKTIF (RETESTED)
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-3">
                    <div className="text-[10px] text-gray-400 uppercase font-bold mb-2">Pertindihan Bukti (Confluence Elements):</div>
                    <div className="flex flex-wrap gap-2">
                      {conf.elements.map((el: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded bg-black/60 border border-white/10 text-xs font-bold text-gray-200">
                          ✓ {el}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

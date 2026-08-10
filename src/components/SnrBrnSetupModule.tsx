import React, { useState, useEffect, useRef } from 'react';
import { Target, CheckCircle2, Zap } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

export const SnrBrnSetupModule = ({ sbrRbsData, currentPrice }: { sbrRbsData?: any, currentPrice?: number }) => {
  const [detectedZones, setDetectedZones] = useState<{id: string, name: string, price: string, desc: string, isBuy: boolean}[]>([]);
  const dispatchedRef = useRef<Set<string>>(new Set());
  const retestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const zones: {id: string, name: string, price: string, desc: string, isBuy: boolean}[] = [];
    if (sbrRbsData) {
      ['h8', 'h4', 'h1'].forEach(tf => {
        if (sbrRbsData[tf]) {
          if (sbrRbsData[tf].sbr) {
            zones.push({
              id: `${tf}_sbr_${sbrRbsData[tf].sbr.price}`,
              name: `${tf.toUpperCase()} SBR`,
              price: sbrRbsData[tf].sbr.price,
              desc: sbrRbsData[tf].sbr.description || 'SBR (Support jadi Resistance) - Fokus SELL',
              isBuy: false
            });
          }
          if (sbrRbsData[tf].rbs) {
            zones.push({
              id: `${tf}_rbs_${sbrRbsData[tf].rbs.price}`,
              name: `${tf.toUpperCase()} RBS`,
              price: sbrRbsData[tf].rbs.price,
              desc: sbrRbsData[tf].rbs.description || 'RBS (Resistance jadi Support) - Fokus BUY',
              isBuy: true
            });
          }
        }
      });
    }

    if (currentPrice && currentPrice > 0) {
      const p = Number(currentPrice);
      const lowerBRN = Math.floor(p / 10) * 10;
      const upperBRN = Math.ceil(p / 10) * 10;
      
      if (upperBRN !== lowerBRN) {
        // Cek confluence: adakah BRN berdekatan (dalam 20 pips/2.0 point) dengan zon SBR/RBS?
        const upperHasConfluence = zones.some(z => !z.isBuy && Math.abs(parseFloat(z.price) - upperBRN) <= 2.0);
        const lowerHasConfluence = zones.some(z => z.isBuy && Math.abs(parseFloat(z.price) - lowerBRN) <= 2.0);
        
        // Major BRN (gandaan 50 atau 100)
        const isUpperMajor = upperBRN % 50 === 0;
        const isLowerMajor = lowerBRN % 50 === 0;

        // Hanya tambah zon BRN jika ia adalah Major BRN atau mempunyai confluence dengan zon SBR/RBS
        if (upperHasConfluence || isUpperMajor) {
          zones.push({
            id: `brn_upper_${upperBRN}`,
            name: upperHasConfluence ? `BRN + SNR CONFLUENCE` : `MAJOR BRN Resistance`,
            price: upperBRN.toFixed(2),
            desc: upperHasConfluence ? `BRN Confluence kuat dengan zon SBR - Fokus SELL` : `Major Big Round Number - Fokus SELL`,
            isBuy: false
          });
        }
        
        if (lowerHasConfluence || isLowerMajor) {
          zones.push({
            id: `brn_lower_${lowerBRN}`,
            name: lowerHasConfluence ? `BRN + SNR CONFLUENCE` : `MAJOR BRN Support`,
            price: lowerBRN.toFixed(2),
            desc: lowerHasConfluence ? `BRN Confluence kuat dengan zon RBS - Fokus BUY` : `Major Big Round Number - Fokus BUY`,
            isBuy: true
          });
        }
      }
    }
    setDetectedZones(zones);
  }, [sbrRbsData, currentPrice]);

  useEffect(() => {
    if (!currentPrice || detectedZones.length === 0) return;

    detectedZones.forEach(z => {
      const zonePrice = parseFloat(z.price);
      const isBuy = z.isBuy;
      const sigId = `auto_${z.id}`;
      
      const isInsideZone = Math.abs(currentPrice - zonePrice) <= 1.2; // Wajib masuk zon dgn tepat
      const hasRetested = isBuy ? currentPrice <= (zonePrice + 0.5) : currentPrice >= (zonePrice - 0.5);
      
      // If price pierces the zone by more than 2.0 points (20 pips), it's invalid (breakout)
      const isInvalidated = isBuy ? currentPrice < (zonePrice - 2.5) : currentPrice > (zonePrice + 2.5); // Kalau tembus lebih 25 pips = batal
      
      if (isInvalidated) {
        retestedRef.current.delete(sigId); // Reset if broken
        return;
      }
      
      if (isInsideZone || hasRetested) {
        retestedRef.current.add(sigId);
      }
      
      const hasBeenRetested = retestedRef.current.has(sigId);
      // Require a stronger rejection (at least 2.5 points / 25 pips) for higher quality signals
      const hasReacted = isBuy ? currentPrice >= (zonePrice + 3.0) : currentPrice <= (zonePrice - 3.0); // Wajib reject 30 pips untuk sahkan kualiti
      
      if (hasBeenRetested && hasReacted) {
        if (!dispatchedRef.current.has(sigId)) {
          dispatchedRef.current.add(sigId);
          dispatchNewSignal({
            type: z.name.includes('BRN') ? 'HQ BRN SETUP' : 'HQ SNR SETUP',
            timeframe: z.name.includes('H') ? z.name.split(' ')[0] + ' TIMEFRAME' : 'MAJOR TIMEFRAME',
            direction: isBuy ? 'BUY' : 'SELL',
            entryRange: z.price,
            entryPrice: currentPrice,
            candlePattern: isBuy ? 'Strong Bullish Rejection (30+ pips) di Zon ' + z.name : 'Strong Bearish Rejection (30+ pips) di Zon ' + z.name,
            tp: isBuy ? zonePrice + 5 : zonePrice - 5,
            sl: isBuy ? zonePrice - 5 : zonePrice + 5,
            winRate: 92
          });
        }
      }
    });

  }, [currentPrice, detectedZones]);

  const handleManualDispatch = (z: any) => {
    if (!currentPrice) return;
    const isBuy = z.isBuy;
    const zonePrice = parseFloat(z.price);
    const sigId = `manual_${z.id}`;
    
    if (!dispatchedRef.current.has(sigId)) {
      dispatchedRef.current.add(sigId);
      dispatchNewSignal({
        type: z.name.includes('BRN') ? 'MANUAL BRN' : 'MANUAL SNR',
        timeframe: z.name.includes('H') ? z.name.split(' ')[0] + ' TIMEFRAME' : 'MAJOR TIMEFRAME',
        direction: isBuy ? 'BUY' : 'SELL',
        entryRange: z.price,
        entryPrice: currentPrice,
        candlePattern: isBuy ? 'Bullish Rejection di Zon ' + z.name : 'Bearish Rejection di Zon ' + z.name,
        tp: isBuy ? zonePrice + 5 : zonePrice - 5,
        sl: isBuy ? zonePrice - 5 : zonePrice + 5,
        winRate: 85
      });
    }
  };

  return (
    <div className="bg-[#0a0a0a] rounded-2xl border border-orange-500/30 overflow-hidden shadow-2xl flex flex-col">
      <div className="bg-gradient-to-r from-orange-950 via-black to-orange-950 px-4 py-3 border-b border-orange-500/30 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-400" />
          <h2 className="text-sm font-black text-white tracking-wide">SNR & BRN SETUP PLANNER</h2>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-br from-orange-950/40 via-black to-orange-950/20 p-4 rounded-xl border border-orange-500/40 shadow-lg mb-4">
          <div className="flex items-center justify-between mb-3 border-b border-orange-500/20 pb-2">
            <h4 className="text-sm font-black text-orange-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ZON PANTAUAN SNR & BRN SEMASA
            </h4>
          </div>
          
          <p className="text-xs text-gray-300 mb-4 leading-relaxed">
            Zon-zon di bawah dikira secara automatik berdasarkan pergerakan harga semasa. 
            Apabila harga masuk ke zon ini, tunggu "rejection" (penolakan) sebelum masuk pasaran. 
            Tekan butang "Hantar Signal" untuk rekod setup ini.
          </p>

          {detectedZones.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {detectedZones.map((z, idx) => (
                <div key={idx} className="bg-black/60 border border-orange-500/20 hover:border-orange-500/60 rounded-xl p-3 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-orange-300 font-bold truncate">{z.name}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${z.isBuy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {z.isBuy ? 'FOKUS BUY' : 'FOKUS SELL'}
                      </span>
                    </div>
                    <div className="text-xl font-black text-white font-mono tracking-tight my-1">{z.price}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{z.desc}</div>
                  </div>
                  
                  <button
                    onClick={() => handleManualDispatch(z)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 border border-orange-600/50 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" /> Hantar Signal
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-400 bg-black/50 p-3 rounded border border-gray-800 text-center">
              Sedang mengira zon HTF (H8, H4, H1 & BRN)...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

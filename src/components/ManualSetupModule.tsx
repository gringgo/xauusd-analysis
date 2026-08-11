import React, { useState, useEffect } from 'react';
import { Crosshair, Plus, Trash2, TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { dispatchNewSignal } from '../lib/signalStore';

interface ManualSetup {
  id: string;
  lowPrice: number;
  highPrice: number;
  direction: 'BUY' | 'SELL';
  timeframe?: string;
  status: 'WAITING' | 'MONITORING' | 'REJECTION_DETECTED' | 'TRIGGERED';
  monitorStartTime?: number;
  rejectionTime?: number;
  rejectionM1CloseTime?: number;
  rejectionM5CloseTime?: number;
  extremePrice?: number;
  createdAt: number;
  name?: string;
}

export const ManualSetupModule = ({ currentPrice }: { currentPrice?: number }) => {
  const [setups, setSetups] = useState<ManualSetup[]>([]);
  const [newLowPrice, setNewLowPrice] = useState<string>('');
  const [newHighPrice, setNewHighPrice] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newDirection, setNewDirection] = useState<'BUY' | 'SELL'>('BUY');

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xauusd_manual_setups');
      if (saved) {
        setSetups(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load manual setups', e);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('xauusd_manual_setups', JSON.stringify(setups));
    } catch (e) {
      console.error('Failed to save manual setups', e);
    }
  }, [setups]);

  // Monitor price to trigger signals
  useEffect(() => {
    if (!currentPrice || setups.length === 0) return;

    let updated = false;
    const now = Date.now();
    const newSetups = setups.map(setup => {
      let setupRef = { ...setup };

      // Backwards compatibility for old setups
      if ((setupRef as any).rejectionCandleCloseTime) {
         setupRef.rejectionM5CloseTime = (setupRef as any).rejectionCandleCloseTime;
         delete (setupRef as any).rejectionCandleCloseTime;
         updated = true;
      }

      if (setupRef.status === 'TRIGGERED') return setupRef;

      const isBuy = setupRef.direction === 'BUY';
      
      if (setupRef.status === 'WAITING') {
        // Price touches or enters the defined setup zone
        const touchesZone = isBuy
          ? (currentPrice <= setupRef.highPrice + 0.5 && currentPrice >= setupRef.lowPrice - 2.0)
          : (currentPrice >= setupRef.lowPrice - 0.5 && currentPrice <= setupRef.highPrice + 2.0);

        if (touchesZone) {
          updated = true;
          return { ...setupRef, status: 'MONITORING' as const, monitorStartTime: now, extremePrice: currentPrice };
        }
      } else if (setupRef.status === 'MONITORING') {
        // Track the extreme price reached inside or near the zone
        const currentExtreme = setupRef.extremePrice ?? currentPrice;
        const newExtreme = isBuy ? Math.min(currentExtreme, currentPrice) : Math.max(currentExtreme, currentPrice);
        
        let updatedSetup = { ...setupRef, extremePrice: newExtreme };

        // If price blows past zone by > 3.0 points (30 pips SL area), reset monitoring
        const zoneBlown = isBuy
          ? currentPrice < setupRef.lowPrice - 3.0
          : currentPrice > setupRef.highPrice + 3.0;

        if (zoneBlown) {
          updated = true;
          return { ...setupRef, status: 'WAITING' as const, extremePrice: undefined };
        }

        // Check for rejection: price must bounce back from extreme by at least 0.8 points (8 pips)
        const bounceDistance = isBuy ? (currentPrice - newExtreme) : (newExtreme - currentPrice);
        const hasRejected = bounceDistance >= 0.8;

        if (hasRejected) {
          updated = true;
          // Calculate when the current candle (M1 or M5) closes
          const nextM1Close = Math.ceil(now / 60000) * 60000;
          const nextM5Close = Math.ceil(now / 300000) * 300000;
          return { 
            ...updatedSetup, 
            status: 'REJECTION_DETECTED' as const, 
            rejectionTime: now,
            rejectionM1CloseTime: nextM1Close,
            rejectionM5CloseTime: nextM5Close
          };
        }
        
        if (newExtreme !== setup.extremePrice) {
          updated = true;
          return updatedSetup;
        }
      } else if (setupRef.status === 'REJECTION_DETECTED') {
        const currentExtreme = setupRef.extremePrice ?? currentPrice;
        
        // If price breaks extreme (makes a lower low for BUY or higher high for SELL), rejection is broken
        const brokenExtreme = isBuy
          ? currentPrice < currentExtreme
          : currentPrice > currentExtreme;
          
        if (brokenExtreme) {
          updated = true;
          return {
            ...setupRef,
            status: 'MONITORING' as const,
            extremePrice: currentPrice,
            rejectionTime: undefined,
            rejectionM1CloseTime: undefined,
            rejectionM5CloseTime: undefined
          };
        }
        
        // When candle close time arrives, verify that the candle actually closed with rejection!
        let triggered = false;
        let triggeredTf = '';

        if (setupRef.rejectionM1CloseTime && now >= setupRef.rejectionM1CloseTime) {
          const bounceAtClose = isBuy ? (currentPrice - currentExtreme) : (currentExtreme - currentPrice);
          if (bounceAtClose >= 0.8) {
            triggered = true;
            triggeredTf = 'M1';
          } else {
            updated = true;
            setupRef.rejectionM1CloseTime = undefined;
          }
        }

        if (!triggered && setupRef.rejectionM5CloseTime && now >= setupRef.rejectionM5CloseTime) {
          const bounceAtClose = isBuy ? (currentPrice - currentExtreme) : (currentExtreme - currentPrice);
          if (bounceAtClose >= 0.8) {
            triggered = true;
            triggeredTf = 'M5';
          } else {
            updated = true;
            setupRef.rejectionM5CloseTime = undefined;
          }
        }

        if (triggered) {
          updated = true;
          dispatchNewSignal({
            type: `MANUAL SETUP${setupRef.name ? ` (${setupRef.name})` : ''}`,
            timeframe: `${triggeredTf} (Candle Close)`,
            direction: setupRef.direction,
            entryRange: `${setupRef.lowPrice.toFixed(2)} - ${setupRef.highPrice.toFixed(2)}`,
            entryPrice: isBuy ? setupRef.lowPrice : setupRef.highPrice,
            triggerPrice: currentPrice,
            candlePattern: isBuy ? `Bullish Rejection Wick (${triggeredTf} Candle Close)` : `Bearish Rejection Wick (${triggeredTf} Candle Close)`,
            tp: isBuy ? Number((setupRef.highPrice + 4.0).toFixed(2)) : Number((setupRef.lowPrice - 4.0).toFixed(2)),
            sl: isBuy ? Number((setupRef.lowPrice - 5.0).toFixed(2)) : Number((setupRef.highPrice + 5.0).toFixed(2)),
          });

          return { ...setupRef, status: 'TRIGGERED' as const };
        } else if (!setupRef.rejectionM1CloseTime && !setupRef.rejectionM5CloseTime) {
          // Both failed, revert to monitoring
          updated = true;
          return {
            ...setupRef,
            status: 'MONITORING' as const,
            rejectionTime: undefined,
            rejectionM1CloseTime: undefined,
            rejectionM5CloseTime: undefined
          };
        }
      }
      return setupRef;
    });

    if (updated) {
      setSetups(newSetups);
    }
  }, [currentPrice, setups]);

  const handleAddSetup = (e: React.FormEvent) => {
    e.preventDefault();
    const lowVal = parseFloat(newLowPrice);
    const highVal = parseFloat(newHighPrice);
    if (isNaN(lowVal) || isNaN(highVal) || lowVal >= highVal) return;

    const newSetup: ManualSetup = {
      id: Date.now().toString(),
      lowPrice: lowVal,
      highPrice: highVal,
      direction: newDirection,
      timeframe: 'M1/M5',
      status: 'WAITING',
      createdAt: Date.now(),
      name: newName.trim() || undefined
    };

    setSetups([newSetup, ...setups]);
    setNewLowPrice('');
    setNewHighPrice('');
    setNewName('');
  };

  const removeSetup = (id: string) => {
    setSetups(setups.filter(s => s.id !== id));
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl relative flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-800 bg-gray-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Crosshair className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-white tracking-wide">MODUL MANUAL SETUP</h2>
              {setups.length > 0 && (
                <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">
                  {setups.length} Zon Aktif
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Auto-trigger signal apabila harga mencapai zon</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
          <Activity className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-mono font-medium text-gray-300">
            Current: <span className={!currentPrice ? 'text-gray-500' : 'text-white'}>{currentPrice ? currentPrice.toFixed(2) : '---.--'}</span>
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-5">
        {/* Input Form */}
        <form onSubmit={handleAddSetup} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex flex-col sm:flex-row gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 tracking-wider">ZON BAWAH</label>
            <input
              type="number"
              step="0.01"
              required
              value={newLowPrice}
              onChange={e => setNewLowPrice(e.target.value)}
              placeholder="Cth: 2450.50"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 tracking-wider">ZON ATAS</label>
            <input
              type="number"
              step="0.01"
              required
              value={newHighPrice}
              onChange={e => setNewHighPrice(e.target.value)}
              placeholder="Cth: 2452.50"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div className="flex-1 min-w-[120px] flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 tracking-wider">NAMA SIGNAL (PILIHAN)</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Cth: Rejection H4"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <div className="w-full sm:w-32 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 tracking-wider">ARAHAN</label>
            <select
              value={newDirection}
              onChange={e => setNewDirection(e.target.value as 'BUY' | 'SELL')}
              className={`w-full bg-gray-900 border rounded-lg px-3 py-2 text-sm font-bold focus:outline-none ${newDirection === 'BUY' ? 'text-emerald-400 border-emerald-500/50' : 'text-rose-400 border-rose-500/50'}`}
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors border border-indigo-500 shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </form>

        {/* Setup List */}
        <div className="flex flex-col gap-3">
          {setups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-800/30 rounded-xl border border-gray-800 border-dashed">
              <Crosshair className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-400 text-center">Tiada setup manual setakat ini.<br/>Tambah zon di atas untuk memantau harga.</p>
            </div>
          ) : (
            setups.map((setup) => {
              const isBuy = setup.direction === 'BUY';
              const isTriggered = setup.status === 'TRIGGERED';
              
              return (
                <div 
                  key={setup.id} 
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 sm:p-4 rounded-xl border transition-all ${
                    isTriggered 
                      ? 'bg-gray-800/40 border-gray-700/50 opacity-75' 
                      : isBuy 
                        ? 'bg-emerald-900/10 border-emerald-500/30 hover:border-emerald-500/50' 
                        : 'bg-rose-900/10 border-rose-500/30 hover:border-rose-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                      isBuy ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/20 border-rose-500/30 text-rose-400'
                    }`}>
                      {isBuy ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {setup.name && (
                          <span className="text-sm font-bold text-white mr-1">{setup.name}</span>
                        )}
                        <span className={`text-sm font-black ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {setup.direction}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                          {setup.timeframe || 'M1/M5'}
                        </span>
                        {isTriggered && (
                          <span className="text-[10px] font-bold text-yellow-400 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> SIGNAL KELUAR
                          </span>
                        )}
                        {setup.status === 'WAITING' && (
                          <span className="text-[10px] font-bold text-gray-400 px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700">
                            MENUNGGU ZON
                          </span>
                        )}
                        {setup.status === 'MONITORING' && (
                          <span className="text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-1 animate-pulse">
                            <Activity className="w-3 h-3" /> PANTAU REJECTION
                          </span>
                        )}
                        {setup.status === 'REJECTION_DETECTED' && (
                          <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 animate-pulse">
                            <Activity className="w-3 h-3" /> TUNGGU CANDLE CLOSE ({setup.timeframe || 'M5'})
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-lg font-black text-white">
                        {setup.lowPrice.toFixed(2)} - {setup.highPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-gray-800 pt-3 sm:pt-0">
                    {!isTriggered && currentPrice && (
                      <div className="text-xs font-medium text-gray-400">
                        Jarak: <span className="font-mono font-bold text-gray-300">
                          {currentPrice > setup.highPrice 
                            ? (currentPrice - setup.highPrice).toFixed(2) 
                            : currentPrice < setup.lowPrice 
                              ? (setup.lowPrice - currentPrice).toFixed(2) 
                              : '0.00'}
                        </span> mata
                      </div>
                    )}
                    <button
                      onClick={() => removeSetup(setup.id)}
                      className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Padam Setup"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

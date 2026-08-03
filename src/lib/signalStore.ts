import { useState, useEffect, useCallback } from 'react';

export interface SignalRecord {
  id: string | number;
  type: string;
  timeframe: string;
  direction: 'BUY' | 'SELL';
  entryRange: string;
  entryPrice: number;
  tp: number;
  sl: number;
  winRate?: number;
  timestamp: number;
  status: 'ACTIVE' | 'TP_HIT' | 'SL_HIT';
}

export function getSignalWinRate(signal: Partial<SignalRecord>): number {
  if (signal.winRate && signal.winRate > 0) return signal.winRate;
  const typeUpper = (signal.type || '').toUpperCase();
  const tfUpper = (signal.timeframe || '').toUpperCase();
  if (typeUpper.includes('ZEUS') || typeUpper.includes('KEBENARAN') || typeUpper.includes('GOLDEN')) return 88;
  if (typeUpper.includes('OB') || typeUpper.includes('ORDER')) return 84;
  if (typeUpper.includes('FVG')) return 81;
  if (typeUpper.includes('SBR') || typeUpper.includes('RBS')) {
    return tfUpper.includes('H4') ? 76 : 85;
  }
  if (tfUpper.includes('H4')) return 76;
  if (tfUpper.includes('H1')) return 82;
  return 80;
}

const recentDispatches = new Map<string, number>();

export const dispatchNewSignal = (signal: Omit<SignalRecord, 'id' | 'timestamp' | 'status'>) => {
  if (typeof window !== 'undefined') {
    const key = `${signal.type}-${signal.direction}-${signal.entryRange}`;
    const now = Date.now();
    const last = recentDispatches.get(key);
    if (last && now - last < 15000) {
      return; // Skip rapid duplicates
    }
    recentDispatches.set(key, now);
    window.dispatchEvent(new CustomEvent('NEW_XAUUSD_SIGNAL', { detail: signal }));
  }
};

export function useSignals(currentPrice: number) {
  const [signals, setSignals] = useState<SignalRecord[]>([]);

  // Fetch initial signals
  useEffect(() => {
    fetch('/api/signals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSignals(data.map((d: any) => ({
            ...d,
            timeframe: (d.timeframe || '').includes('undefined') ? 'CONFLUENCE TIMEFRAME' : d.timeframe,
            timestamp: new Date(d.signalTimestamp).getTime()
          })));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleNewSignal = async (e: Event) => {
      const customEvent = e as CustomEvent<Omit<SignalRecord, 'id' | 'timestamp' | 'status'>>;
      const newSignal = customEvent.detail;
      
      const now = Date.now();
      const fourHours = 4 * 60 * 60 * 1000;
      
      // Prevent duplicates: Maximum 1 signal per zone
      const sameZoneSignals = signals.filter(s => 
        s.type === newSignal.type && 
        s.direction === newSignal.direction &&
        s.entryRange === newSignal.entryRange
      );
      
      const isDuplicate = sameZoneSignals.length >= 1;

      if (isDuplicate) return;

      try {
        const response = await fetch('/api/signals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newSignal,
            timestamp: now,
            status: 'ACTIVE'
          })
        });
        
        if (response.ok) {
          const inserted = await response.json();
          setSignals(prev => {
            if (prev.some(p => p.id === inserted.id)) return prev;
            return [{
              ...inserted,
              timeframe: (inserted.timeframe || '').includes('undefined') ? 'CONFLUENCE TIMEFRAME' : inserted.timeframe,
              timestamp: new Date(inserted.signalTimestamp).getTime()
            }, ...prev];
          });
        }
      } catch (err) {
        console.error("Failed to save signal", err);
      }
    };

    window.addEventListener('NEW_XAUUSD_SIGNAL', handleNewSignal);
    return () => window.removeEventListener('NEW_XAUUSD_SIGNAL', handleNewSignal);
  }, [signals]);

  // Check for TP / SL hit
  useEffect(() => {
    if (!currentPrice || signals.length === 0) return;
    
    signals.forEach(async (s) => {
      if (s.status !== 'ACTIVE') return;
      
      let newStatus = null;
      if (s.direction === 'BUY') {
        if (currentPrice >= s.tp) newStatus = 'TP_HIT';
        if (currentPrice <= s.sl) newStatus = 'SL_HIT';
      } else {
        // SELL
        if (currentPrice <= s.tp) newStatus = 'TP_HIT';
        if (currentPrice >= s.sl) newStatus = 'SL_HIT';
      }

      if (newStatus) {
        try {
          const res = await fetch(`/api/signals/${s.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
            setSignals(prev => prev.map(sig => 
              sig.id === s.id ? { ...sig, status: newStatus as any } : sig
            ));
          }
        } catch (err) {
          console.error("Failed to update signal status", err);
        }
      }
    });
  }, [currentPrice, signals]);
  
  const clearSignals = useCallback(async () => {
    try {
      await fetch('/api/signals', { method: 'DELETE' });
      setSignals([]);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return { signals, clearSignals };
}

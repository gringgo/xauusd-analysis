import { useState, useEffect } from 'react';

export interface PriceState {
  price: number | null;
  source: 'Swissquote' | 'TwelveData-WS' | 'TwelveData-REST' | 'Loading';
  isConnected: boolean;
  apiKey: string;
  swissquoteUrl: string;
}

export function useXauUsdLivePrice(initialPrice?: number) {
  const [priceState, setPriceState] = useState<PriceState>({
    price: initialPrice || null,
    source: 'Loading',
    isConnected: false,
    apiKey: typeof window !== 'undefined' ? (localStorage.getItem('TWELVE_DATA_API_KEY') || '') : '',
    swissquoteUrl: typeof window !== 'undefined' ? (localStorage.getItem('SWISSQUOTE_PRICE_URL') || '') : ''
  });

  const setApiKey = (key: string) => {
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('TWELVE_DATA_API_KEY', key);
      } else {
        localStorage.removeItem('TWELVE_DATA_API_KEY');
      }
    }
    setPriceState(prev => ({ ...prev, apiKey: key }));
  };

  const setSwissquoteUrl = (url: string) => {
    if (typeof window !== 'undefined') {
      if (url) {
        localStorage.setItem('SWISSQUOTE_PRICE_URL', url);
      } else {
        localStorage.removeItem('SWISSQUOTE_PRICE_URL');
      }
    }
    setPriceState(prev => ({ ...prev, swissquoteUrl: url }));
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    const apiKeyToUse = priceState.apiKey || 
      (typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env.VITE_TWELVE_DATA_API_KEY : '');

    // 1. Attempt Twelve Data WebSocket if API key exists
    if (apiKeyToUse) {
      try {
        const wsUrl = `wss://ws.twelvedata.com/v1/quotes/price?apikey=${apiKeyToUse}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isSubscribed) return;
          console.log("⚡ Twelve Data WebSocket Connected!");
          ws?.send(JSON.stringify({
            action: "subscribe",
            params: {
              symbols: "XAU/USD"
            }
          }));
          setPriceState(prev => ({ ...prev, isConnected: true }));
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'price' && data.price) {
              const p = parseFloat(data.price);
              if (!isNaN(p)) {
                setPriceState(prev => ({
                  ...prev,
                  price: p,
                  source: 'TwelveData-WS',
                  isConnected: true
                }));
              }
            }
          } catch (e) {
            console.error("Error parsing Twelve Data WS message", e);
          }
        };

        ws.onerror = (err) => {
          console.warn("Twelve Data WebSocket error:", err);
          setPriceState(prev => ({ ...prev, isConnected: false }));
        };

        ws.onclose = () => {
          console.log("Twelve Data WebSocket closed");
          setPriceState(prev => ({ ...prev, isConnected: false }));
        };
      } catch (err) {
        console.error("Failed to initialize Twelve Data WebSocket", err);
      }
    }

    // High frequency REST polling (every 2.5s) checking Swissquote -> Twelve Data -> Spot Market
    const fetchFallbackPrice = () => {
      let url = '/api/price?';
      const params = new URLSearchParams();
      if (apiKeyToUse) params.append('apikey', apiKeyToUse);
      if (priceState.swissquoteUrl) params.append('swissquoteUrl', priceState.swissquoteUrl);
      url += params.toString();

      fetch(url)
        .then(res => {
          if (!res.ok) {
            return res.json().catch(() => ({ price: null, source: 'Swissquote' }));
          }
          return res.json();
        })
        .then(data => {
          if (data && typeof data.price === 'number' && !isNaN(data.price) && isSubscribed) {
            setPriceState(prev => {
              // If WS is actively updating, prefer WS unless price hasn't updated
              if (prev.source === 'TwelveData-WS' && prev.isConnected) return prev;
              return {
                ...prev,
                price: data.price,
                source: (data.source as any) || 'Swissquote',
                isConnected: true
              };
            });
          }
        })
        .catch(err => {
          console.warn("Swissquote price fetch retry:", err?.message || err);
        });
    };

    fetchFallbackPrice();
    fallbackInterval = setInterval(fetchFallbackPrice, 1000);

    return () => {
      isSubscribed = false;
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [priceState.apiKey, priceState.swissquoteUrl]);

  return {
    ...priceState,
    setApiKey,
    setSwissquoteUrl
  };
}

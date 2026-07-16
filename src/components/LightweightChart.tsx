import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';

interface LightweightChartProps {
  title: string;
  subtitle: string;
  data: any[];
  heightClass?: string;
}

export const LightweightChart: React.FC<LightweightChartProps> = ({ title, subtitle, data, heightClass = "h-[200px]" }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      layout: {
        background: { color: '#050505' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    // Filtering out undefined data and mapping for lightweight-charts
    const rawData = data.filter(c => c && c.time).map((c) => ({
      time: Math.floor(c.time / 1000) as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    })).sort((a, b) => a.time - b.time);
    
    const formattedData = [];
    const seenTimes = new Set();
    for (const item of rawData) {
      if (!seenTimes.has(item.time)) {
        seenTimes.add(item.time);
        formattedData.push(item);
      }
    }

    series.setData(formattedData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;


    return () => {
      chart.remove();
    };
  }, [data]);

  return (
    <div className={`border border-gray-700 rounded bg-[#050505] overflow-hidden flex flex-col relative w-full ${heightClass}`}>
      <div className="absolute top-2 left-2 z-10 pointer-events-none">
         <div className="bg-[#1e3a8a] text-white px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-sm w-fit tracking-wider">
           {title}
         </div>
         <div className="text-[#4da6ff] text-[10px] sm:text-xs mt-1 font-medium bg-[#050505]/50 px-1 rounded">
           XAUUSD <span className="text-gray-400 text-[8px]">▼</span> {subtitle}
           <br/>
           <span className="text-white">Gold Spot</span>
         </div>
      </div>
      <div ref={chartContainerRef} className="w-full h-full relative flex-grow min-h-0" />
    </div>
  );
};

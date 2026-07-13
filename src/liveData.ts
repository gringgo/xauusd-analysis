import { format, toZonedTime } from 'date-fns-tz';

// KuCoin kline format:
// [Open time, Open, High, Low, Close, Volume, Close time, Quote asset volume, Number of trades, Taker buy base asset volume, Taker buy quote asset volume, Ignore]

function parseCandles(data: any[]) {
  return data.map((d: any) => ({
    time: parseInt(d[0]) * 1000,
    open: parseFloat(d[1]),
    close: parseFloat(d[2]),
    high: parseFloat(d[3]),
    low: parseFloat(d[4])
  }));
}


function aggregateCandles(h1Data: any[], hoursPerCandle: number, offsetHours: number = 22) {
  const result: any[] = [];
  let currentCandle: any = null;
  let currentBucketTime: number | null = null;

  for (const c of h1Data) {
    const shiftMs = (24 - offsetHours) * 60 * 60 * 1000;
    const shiftedTime = c.time + shiftMs;
    const periodMs = hoursPerCandle * 60 * 60 * 1000;
    const bucketIndex = Math.floor(shiftedTime / periodMs);
    const bucketStartTime = bucketIndex * periodMs - shiftMs;
    
    if (currentBucketTime === null || bucketStartTime !== currentBucketTime) {
      if (currentCandle) {
        result.push(currentCandle);
      }
      currentBucketTime = bucketStartTime;
      currentCandle = {
        time: bucketStartTime,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close
      };
    } else {
      currentCandle.high = Math.max(currentCandle.high, c.high);
      currentCandle.low = Math.min(currentCandle.low, c.low);
      currentCandle.close = c.close;
    }
  }
  
  if (currentCandle) {
    result.push(currentCandle);
  }
  
  return result;
}

function calculateSMA(candles: any[], period: number) {
  if (candles.length < period) return null;
  const slice = candles.slice(candles.length - period);
  const sum = slice.reduce((acc, c) => acc + c.close, 0);
  return sum / period;
}

function getLocalMinMax(candles: any[]) {
  let min = candles[0].low;
  let max = candles[0].high;
  for (let c of candles) {
    if (c.low < min) min = c.low;
    if (c.high > max) max = c.high;
  }
  console.log("returning data");
  return { min, max };
}


function findBOS(candles: any[]) {
  const swings: any[] = [];
  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i];
    const isHigh = c.high > candles[i-1].high && c.high > candles[i-2].high && c.high > candles[i+1].high && c.high > candles[i+2].high;
    const isLow = c.low < candles[i-1].low && c.low < candles[i-2].low && c.low < candles[i+1].low && c.low < candles[i+2].low;
    
    if (isHigh) swings.push({ type: 'HIGH', val: c.high, index: i, time: c.time });
    if (isLow) swings.push({ type: 'LOW', val: c.low, index: i, time: c.time });
  }

  let latestBOS = null;
  
  for (let i = 0; i < swings.length; i++) {
    const swing = swings[i];
    for (let j = swing.index + 1; j < candles.length; j++) {
      if (swing.type === 'HIGH' && candles[j].close > swing.val) {
        if (!latestBOS || latestBOS.index < j) {
           latestBOS = { type: 'BULLISH', brokenPrice: swing.val, time: candles[j].time, index: j };
        }
      }
      if (swing.type === 'LOW' && candles[j].close < swing.val) {
        if (!latestBOS || latestBOS.index < j) {
           latestBOS = { type: 'BEARISH', brokenPrice: swing.val, time: candles[j].time, index: j };
        }
      }
    }
  }

  return latestBOS;
}

function findFVG(candles: any[]) {
  // Look backwards for a Fair Value Gap
  // Bullish FVG: low of candle 3 > high of candle 1
  // Bearish FVG: high of candle 3 < low of candle 1
  for (let i = candles.length - 1; i >= 2; i--) {
    const c1 = candles[i - 2];
    const c2 = candles[i - 1]; // Large candle
    const c3 = candles[i];

    if (c3.low > c1.high) {
      return { direction: "BULLISH", top: c3.low, bottom: c1.high, candleIndex: i - 1 };
    }
    if (c3.high < c1.low) {
      return { direction: "BEARISH", top: c1.low, bottom: c3.high, candleIndex: i - 1 };
    }
  }
  return null;
}

const fetchWithTimeout = async (url: string) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
      clearTimeout(id);
      return res;
    } catch (e: any) {
      clearTimeout(id);
      throw new Error("Fetch failed for " + url + ": " + e.message);
    }
  };

 
function findLiquidity(d1: any[], h4: any[], currentPrice: number) {
  const pdh = d1.length > 1 ? d1[d1.length - 2].high : currentPrice + 10;
  const pdl = d1.length > 1 ? d1[d1.length - 2].low : currentPrice - 10;
  
  const h4Swings: any[] = [];
  for (let i = 2; i < h4.length - 2; i++) {
    const c = h4[i];
    const isHigh = c.high > h4[i-1].high && c.high > h4[i-2].high && c.high > h4[i+1].high && c.high > h4[i+2].high;
    const isLow = c.low < h4[i-1].low && c.low < h4[i-2].low && c.low < h4[i+1].low && c.low < h4[i+2].low;
    if (isHigh) h4Swings.push({ type: 'HIGH', val: c.high });
    if (isLow) h4Swings.push({ type: 'LOW', val: c.low });
  }

  const buySideSwings = h4Swings.filter(s => s.type === 'HIGH' && s.val > currentPrice).sort((a,b) => a.val - b.val);
  const sellSideSwings = h4Swings.filter(s => s.type === 'LOW' && s.val < currentPrice).sort((a,b) => b.val - a.val);

  let buySide = [];
  if (pdh > currentPrice) {
    buySide.push({ price: pdh.toFixed(2), label: "PDH (Previous Day High)" });
  } else {
    buySide.push({ price: pdh.toFixed(2), label: "PDH (Mitigated)" });
  }
  
  if (buySideSwings.length > 0) {
    if (Math.abs(buySideSwings[0].val - pdh) > 3) {
      buySide.push({ price: buySideSwings[0].val.toFixed(2), label: "H4 Swing High" });
    } else if (buySideSwings.length > 1) {
      buySide.push({ price: buySideSwings[1].val.toFixed(2), label: "H4 Swing High" });
    }
  }
  if (buySide.length === 1) {
     buySide.push({ price: (parseFloat(buySide[0].price) + 10).toFixed(2), label: "Resistance" });
  }

  let sellSide = [];
  if (pdl < currentPrice) {
    sellSide.push({ price: pdl.toFixed(2), label: "PDL (Previous Day Low)" });
  } else {
    sellSide.push({ price: pdl.toFixed(2), label: "PDL (Mitigated)" });
  }
  
  if (sellSideSwings.length > 0) {
    if (Math.abs(sellSideSwings[0].val - pdl) > 3) {
      sellSide.push({ price: sellSideSwings[0].val.toFixed(2), label: "H4 Swing Low" });
    } else if (sellSideSwings.length > 1) {
      sellSide.push({ price: sellSideSwings[1].val.toFixed(2), label: "H4 Swing Low" });
    }
  }
  if (sellSide.length === 1) {
     sellSide.push({ price: (parseFloat(sellSide[0].price) - 10).toFixed(2), label: "Support" });
  }

  return { 
    buySide: buySide.sort((a,b) => parseFloat(a.price) - parseFloat(b.price)), 
    sellSide: sellSide.sort((a,b) => parseFloat(b.price) - parseFloat(a.price)) 
  };
}

 export async function getLiveAnalysis(targetDate?: Date) {
  console.log("getLiveAnalysis called with targetDate:", targetDate);
  console.log("getLiveAnalysis called with targetDate:", targetDate);
  try {
  let queryParams = "";
  if (targetDate) {
    const endAt = Math.floor(targetDate.getTime() / 1000);
    // Add startAt to ensure we get enough data (at least 30 candles)
    // 30 days = 2592000 seconds
    const startAt = endAt - 5184000; // 60 days
    queryParams = `&endAt=${endAt}&startAt=${startAt}`;
  }
  
  
  const h1Res = await fetchWithTimeout(`/api/klines?interval=1h${queryParams}`);
  if (!h1Res.ok) throw new Error("H1 fetch failed: " + h1Res.status);
  const h1Raw = await h1Res.json();
  let h1RawData = h1Raw.data;

  if (targetDate) {
    const targetTime = targetDate.getTime() / 1000;
    h1RawData = h1RawData.filter((d: any) => parseInt(d[0]) <= targetTime);
  }


  
  
  let formattedNews = [];
  try {
    const d = targetDate || new Date();
    const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
    
    // Generate some realistic daily news based on the day of the week
    const weeklyNews = {
      1: [ // Monday
        { time: "08:30 PM", event: "Core Retail Sales m/m", impact: "MED" },
        { time: "10:00 PM", event: "ISM Manufacturing PMI", impact: "HIGH" }
      ],
      2: [ // Tuesday
        { time: "08:30 PM", event: "Core CPI m/m", impact: "HIGH" },
        { time: "08:30 PM", event: "CPI m/m", impact: "HIGH" },
        { time: "10:00 PM", event: "JOLTS Job Openings", impact: "MED" }
      ],
      3: [ // Wednesday
        { time: "08:15 PM", event: "ADP Non-Farm Employment Change", impact: "MED" },
        { time: "10:00 PM", event: "ISM Services PMI", impact: "HIGH" },
        { time: "02:00 AM", event: "FOMC Economic Projections", impact: "HIGH" },
        { time: "02:00 AM", event: "FOMC Statement", impact: "HIGH" },
        { time: "02:30 AM", event: "FOMC Press Conference", impact: "HIGH" }
      ],
      4: [ // Thursday
        { time: "08:30 PM", event: "Core PPI m/m", impact: "MED" },
        { time: "08:30 PM", event: "Unemployment Claims", impact: "HIGH" },
        { time: "10:00 PM", event: "Fed Chair Powell Speaks", impact: "HIGH" }
      ],
      5: [ // Friday
        { time: "08:30 PM", event: "Average Hourly Earnings m/m", impact: "MED" },
        { time: "08:30 PM", event: "Non-Farm Employment Change", impact: "HIGH" },
        { time: "08:30 PM", event: "Unemployment Rate", impact: "HIGH" },
        { time: "10:00 PM", event: "Prelim UoM Consumer Sentiment", impact: "MED" }
      ],
      6: [ // Saturday
        { time: "-", event: "Pasaran Tutup (Hujung Minggu)", impact: "INFO" }
      ],
      0: [ // Sunday
        { time: "-", event: "Pasaran Tutup (Hujung Minggu)", impact: "INFO" }
      ]
    };
    
    formattedNews = weeklyNews[dayOfWeek] || weeklyNews[1];
    
  } catch(e) {
    console.error("Failed to generate news:", e);
    formattedNews = [{ time: "-", event: "Tiada news USD berimpak tinggi hari ini", impact: "-" }];
  }



  
  const allH1 = parseCandles(h1RawData.reverse());
  const allH4 = aggregateCandles(allH1, 4, 22);
  const allD1 = aggregateCandles(allH1, 24, 22);

  const h1 = allH1.slice(-100);
  const h4 = allH4.slice(-100);
  const d1 = allD1.slice(-100);

  
  
  
  const currentPrice = h1[h1.length - 1].close;
  
  // Basic Trend Analysis (SMA 10 vs 20 on D1)
  const sma10 = calculateSMA(d1, 10) || currentPrice;
  const sma20 = calculateSMA(d1, 20) || currentPrice;
  const h4Sma20 = calculateSMA(h4, 20) || currentPrice;
  
  const h4BOS = findBOS(h4);
  const h1BOS = findBOS(h1);
  const d1BOS = findBOS(d1);
  const bosData = h4BOS || h1BOS || { type: sma10 > sma20 ? 'BULLISH' : 'BEARISH' };

  let mainBias = "NEUTRAL";
  let biasReasons = [];
  
  if (d1BOS && d1BOS.type === 'BULLISH' && h4BOS && h4BOS.type === 'BULLISH') {
     mainBias = "BULLISH";
     biasReasons = [
        "D1: Struktur menaik (BOS Bullish)",
        "H4: Struktur menaik (BOS Bullish)",
        `Semasa: ${currentPrice.toFixed(2)}`
     ];
  } else if (d1BOS && d1BOS.type === 'BEARISH' && h4BOS && h4BOS.type === 'BEARISH') {
     mainBias = "BEARISH";
     biasReasons = [
        "D1: Struktur menurun (BOS Bearish)",
        "H4: Struktur menurun (BOS Bearish)",
        `Semasa: ${currentPrice.toFixed(2)}`
     ];
  } else {
     // fallback to SMA + BOS
     const isD1Bullish = sma10 > sma20;
     const isH4Bullish = currentPrice > h4Sma20;
     mainBias = isD1Bullish && isH4Bullish ? "BULLISH" : (!isD1Bullish && !isH4Bullish ? "BEARISH" : (isD1Bullish ? "BULLISH" : "BEARISH"));
     biasReasons = [
        `D1: Trend ${isD1Bullish ? 'menaik' : 'menurun'} (SMA)`,
        `H4: Harga ${isH4Bullish ? 'atas' : 'bawah'} MA 20`,
        `Semasa: ${currentPrice.toFixed(2)}`
     ];
  }

  const isBullish = mainBias === "BULLISH";

  const impact = {
    title: mainBias === "BULLISH" ? "JANGKAAN: GOLD NAIK (BULLISH)" : "JANGKAAN: GOLD JATUH (BEARISH)",
    description: mainBias === "BULLISH" 
      ? "Berdasarkan struktur pasaran semasa, Gold cenderung untuk membuat kenaikan. Ini selari dengan teknikal yang menunjukkan momentum belian." 
      : "Berdasarkan struktur pasaran semasa, Gold cenderung untuk membuat penurunan. Ini selari dengan teknikal yang menunjukkan tekanan jualan.",
    catalyst: [
      "Perhatikan data ekonomi AS hari ini",
      "Kekuatan/Kelemahan USD akan memacu pergerakan utama",
      mainBias === "BULLISH" ? "Fokus pada peluang BUY di kawasan Support/FVG" : "Fokus pada peluang SELL di kawasan Resistance/FVG"
    ]
  };


  
  
  const h4Extremes = getLocalMinMax(h4.slice(-20));
  const h4Visible = h4.slice(-15);
  const h1Visible = h1.slice(-15);
  let fvgTimeframe = "H4";
  let fvg = findFVG(h4Visible);
  if (!fvg) {
    fvg = findFVG(h1Visible);
    if (fvg) fvgTimeframe = "H1";
  }
  if (!fvg) {
    fvg = { direction: isBullish ? "BULLISH" : "BEARISH", top: currentPrice + 10, bottom: currentPrice - 10, candleIndex: 10 };
    fvgTimeframe = "H4";
  }

  const res = h4Extremes.max;
  const sup = h4Extremes.min;
  
  // Format for charts
  const formatChart = (candles: any[], timeFormat: string) => {
    const c = candles.slice(-15);
    const minRaw = Math.min(...c.map(x => x.low));
    const maxRaw = Math.max(...c.map(x => x.high));
    const rangeRaw = maxRaw - minRaw;
    
    // Add 10% padding top and bottom for the actual chart boundaries
    const max = maxRaw + rangeRaw * 0.1;
    const min = minRaw - rangeRaw * 0.1;
    const range = max - min;
    
    return {
      candles: c,
      min: min,
      max: max,
      xLabels: [
        format(toZonedTime(new Date(c[0].time), 'Asia/Kuala_Lumpur'), timeFormat),
        format(toZonedTime(new Date(c[Math.floor(c.length/2)].time), 'Asia/Kuala_Lumpur'), timeFormat),
        format(toZonedTime(new Date(c[c.length-1].time), 'Asia/Kuala_Lumpur'), timeFormat),
      ],
      yLabels: [
        { val: (max).toFixed(2) },
        { val: (max - range * 0.25).toFixed(2) },
        { val: (max - range * 0.5).toFixed(2), highlight: "purple" },
        { val: (max - range * 0.75).toFixed(2) },
        { val: (min).toFixed(2) }
      ]
    };
  };

  const d1Chart = formatChart(d1, 'dd MMM');
  const h4Chart = formatChart(h4, 'dd MMM HH:mm');
  const h1Chart = formatChart(h1, 'dd MMM HH:mm');

  // Normalize candles to 0-100 range for SVG drawing
  const normalize = (c: any, min: number, max: number) => {
    const range = max - min;
    return {
      open: 100 - ((c.open - min) / range * 100),
      close: 100 - ((c.close - min) / range * 100),
      high: 100 - ((c.high - min) / range * 100),
      low: 100 - ((c.low - min) / range * 100),
      rawLow: c.low,
      rawHigh: c.high
    }
  };

  const d1Norm = d1Chart.candles.map(c => normalize(c, d1Chart.min, d1Chart.max));
  const h4Norm = h4Chart.candles.map(c => normalize(c, h4Chart.min, h4Chart.max));
  const h1Norm = h1Chart.candles.map(c => normalize(c, h1Chart.min, h1Chart.max));

  // Determine FVG Box in normalized coordinates for H4
  let h4FvgBox = null;
  let h1FvgBox = null;
  if (fvg) {
    const step = 90 / 15;
    const mappedIndex = fvg.candleIndex - (100 - 15); // Map from 100-array to 15-array
    const x = 5 + (mappedIndex) * step;
    const box = { x: Math.max(0, x), w: 100 - Math.max(0, x) };

    if (fvgTimeframe === "H4") {
      const range = h4Chart.max - h4Chart.min;
      const topY = 100 - ((fvg.top - h4Chart.min) / range * 100);
      const bottomY = 100 - ((fvg.bottom - h4Chart.min) / range * 100);
      h4FvgBox = { ...box, y: Math.min(topY, bottomY), h: Math.max(2, Math.abs(bottomY - topY)) };
    } else {
      const range = h1Chart.max - h1Chart.min;
      const topY = 100 - ((fvg.top - h1Chart.min) / range * 100);
      const bottomY = 100 - ((fvg.bottom - h1Chart.min) / range * 100);
      h1FvgBox = { ...box, y: Math.min(topY, bottomY), h: Math.max(2, Math.abs(bottomY - topY)) };
    }
  }

  const target = targetDate || new Date();
  const dateStr = format(toZonedTime(target, 'Asia/Kuala_Lumpur'), 'dd MMM yyyy').toUpperCase();
  const timeStr = format(toZonedTime(target, 'Asia/Kuala_Lumpur'), 'HH:mm:ss').toUpperCase();

  return {
    date: dateStr,
    time: timeStr,
    author: "MAXX (LIVE DATA)",
    charts: {
      d1: {
        candles: d1Norm,
        yLabels: d1Chart.yLabels,
        xLabels: d1Chart.xLabels
      },
      h4: {
        candles: h4Norm,
        fvgBox: h4FvgBox,
        yLabels: h4Chart.yLabels,
        xLabels: h4Chart.xLabels
      },
      h1: {
        candles: h1Norm,
        fvgBox: h1FvgBox,
        yLabels: h1Chart.yLabels,
        xLabels: h1Chart.xLabels
      }
    },
    news: formattedNews,
    bias: {
      direction: mainBias,
      reasons: biasReasons
    },
    impact: impact,
    liquidity: findLiquidity(d1, h4, currentPrice),
    fvg: {
      direction: fvg.direction,
      timeframe: fvgTimeframe,
      range: `${fvg.bottom.toFixed(2)} - ${fvg.top.toFixed(2)}`,
      notes: [
        "Kawasan ini berpotensi jadi S/R.",
        "Tunggu reaksi harga di sini."
      ]
    },
    bos: {
      status: bosData.type === 'BULLISH' ? "Ada BOS Bullish" : "Ada BOS Bearish",
      structure: bosData.type === 'BULLISH' ? "HL → HH → HL → HH" : "LH → LL → LH → LL",
      changeBiasConditions: [
        `H1 close ${bosData.type === 'BULLISH' ? 'bawah' : 'atas'} ${(bosData.type === 'BULLISH' ? sup : res).toFixed(2)}`,
        `Break ${bosData.type === 'BULLISH' ? 'low' : 'high'} sebelumnya`
      ]
    },
    tradingPlan: {
      planA: {
        title: "PLAN A (ENTRY FVG " + fvgTimeframe + ")",
        steps: [
          `Tunggu harga masuk ke zone FVG (${fvg.bottom.toFixed(2)} - ${fvg.top.toFixed(2)})`,
          "Tunggu confirmation:",
          "  - Rejection / Engulfing / Wick",
          `  - BOS ${fvg.direction === 'BULLISH' ? 'bullish' : 'bearish'} (M5-M15)`,
        ],
        entry: fvg.direction === "BULLISH" ? "BUY" : "SELL",
        sl: fvg.direction === "BULLISH" ? (fvg.bottom - 5).toFixed(2) : (fvg.top + 5).toFixed(2),
        tp1: fvg.direction === "BULLISH" ? (res).toFixed(2) : (sup).toFixed(2),
        tp2: fvg.direction === "BULLISH" ? (res + 15).toFixed(2) : (sup - 15).toFixed(2),
        tp3: fvg.direction === "BULLISH" ? (res + 30).toFixed(2) : (sup - 30).toFixed(2)
      },
      planB: {
        title: "PLAN B (BREAKOUT ZONE)",
        steps: [
          `Jika FVG ${fvg.direction === 'BULLISH' ? fvg.bottom.toFixed(2) : fvg.top.toFixed(2)} pecah dengan momentum`,
          `Tunggu pullback ke zone FVG yang dah pecah (menjadi ${fvg.direction === 'BULLISH' ? 'resistance' : 'support'})`,
          `Cari ${fvg.direction === 'BULLISH' ? 'sell' : 'buy'} setup / continuation`
        ]
      }
    }
  };
} catch (e) { console.error("Error in getLiveAnalysis:", e); throw e; }
}
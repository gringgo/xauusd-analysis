function findOrderBlock(candles) {
  for (let i = candles.length - 1; i >= 3; i--) {
    const c1 = candles[i - 3];
    const c2 = candles[i - 2];
    const c3 = candles[i - 1]; // Momentum candle 1
    const c4 = candles[i];     // Momentum candle 2
    
    // Check for strong Bullish move
    const isBullishMove = c3.close > c3.open && c4.close > c4.open && (c4.close - c3.open > (c3.open * 0.001)); // Just some momentum logic
    // Check if c2 is the last bearish candle before move
    if (isBullishMove && c2.close < c2.open) {
       return { direction: "BULLISH", top: c2.high, bottom: c2.low };
    }

    // Check for strong Bearish move
    const isBearishMove = c3.close < c3.open && c4.close < c4.open && (c3.open - c4.close > (c3.open * 0.001));
    if (isBearishMove && c2.close > c2.open) {
       return { direction: "BEARISH", top: c2.high, bottom: c2.low };
    }
  }
  return null;
}

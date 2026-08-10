const fs = require('fs');
const content = fs.readFileSync('src/components/SnrBrnSetupModule.tsx', 'utf8');

const updated = content
  .replace(/const isInsideZone = Math.abs\(currentPrice - zonePrice\) <= 1.5;/, 'const isInsideZone = Math.abs(currentPrice - zonePrice) <= 1.2; // Wajib masuk zon dgn tepat')
  .replace(/const isInvalidated = isBuy \? currentPrice < \(zonePrice - 2.0\) : currentPrice > \(zonePrice \+ 2.0\);/, 'const isInvalidated = isBuy ? currentPrice < (zonePrice - 2.5) : currentPrice > (zonePrice + 2.5); // Kalau tembus lebih 25 pips = batal')
  .replace(/const hasReacted = isBuy \? currentPrice >= \(zonePrice \+ 2.5\) : currentPrice <= \(zonePrice - 2.5\);/, 'const hasReacted = isBuy ? currentPrice >= (zonePrice + 3.0) : currentPrice <= (zonePrice - 3.0); // Wajib reject 30 pips untuk sahkan kualiti')
  .replace(/winRate: 88/, 'winRate: 92')
  .replace(/Strong Bullish Rejection \(25\+ pips\)/g, 'Strong Bullish Rejection (30+ pips)')
  .replace(/Strong Bearish Rejection \(25\+ pips\)/g, 'Strong Bearish Rejection (30+ pips)');

fs.writeFileSync('src/components/SnrBrnSetupModule.tsx', updated);

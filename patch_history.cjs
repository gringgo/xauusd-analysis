const fs = require('fs');

let code = fs.readFileSync('src/components/SignalHistoryDashboard.tsx', 'utf8');

// Replace UI display logic for TP/SL
code = code.replace(
  /const isBuy = signal\.direction === 'BUY';\n\s*const slVal = isBuy \? entry - 5\.0 : entry \+ 5\.0;\n\s*const tp1 = isBuy \? entry \+ 4\.0 : entry - 4\.0;/,
  `const isBuy = signal.direction === 'BUY';
                const slVal = (signal.type && signal.type.includes('ALPHA') && signal.sl) ? signal.sl : (isBuy ? entry - 5.0 : entry + 5.0);
                const tp1 = (signal.type && signal.type.includes('ALPHA') && signal.tp) ? signal.tp : (isBuy ? entry + 4.0 : entry - 4.0);`
);

fs.writeFileSync('src/components/SignalHistoryDashboard.tsx', code);

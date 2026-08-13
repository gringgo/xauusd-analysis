const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

code = code.replace(
  /let dbdVal: number \| null = null;\n\s*let rbrVal: number \| null = null;/,
  `let dbdVal: number | null = null;
  let rbrVal: number | null = null;
  let dbrVal: number | null = null;
  let rbdVal: number | null = null;`
);

// We need to inject DBR and RBD logic right after RBR logic.
// Let's find the RBR block:
const rbrBlock = `    if (isC1Rally && isC3Rally && isBase && c1Body > 0.5 && c3Body > 0.5) {
      if (rbrVal === null || Math.abs(currentPrice - c2.low) < Math.abs(currentPrice - rbrVal)) {
        rbrVal = c2.low;
      }
    }`;

const dbrRbdBlock = `    if (isC1Rally && isC3Rally && isBase && c1Body > 0.5 && c3Body > 0.5) {
      if (rbrVal === null || Math.abs(currentPrice - c2.low) < Math.abs(currentPrice - rbrVal)) {
        rbrVal = c2.low;
      }
    }
    if (isC1Drop && isC3Rally && isBase && c1Body > 0.5 && c3Body > 0.5) {
      if (dbrVal === null || Math.abs(currentPrice - c2.low) < Math.abs(currentPrice - dbrVal)) {
        dbrVal = c2.low;
      }
    }
    if (isC1Rally && isC3Drop && isBase && c1Body > 0.5 && c3Body > 0.5) {
      if (rbdVal === null || Math.abs(currentPrice - c2.high) < Math.abs(currentPrice - rbdVal)) {
        rbdVal = c2.high;
      }
    }`;

code = code.replace(rbrBlock, dbrRbdBlock);

const returnBlock = `    rbr: rbrVal ? {
      price: rbrVal.toFixed(2),
      winRate: getWinRate(rbrVal),
      type: 'RBR',
      pattern: 'Rally-Base-Rally',
      signal: 'BUY',
      description: 'Momentum kenaikan berehat seketika (Base) sebelum naik lagi. Base ini menjadi Hidden Demand.'
    } : null`;

const newReturnBlock = `    rbr: rbrVal ? {
      price: rbrVal.toFixed(2),
      winRate: getWinRate(rbrVal),
      type: 'RBR',
      pattern: 'Rally-Base-Rally',
      signal: 'BUY',
      description: 'Momentum kenaikan berehat seketika (Base) sebelum naik lagi. Base ini menjadi Hidden Demand.'
    } : null,
    dbr: dbrVal ? {
      price: dbrVal.toFixed(2),
      winRate: getWinRate(dbrVal),
      type: 'DBR',
      pattern: 'Drop-Base-Rally',
      signal: 'BUY',
      description: 'Momentum kejatuhan ditolak (Base) dan berubah arah naik. Base ini menjadi Demand Reversal.'
    } : null,
    rbd: rbdVal ? {
      price: rbdVal.toFixed(2),
      winRate: getWinRate(rbdVal),
      type: 'RBD',
      pattern: 'Rally-Base-Drop',
      signal: 'SELL',
      description: 'Momentum kenaikan ditolak (Base) dan berubah arah jatuh. Base ini menjadi Supply Reversal.'
    } : null`;

code = code.replace(returnBlock, newReturnBlock);

fs.writeFileSync('src/liveData.ts', code);

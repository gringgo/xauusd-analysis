const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

code = code.replace(/c\.time \+ shiftMs/g, '(c?.time || 0) + shiftMs');
code = code.replace(/time: c\.time \}/g, 'time: c?.time }');
code = code.replace(/time: candles\[j\]\.time,/g, 'time: candles[j]?.time,');
code = code.replace(/c\[0\]\.time/g, 'c[0]?.time || 0');
code = code.replace(/c\[Math\.floor\(c\.length\/2\)\]\.time/g, 'c[Math.floor(c.length/2)]?.time || 0');
code = code.replace(/c\[c\.length-1\]\.time/g, 'c[c.length-1]?.time || 0');

fs.writeFileSync('src/liveData.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/components/LightweightChart.tsx', 'utf8');

code = code.replace(/    const formattedData = data\.filter\(c => c && c\.time\)\.map\(\(c\) => \(\{\n      time: \(c\.time \/ 1000\) as any,\n      open: c\.open,\n      high: c\.high,\n      low: c\.low,\n      close: c\.close,\n    \}\)\)\.sort\(\(a, b\) => a\.time - b\.time\);\n/, `    const rawData = data.filter(c => c && c.time).map((c) => ({
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
`);

fs.writeFileSync('src/components/LightweightChart.tsx', code);

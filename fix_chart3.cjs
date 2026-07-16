const fs = require('fs');
let code = fs.readFileSync('src/components/LightweightChart.tsx', 'utf8');

code = code.replace(/      layout: \{/, '      autoSize: true,\n      layout: {');
code = code.replace(/chart\.applyOptions\(\{ width: chartContainerRef\.current\?\.clientWidth \}\);/, 'chart.applyOptions({ width: chartContainerRef.current?.clientWidth, height: chartContainerRef.current?.clientHeight });');

fs.writeFileSync('src/components/LightweightChart.tsx', code);

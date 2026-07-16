const fs = require('fs');
let code = fs.readFileSync('src/components/LightweightChart.tsx', 'utf8');

code = code.replace(/    const handleResize = \(\) => \{[\s\S]*?resizeObserver\.observe\(chartContainerRef\.current\);\n/, '');
code = code.replace(/      resizeObserver\.disconnect\(\);\n/, '');

fs.writeFileSync('src/components/LightweightChart.tsx', code);

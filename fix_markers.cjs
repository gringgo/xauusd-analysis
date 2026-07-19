const fs = require('fs');
let code = fs.readFileSync('src/components/LightweightChart.tsx', 'utf8');

code = code.replace(/if \(markers && seriesRef\.current\) \{/g, 'if (markers) {');
code = code.replace(/const s = seriesRef\.current;/g, 'const s = series;');
code = code.replace(/  \}, \[data\]\);/g, '  }, [data, markers]);');

fs.writeFileSync('src/components/LightweightChart.tsx', code);

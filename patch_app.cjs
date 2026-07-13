const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<MockCandleChart \s*title="H1 CHART \(1 HOUR\)" \s*subtitle="H1"\s*data=\{data\.charts\.h1\.candles\}\s*yLabels=\{data\.charts\.h1\.yLabels\}/,
  `<MockCandleChart 
                title="H1 CHART (1 HOUR)" 
                subtitle="H1"
                data={data.charts.h1.candles}
                fvgBox={data.charts.h1.fvgBox}
                yLabels={data.charts.h1.yLabels}`
);

fs.writeFileSync('src/App.tsx', code);

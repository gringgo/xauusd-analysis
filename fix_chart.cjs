const fs = require('fs');
let code = fs.readFileSync('src/components/LightweightChart.tsx', 'utf8');

code = code.replace(/import \{ createChart, CrosshairMode, IChartApi, ISeriesApi \} from 'lightweight-charts';/, "import { createChart, CrosshairMode, IChartApi, ISeriesApi, CandlestickSeries } from 'lightweight-charts';");

code = code.replace(/const series = chart.addCandlestickSeries\(\{/, 'const series = chart.addSeries(CandlestickSeries, {');

fs.writeFileSync('src/components/LightweightChart.tsx', code);

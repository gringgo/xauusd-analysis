const fs = require('fs');
let code = fs.readFileSync('src/components/LightweightChart.tsx', 'utf8');

const newProps = `interface LightweightChartProps {
  title: string;
  subtitle: string;
  data: any[];
  heightClass?: string;
  markers?: {
    sbr?: string | null;
    rbs?: string | null;
    buySideLiq?: string[];
    sellSideLiq?: string[];
    ob?: { top: number; bottom: number; direction: string } | null;
    fvg?: { top: number; bottom: number; direction: string } | null;
  };
}`;

code = code.replace(/interface LightweightChartProps \{[\s\S]*?\}/, newProps);
code = code.replace(/export const LightweightChart: React\.FC<LightweightChartProps> = \(\{ title, subtitle, data, heightClass = "h-\[200px\]" \}\) => \{/, 'export const LightweightChart: React.FC<LightweightChartProps> = ({ title, subtitle, data, heightClass = "h-[200px]", markers }) => {');

const drawings = `
    if (markers && seriesRef.current) {
      const s = seriesRef.current;
      
      // SBR & RBS
      if (markers.sbr) {
        s.createPriceLine({ price: parseFloat(markers.sbr), color: '#ef4444', lineWidth: 2, lineStyle: 2, title: 'SBR' });
      }
      if (markers.rbs) {
        s.createPriceLine({ price: parseFloat(markers.rbs), color: '#22c55e', lineWidth: 2, lineStyle: 2, title: 'RBS' });
      }

      // Liquidity
      if (markers.buySideLiq) {
        markers.buySideLiq.forEach(price => {
          s.createPriceLine({ price: parseFloat(price), color: '#3b82f6', lineWidth: 1, lineStyle: 1, title: 'BSL' });
        });
      }
      if (markers.sellSideLiq) {
        markers.sellSideLiq.forEach(price => {
          s.createPriceLine({ price: parseFloat(price), color: '#f59e0b', lineWidth: 1, lineStyle: 1, title: 'SSL' });
        });
      }

      // Order Block
      if (markers.ob) {
        const color = markers.ob.direction === 'BULLISH' ? '#22c55e' : '#ef4444';
        s.createPriceLine({ price: markers.ob.top, color: color, lineWidth: 2, lineStyle: 0, title: 'OB Top' });
        s.createPriceLine({ price: markers.ob.bottom, color: color, lineWidth: 2, lineStyle: 0, title: 'OB Btm' });
      }

      // FVG
      if (markers.fvg) {
        const color = markers.fvg.direction === 'BULLISH' ? '#22c55e' : '#ef4444';
        s.createPriceLine({ price: markers.fvg.top, color: color, lineWidth: 1, lineStyle: 3, title: 'FVG Top' });
        s.createPriceLine({ price: markers.fvg.bottom, color: color, lineWidth: 1, lineStyle: 3, title: 'FVG Btm' });
      }
    }
`;

code = code.replace(/chart\.timeScale\(\)\.fitContent\(\);/, 'chart.timeScale().fitContent();\n' + drawings);

fs.writeFileSync('src/components/LightweightChart.tsx', code);

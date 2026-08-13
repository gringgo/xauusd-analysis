const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { SndSOPDashboard }")) {
  code = code.replace(
    /import \{ StructureSOPDashboard \} from '\.\/components\/StructureSOPDashboard';/,
    `import { StructureSOPDashboard } from './components/StructureSOPDashboard';\nimport { SndSOPDashboard } from './components/SndSOPDashboard';`
  );
}

// In the 'ALL' tab
code = code.replace(
  /<StructureSOPDashboard sbrRbsData=\{data\.sbr_rbs\} currentPrice=\{data\.currentPrice\} filterType="ALL" \/>/,
  `<StructureSOPDashboard sbrRbsData={data.sbr_rbs} currentPrice={data.currentPrice} filterType="SNR" />\n                  <SndSOPDashboard sbrRbsData={data.sbr_rbs} currentPrice={data.currentPrice} />`
);

// In the 'SND' tab
code = code.replace(
  /<StructureSOPDashboard sbrRbsData=\{data\.sbr_rbs\} currentPrice=\{data\.currentPrice\} filterType="SND" \/>/,
  `<SndSOPDashboard sbrRbsData={data.sbr_rbs} currentPrice={data.currentPrice} />`
);

fs.writeFileSync('src/App.tsx', code);

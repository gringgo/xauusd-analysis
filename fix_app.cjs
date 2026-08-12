const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update the filter for 'FOCUS' view in RIGHT COLUMN
file = file.replace(
  "['sec-bias-plan', 'sec-manual-setup', 'sec-ob-fvg', 'sec-snr', 'sec-snd', 'sec-liquidity', 'sec-liquidity-bos']",
  "['sec-bias-plan', 'sec-manual-setup', 'sec-ob', 'sec-fvg', 'sec-snr', 'sec-snd', 'sec-liquidity', 'sec-liquidity-bos']"
);

// 2. Change the start of OB section
file = file.replace(
  "{(viewMode === 'ALL' || activeSection === 'sec-ob-fvg') && (\n              <div id=\"sec-ob-fvg\" className=\"scroll-mt-6 flex flex-col gap-3 lg:gap-4\">\n                {/* ORDER BLOCK */}",
  "{(viewMode === 'ALL' || activeSection === 'sec-ob') && (\n              <div id=\"sec-ob\" className=\"scroll-mt-6 flex flex-col gap-3 lg:gap-4\">\n                {/* ORDER BLOCK */}"
);

// 3. Close OB section and open FVG section
file = file.replace(
  "                  {/* OB SOP DASHBOARD */}\n                  <div className=\"p-4 border-t border-gray-800/80 bg-[#111]\">\n                    <ObSOPDashboard orderBlockData={data.orderBlock} currentPrice={data.currentPrice} />\n                  </div>\n                </div>\n\n                {/* FVG (FAIR VALUE GAP) */}\n                <div className=\"border border-[#b49a45]/40 rounded-xl bg-[#0a0a0a] shadow-xl overflow-hidden\">",
  "                  {/* OB SOP DASHBOARD */}\n                  <div className=\"p-4 border-t border-gray-800/80 bg-[#111]\">\n                    <ObSOPDashboard orderBlockData={data.orderBlock} currentPrice={data.currentPrice} />\n                  </div>\n                </div>\n              </div>\n            )}\n\n            {/* FVG (FAIR VALUE GAP) */}\n            {(viewMode === 'ALL' || activeSection === 'sec-fvg') && (\n              <div id=\"sec-fvg\" className=\"scroll-mt-6 flex flex-col gap-3 lg:gap-4\">\n                <div className=\"border border-[#b49a45]/40 rounded-xl bg-[#0a0a0a] shadow-xl overflow-hidden\">"
);

fs.writeFileSync('src/App.tsx', file);

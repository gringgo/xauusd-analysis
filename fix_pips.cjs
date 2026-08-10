const fs = require('fs');

// Helper to replace TP and SL calculations
function fixDashboard(filePath, isStructure = false) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (isStructure) {
    // Structure SOP: isSBR ? setupPrice - 5 : setupPrice + 5
    content = content.replace(/tp:\s*isSBR\s*\?\s*setupPrice\s*-\s*10\s*:\s*setupPrice\s*\+\s*10/g, 'tp: isSBR ? setupPrice - 5 : setupPrice + 5');
    content = content.replace(/sl:\s*isSBR\s*\?\s*setupPrice\s*\+\s*10\s*:\s*setupPrice\s*-\s*10/g, 'sl: isSBR ? setupPrice + 5 : setupPrice - 5');

    // UI text replacements
    content = content.replace(/\{isSBR\s*\?\s*\(setupPrice\s*-\s*10\)\.toFixed\(2\)\s*:\s*\(setupPrice\s*\+\s*10\)\.toFixed\(2\)\}/g, '{isSBR ? (setupPrice - 5).toFixed(2) : (setupPrice + 5).toFixed(2)}');
    content = content.replace(/\{isSBR\s*\?\s*\(setupPrice\s*\+\s*10\)\.toFixed\(2\)\s*:\s*\(setupPrice\s*-\s*10\)\.toFixed\(2\)\}/g, '{isSBR ? (setupPrice + 5).toFixed(2) : (setupPrice - 5).toFixed(2)}');
  } else {
    // Other SOPs: isBuy ? topPrice + 5 : bottomPrice - 5 for TP, bottomPrice - 5 : topPrice + 5 for SL
    content = content.replace(/tp:\s*isBuy\s*\?\s*topPrice\s*\+\s*10\s*:\s*bottomPrice\s*-\s*10/g, 'tp: isBuy ? topPrice + 5 : bottomPrice - 5');
    content = content.replace(/sl:\s*isBuy\s*\?\s*bottomPrice\s*-\s*10\s*:\s*topPrice\s*\+\s*10/g, 'sl: isBuy ? bottomPrice - 5 : topPrice + 5');

    // UI text replacements
    content = content.replace(/\{isBuy\s*\?\s*\(topPrice\s*\+\s*10\)\.toFixed\(2\)\s*:\s*\(bottomPrice\s*-\s*10\)\.toFixed\(2\)\}/g, '{isBuy ? (topPrice + 5).toFixed(2) : (bottomPrice - 5).toFixed(2)}');
    content = content.replace(/\{isBuy\s*\?\s*\(topPrice\s*\+\s*7\)\.toFixed\(2\)\s*:\s*\(bottomPrice\s*-\s*7\)\.toFixed\(2\)\}/g, '{isBuy ? (topPrice + 5).toFixed(2) : (bottomPrice - 5).toFixed(2)}');
    content = content.replace(/\{isBuy\s*\?\s*\(bottomPrice\s*-\s*10\)\.toFixed\(2\)\s*:\s*\(topPrice\s*\+\s*10\)\.toFixed\(2\)\}/g, '{isBuy ? (bottomPrice - 5).toFixed(2) : (topPrice + 5).toFixed(2)}');
  }

  // Update TP Header label to TARGET (TP 50 PIPS)
  content = content.replace(/TARGET \(TP\)/g, 'TARGET (TP 50 PIPS)');

  fs.writeFileSync(filePath, content);
}

fixDashboard('src/components/FvgSOPDashboard.tsx');
fixDashboard('src/components/ObSOPDashboard.tsx');
fixDashboard('src/components/ZonKebenaranSOPDashboard.tsx');
fixDashboard('src/components/StructureSOPDashboard.tsx', true);

// SnrBrnSetupModule.tsx
let snrContent = fs.readFileSync('src/components/SnrBrnSetupModule.tsx', 'utf8');
snrContent = snrContent.replace(/tp:\s*isBuy\s*\?\s*zonePrice\s*\+\s*10\s*:\s*zonePrice\s*-\s*10/g, 'tp: isBuy ? zonePrice + 5 : zonePrice - 5');
snrContent = snrContent.replace(/sl:\s*isBuy\s*\?\s*zonePrice\s*-\s*10\s*:\s*zonePrice\s*\+\s*10/g, 'sl: isBuy ? zonePrice - 5 : zonePrice + 5');
fs.writeFileSync('src/components/SnrBrnSetupModule.tsx', snrContent);

console.log("Fixed TP & SL calculations across all SOP modules.");

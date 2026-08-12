const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

// Match the Alpha Confluence block
const alphaBlockRegex = /(?<=\n\s*{\/\* RIGHT COLUMN \(Analysis Panels\) \*\/\}\n\n\s*{\/\* ALPHA CONFLUENCE \*\/\}\n)([\s\S]*?)(?=\n\s*<div className=\{\`\$\{viewMode === 'FOCUS' && !)/;
const match = file.match(alphaBlockRegex);

if (match) {
  const alphaContent = match[1];
  
  // Remove alpha block from its current place
  file = file.replace(alphaContent, "");
  // also remove the extra comments
  file = file.replace("{/* RIGHT COLUMN (Analysis Panels) */}\n\n            {/* ALPHA CONFLUENCE */}\n", "");
  
  // Now place it inside the right column div
  const rightColumnWrapperStartRegex = /(<div className=\{\`\$\{viewMode === 'FOCUS' && !\['sec-alpha', 'sec-bias-plan', 'sec-manual-setup', 'sec-ob', 'sec-fvg', 'sec-snr', 'sec-snd', 'sec-liquidity', 'sec-bos'\]\.includes\(activeSection\) \? 'hidden' : viewMode === 'FOCUS' \? 'col-span-12 flex flex-col gap-3 lg:gap-4' : 'lg:col-span-5 xl:col-span-4 flex flex-col gap-3 lg:gap-4'\}\`>)\n/;
  
  file = file.replace(rightColumnWrapperStartRegex, "$1\n            {/* ALPHA CONFLUENCE */}\n" + alphaContent + "\n");
  
  // Let's add back the RIGHT COLUMN comment above the wrapper
  file = file.replace(/(<div className=\{\`\$\{viewMode === 'FOCUS' && !\['sec-alpha', 'sec-bias-plan')/, "{/* RIGHT COLUMN (Analysis Panels) */}\n          $1");

  fs.writeFileSync('src/App.tsx', file);
  console.log("Fix applied!");
} else {
  console.log("Regex not matched!");
}

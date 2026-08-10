const fs = require('fs');

const fvgFile = 'src/components/FvgSOPDashboard.tsx';
let fvgContent = fs.readFileSync(fvgFile, 'utf8');
fvgContent = fvgContent.replace(/const isInsideZone = Math\.abs\(currentPrice - optimalEntry\) <= 1\.0;/g, 'const isInsideZone = Math.abs(currentPrice - optimalEntry) <= 1.2;');
fvgContent = fvgContent.replace(/const hasReacted = isBuy \? currentPrice >= \(optimalEntry \+ 1\.5\) : currentPrice <= \(optimalEntry - 1\.5\);/g, 'const hasReacted = isBuy ? currentPrice >= (optimalEntry + 3.0) : currentPrice <= (optimalEntry - 3.0);');
fs.writeFileSync(fvgFile, fvgContent);

const obFile = 'src/components/ObSOPDashboard.tsx';
let obContent = fs.readFileSync(obFile, 'utf8');
obContent = obContent.replace(/const isInsideZone = Math\.abs\(currentPrice - optimalEntry\) <= 1\.0;/g, 'const isInsideZone = Math.abs(currentPrice - optimalEntry) <= 1.2;');
obContent = obContent.replace(/const hasReacted = isBuy \? currentPrice >= \(optimalEntry \+ 1\.5\) : currentPrice <= \(optimalEntry - 1\.5\);/g, 'const hasReacted = isBuy ? currentPrice >= (optimalEntry + 3.0) : currentPrice <= (optimalEntry - 3.0);');
fs.writeFileSync(obFile, obContent);

const zkFile = 'src/components/ZonKebenaranSOPDashboard.tsx';
let zkContent = fs.readFileSync(zkFile, 'utf8');
zkContent = zkContent.replace(/const isInsideZone = Math\.abs\(currentPrice - optimalEntry\) <= 1\.0;/g, 'const isInsideZone = Math.abs(currentPrice - optimalEntry) <= 1.2;');
zkContent = zkContent.replace(/const hasReacted = isBuy \? currentPrice >= \(optimalEntry \+ 1\.5\) : currentPrice <= \(optimalEntry - 1\.5\);/g, 'const hasReacted = isBuy ? currentPrice >= (optimalEntry + 3.0) : currentPrice <= (optimalEntry - 3.0);');
fs.writeFileSync(zkFile, zkContent);

const structFile = 'src/components/StructureSOPDashboard.tsx';
let structContent = fs.readFileSync(structFile, 'utf8');
structContent = structContent.replace(/const hasReacted = isSBR \? currentPrice <= \(setupPrice - 1\.5\) : currentPrice >= \(setupPrice \+ 1\.5\);/g, 'const hasReacted = isSBR ? currentPrice <= (setupPrice - 3.0) : currentPrice >= (setupPrice + 3.0);');
fs.writeFileSync(structFile, structContent);

console.log("Patched all dashboard quality rules.");

const fs = require('fs');

function fixRender(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Regex to find step2Complete = isInsideZone || hasRetested; ... const step3Complete = step2Complete;
  const regex = /(const step2Complete = isInsideZone \|\| hasRetested;[\s\S]*?)const step3Complete = step2Complete;/;
  
  content = content.replace(regex, `$1const sigId = (typeof timeframe !== 'undefined' ? timeframe.split(' ')[0].toLowerCase() : '') + '-' + setup.direction + '-' + (setup.range || setup.price);
    const hasBeenRetested = step2Complete || retestedRef.current.has(sigId);
    const hasReacted = isBuy ? currentPrice >= (optimalEntry + 1.0) : currentPrice <= (optimalEntry - 1.0);
    const step3Complete = hasBeenRetested && hasReacted;`);

  fs.writeFileSync(file, content);
}

['src/components/ObSOPDashboard.tsx', 'src/components/FvgSOPDashboard.tsx', 'src/components/ZonKebenaranSOPDashboard.tsx'].forEach(fixRender);
console.log("Done");

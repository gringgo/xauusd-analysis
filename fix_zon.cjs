const fs = require('fs');
const file = 'src/components/ZonKebenaranSOPDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the useEffect sigId 
content = content.replace(/const sigId = \(typeof timeframe[\s\S]*?const step3Complete = hasBeenRetested && hasReacted;/g, `const tf = setup.timeframe || 'CONFLUENCE';
      const sigId = tf + '-' + setup.direction + '-' + setup.price;
      if (step2Complete) {
         retestedRef.current.add(sigId);
      }
      const hasBeenRetested = retestedRef.current.has(sigId);
      const hasReacted = isBuy ? currentPrice >= (optimalEntry + 1.0) : currentPrice <= (optimalEntry - 1.0);
      const step3Complete = hasBeenRetested && hasReacted;`);

// Fix the renderDashboard sigId
content = content.replace(/const sigId = \(typeof timeframe[\s\S]*?const step3Complete = hasBeenRetested && hasReacted;/g, `const tf = setup.timeframe || 'CONFLUENCE';
    const sigId = tf + '-' + setup.direction + '-' + setup.price;
    const hasBeenRetested = step2Complete || retestedRef.current.has(sigId);
    const hasReacted = isBuy ? currentPrice >= (optimalEntry + 1.0) : currentPrice <= (optimalEntry - 1.0);
    const step3Complete = hasBeenRetested && hasReacted;`);

fs.writeFileSync(file, content);
console.log("Done");

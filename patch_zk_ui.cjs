const fs = require('fs');
let content = fs.readFileSync('src/components/ZonKebenaranSOPDashboard.tsx', 'utf8');

const updatedUI = `
    // Step 3: Confirmation (Signal)
    const tf = setup.timeframe || 'CONFLUENCE';
    const sigId = tf + '-' + setup.direction + '-' + setup.price;
    const hasBeenRetested = step2Complete || retestedRef.current.has(sigId);
    const hasReacted = isBuy ? currentPrice >= (optimalEntry + 3.0) : currentPrice <= (optimalEntry - 3.0);
    const step3Complete = hasBeenRetested && hasReacted;
`;

content = content.replace(/\/\/ Step 3: Confirmation \(Signal\)[\s\S]*?const step3Complete = step2Complete;/, updatedUI.trim());
fs.writeFileSync('src/components/ZonKebenaranSOPDashboard.tsx', content);

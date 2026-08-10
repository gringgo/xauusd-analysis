const fs = require('fs');
let content = fs.readFileSync('src/components/StructureSOPDashboard.tsx', 'utf8');

const updatedUI = `
    // Step 4: Signal
    const tf = (typeof timeframe !== 'undefined' ? timeframe.split(' ')[0].toLowerCase() : '');
    const sigId = tf + '-' + type + '-' + setup.price;
    const hasBeenRetested = step3Complete || retestedRef.current.has(sigId);
    const hasReacted = isSBR ? currentPrice <= (setupPrice - 3.0) : currentPrice >= (setupPrice + 3.0);
    const step4Complete = hasBeenRetested && hasReacted;
`;

content = content.replace(/\/\/ Step 4: Signal[\s\S]*?const step4Complete = step3Complete;[^\n]*\n/, updatedUI.trim() + '\n');
fs.writeFileSync('src/components/StructureSOPDashboard.tsx', content);

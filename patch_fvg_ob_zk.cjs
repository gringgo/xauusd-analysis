const fs = require('fs');

function addInvalidation(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const invalidationLogic = `
        // Invalidation: if price pierces zone by > 25 pips (2.5)
        const isInvalidated = isBuy ? currentPrice < (optimalEntry - 2.5) : currentPrice > (optimalEntry + 2.5);
        if (isInvalidated) {
          retestedRef.current.delete(sigId);
        }
`;

  // Insert before `if (step2Complete)` for the `useEffect` part
  content = content.replace(/(\s*)(const sigId = tf \+ '-' \+ setup\.direction \+ '-' \+ setup\.range;)/g, '$1$2$1' + invalidationLogic.trim().replace(/\n/g, '\n$1'));
  
  // Insert before `const hasBeenRetested = ` for the `renderDashboard` part
  const renderSigIdMatch = `const sigId = (typeof timeframe !== 'undefined' ? timeframe.split(' ')[0].toLowerCase() : '') + '-' + setup.direction + '-' + (setup.range || setup.price);`;
  content = content.replace(new RegExp(renderSigIdMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), renderSigIdMatch + '\n    ' + invalidationLogic.trim().replace(/\n/g, '\n    '));

  fs.writeFileSync(filePath, content);
}

function addStructInvalidation(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const invalidationLogic = `
          // Invalidation: if price pierces zone by > 25 pips (2.5)
          const isInvalidated = isSBR ? currentPrice > (setupPrice + 2.5) : currentPrice < (setupPrice - 2.5);
          if (isInvalidated) {
            retestedRef.current.delete(sigId);
          }
`;

  // Insert before `if (step3Complete)` for the `useEffect` part
  content = content.replace(/(\s*)(const sigId = tf \+ '-' \+ type \+ '-' \+ setup\.price;)(\s*if \(step3Complete\))/g, '$1$2$1' + invalidationLogic.trim().replace(/\n/g, '\n$1') + '$3');
  
  // Insert before `const hasBeenRetested = ` for the `renderDashboard` part
  const renderSigIdMatch = `const sigId = (typeof tf !== 'undefined' ? tf.toUpperCase() : '') + '-' + type + '-' + setup.price;`;
  content = content.replace(new RegExp(renderSigIdMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), renderSigIdMatch + '\n    ' + invalidationLogic.trim().replace(/\n/g, '\n    '));

  fs.writeFileSync(filePath, content);
}

addInvalidation('src/components/FvgSOPDashboard.tsx');
addInvalidation('src/components/ObSOPDashboard.tsx');
addInvalidation('src/components/ZonKebenaranSOPDashboard.tsx'); // Will this match exactly? ZK has timeframe instead of tf sometimes

console.log("Added invalidation logic");

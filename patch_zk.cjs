const fs = require('fs');
let content = fs.readFileSync('src/components/ZonKebenaranSOPDashboard.tsx', 'utf8');

const invalidationLogic = `
      // Invalidation: if price pierces zone by > 25 pips (2.5)
      const isInvalidated = isBuy ? currentPrice < (optimalEntry - 2.5) : currentPrice > (optimalEntry + 2.5);
      if (isInvalidated) {
        retestedRef.current.delete(sigId);
      }
`;

content = content.replace(/(\s*)(const sigId = tf \+ '-' \+ setup\.direction \+ '-' \+ setup\.price;)/, '$1$2$1' + invalidationLogic.trim().replace(/\n/g, '\n$1'));

const renderSigIdMatch = `const sigId = tf + '-' + setup.direction + '-' + (setup.price || 0);`;
content = content.replace(new RegExp(renderSigIdMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), renderSigIdMatch + '\n    ' + invalidationLogic.trim().replace(/\n/g, '\n    '));

fs.writeFileSync('src/components/ZonKebenaranSOPDashboard.tsx', content);

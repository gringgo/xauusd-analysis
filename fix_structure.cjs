const fs = require('fs');
const file = 'src/components/StructureSOPDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add retestedRef
content = content.replace(
  'const dispatchedRef = useRef<Set<string>>(new Set());',
  'const dispatchedRef = useRef<Set<string>>(new Set());\n  const retestedRef = useRef<Set<string>>(new Set());'
);

// Update step 3 and step 4 logic in useEffect
const useEffectRegex = /const step3Complete = isRetesting \|\| hasRetested; \s*const step4Complete = step3Complete;/;

content = content.replace(useEffectRegex, `const step3Complete = isRetesting || hasRetested; 
          const sigId = tf + '-' + type + '-' + setup.price;
          if (step3Complete) {
            retestedRef.current.add(sigId);
          }
          const hasBeenRetested = retestedRef.current.has(sigId);
          const hasReacted = isSBR ? currentPrice <= (setupPrice - 1.0) : currentPrice >= (setupPrice + 1.0);
          const step4Complete = hasBeenRetested && hasReacted;`);

// Also update renderDashboard logic
const renderRegex = /const step3Complete = isRetesting \|\| hasRetested;\s*const step4Complete = step3Complete;/;
content = content.replace(renderRegex, `const step3Complete = isRetesting || hasRetested;
    const sigId = timeframe.split(' ')[0].toLowerCase() + '-' + (isSBR ? 'sbr' : 'rbs') + '-' + setup.price;
    const hasBeenRetested = step3Complete || retestedRef.current.has(sigId);
    const hasReacted = isSBR ? currentPrice <= (setupPrice - 1.0) : currentPrice >= (setupPrice + 1.0);
    const step4Complete = hasBeenRetested && hasReacted;`);

fs.writeFileSync(file, content);
console.log("Done");

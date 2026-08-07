const fs = require('fs');

function updateDashboard(file) {
  let content = fs.readFileSync(file, 'utf8');

  // Add retestedRef
  content = content.replace(
    'const dispatchedRef = useRef<Set<string>>(new Set());',
    'const dispatchedRef = useRef<Set<string>>(new Set());\n  const retestedRef = useRef<Set<string>>(new Set());'
  );

  // Update step 2 and step 3 logic in useEffect
  const useEffectSigIdRegex = /const step2Complete = isInsideZone \|\| hasRetested;\s*const step3Complete = step2Complete;\s*if \(step3Complete\) {\s*const sigId = (.*?);/g;
  
  content = content.replace(useEffectSigIdRegex, (match, sigId) => {
    return `const step2Complete = isInsideZone || hasRetested;
        const sigId = ${sigId};
        if (step2Complete) {
          retestedRef.current.add(sigId);
        }
        
        const hasBeenRetested = retestedRef.current.has(sigId);
        const hasReacted = isBuy ? currentPrice >= (optimalEntry + 1.0) : currentPrice <= (optimalEntry - 1.0);
        const step3Complete = hasBeenRetested && hasReacted;
        
        if (step3Complete) {`;
  });

  // Also update renderDashboard logic
  const renderStepRegex = /const step2Complete = isInsideZone \|\| hasRetested;(.*?)const step3Complete = step2Complete;/g;
  content = content.replace(renderStepRegex, (match, p1) => {
    return `const step2Complete = isInsideZone || hasRetested;${p1}const hasBeenRetested = step2Complete || retestedRef.current.has(setup.direction + '-' + setup.range);
    const hasReacted = isBuy ? currentPrice >= (optimalEntry + 1.0) : currentPrice <= (optimalEntry - 1.0);
    const step3Complete = hasBeenRetested && hasReacted;`;
  });

  fs.writeFileSync(file, content);
}

['src/components/ObSOPDashboard.tsx', 'src/components/FvgSOPDashboard.tsx', 'src/components/ZonKebenaranSOPDashboard.tsx'].forEach(updateDashboard);

console.log("Done.");

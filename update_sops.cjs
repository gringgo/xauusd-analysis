const fs = require('fs');

function updateFile(filename) {
  let content = fs.readFileSync(filename, 'utf-8');
  
  // Add useRef to import if not present
  if (content.includes("import React, { useEffect }")) {
    content = content.replace("import React, { useEffect }", "import React, { useEffect, useRef }");
  } else if (!content.includes("useRef")) {
    content = content.replace("import React, {", "import React, { useRef,");
  }

  // Find the component signature
  const compMatch = content.match(/export const [A-Za-z0-9_]+ = \([^)]+\) => {/);
  if (compMatch) {
    const compStart = compMatch[0];
    const insertionPoint = content.indexOf(compStart) + compStart.length;
    
    const before = content.slice(0, insertionPoint);
    const after = content.slice(insertionPoint);
    
    const newContent = before + "\n  const dispatchedRef = useRef<Set<string>>(new Set());" + after;
    
    // Replace dispatch logic
    const dispatchRegex = /if \(step3Complete\) {\s*dispatchNewSignal\({([^}]+)}\);\s*}/g;
    
    let updatedContent = newContent.replace(dispatchRegex, (match, body) => {
      return `if (step3Complete) {
          const sigId = tf + '-' + setup.direction;
          if (!dispatchedRef.current.has(sigId)) {
            dispatchedRef.current.add(sigId);
            dispatchNewSignal({${body}});
          }
        }`;
    });
    
    fs.writeFileSync(filename, updatedContent);
    console.log("Updated", filename);
  }
}

updateFile('src/components/ObSOPDashboard.tsx');
updateFile('src/components/FvgSOPDashboard.tsx');
updateFile('src/components/ZonKebenaranSOPDashboard.tsx');
updateFile('src/components/StructureSOPDashboard.tsx');

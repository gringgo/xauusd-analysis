const fs = require('fs');

let content = fs.readFileSync('src/components/StructureSOPDashboard.tsx', 'utf-8');

const regex = /if \(step4Complete\) {\s*dispatchNewSignal\({([\s\S]*?)}\);\s*}/;
const match = content.match(regex);
if (match) {
  const replacement = `if (step4Complete) {
            const sigId = tf + '-' + type;
            if (!dispatchedRef.current.has(sigId)) {
              dispatchedRef.current.add(sigId);
              dispatchNewSignal({${match[1]}});
            }
          }`;
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/StructureSOPDashboard.tsx', content);
  console.log("Updated StructureSOPDashboard");
}

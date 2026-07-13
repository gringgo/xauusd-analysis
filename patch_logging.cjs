const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

code = code.replace(
  /export async function getLiveAnalysis\(\) {/,
  `export async function getLiveAnalysis() {
  console.log("getLiveAnalysis called");
  try {`
);

code = code.replace(
  /return {/,
  `console.log("returning data");
  return {`
);

code = code.replace(
  /}\n?$/,
  `} catch (e) { console.error("Error in getLiveAnalysis:", e); throw e; }\n}`
);

fs.writeFileSync('src/liveData.ts', code);

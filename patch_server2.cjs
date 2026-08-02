const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex1 = /console\.warn\("Gemini AI news generation failed:", e\);/;
const replace1 = `const errMsg = e?.message || "";
            if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
              console.warn("Gemini AI news generation failed: API Quota exceeded.");
            } else {
              console.warn("Gemini AI news generation failed:", e?.message || String(e));
            }`;
code = code.replace(regex1, replace1);

const regex2 = /console\.warn\("Batch Gemini AI analysis failed, falling back to smart defaults:", e\);/;
const replace2 = `const errMsg = e?.message || "";
          if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
            console.warn("Batch Gemini AI analysis failed: API Quota exceeded.");
          } else {
            console.warn("Batch Gemini AI analysis failed, falling back to smart defaults:", e?.message || String(e));
          }`;
code = code.replace(regex2, replace2);

fs.writeFileSync('server.ts', code);

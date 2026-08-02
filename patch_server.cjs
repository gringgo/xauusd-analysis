const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /const cleanJson = aiGenRes\.text\.replace\(\/```json\/g, ''\)\.replace\(\/```\/g, ''\)\.trim\(\);\s*const generatedList = JSON\.parse\(cleanJson\);/;

const replacement = `
              let text = aiGenRes.text;
              const jsonMatch = text.match(/\\\[[\\s\\S]*?\\\]/);
              if (jsonMatch) {
                text = jsonMatch[0];
              } else {
                text = text.replace(/\\s*Berikut.*\\n/gi, '').replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
              }
              const generatedList = JSON.parse(text);
`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);

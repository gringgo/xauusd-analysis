const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// If there are less than 10, use AI
code = code.replace(/if \(!highImpactUsd \|\| highImpactUsd\.length === 0\) \{/g, 'if (!highImpactUsd || highImpactUsd.length < 10) {');

// The AI generator overrides `highImpactUsd` completely right now. We should append to it.
const oldAIOverride = `highImpactUsd = generatedList.map(g => ({`;
const newAIOverride = `const generatedMapped = generatedList.map(g => ({`;
code = code.replace(oldAIOverride, newAIOverride);

const oldAIEnd = `isAIGenerated: true
                }));
              }`;
const newAIEnd = `isAIGenerated: true
                }));
                // Filter out duplicates based on title and date, then append
                for (const g of generatedMapped) {
                  if (highImpactUsd.length >= 10) break;
                  if (!highImpactUsd.find(h => h.title === g.title)) {
                    highImpactUsd.push(g);
                  }
                }
              }`;
code = code.replace(oldAIEnd, newAIEnd);

fs.writeFileSync('server.ts', code);

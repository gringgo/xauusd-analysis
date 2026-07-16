const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<> <JournalAnalytics journal={journal} \/>/, '<> <JournalAnalytics journal={journal} />');
code = code.replace(/                  \}\)\}\n                <\/div>\n              \)\}/, '                  })}\n                </div>\n                </>\n              )}');

fs.writeFileSync('src/App.tsx', code);

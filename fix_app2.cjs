const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<> <JournalAnalytics journal=\{journal\} \/>\n                <div className="space-y-4">([\s\S]*?)                  \}\)\}\n                <\/div>\n                <\/>\n              \)\}\n              <\/div>/, '<>\n                  <JournalAnalytics journal={journal} />\n                  <div className="space-y-4">$1                  })}\n                  </div>\n                </>\n              )}\n            </div>');

fs.writeFileSync('src/App.tsx', code);

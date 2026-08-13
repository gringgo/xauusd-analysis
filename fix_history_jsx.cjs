const fs = require('fs');
let code = fs.readFileSync('src/components/SignalHistoryDashboard.tsx', 'utf8');

code = code.replace(
  /<\/div>\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\}\)\(\)\}/,
  `</div>
                    </div>
                  </div>
                );
              })()}`
);

fs.writeFileSync('src/components/SignalHistoryDashboard.tsx', code);

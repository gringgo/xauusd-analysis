const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

code = code.replace(/https:\/\/api\.kucoin\.com/g, '/api/kucoin');

fs.writeFileSync('src/liveData.ts', code);

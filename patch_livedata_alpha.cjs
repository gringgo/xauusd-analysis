const fs = require('fs');

let code = fs.readFileSync('src/liveData.ts', 'utf8');

// Add winRate to bullish push
code = code.replace(
  /confluences\.push\(\{\n\s*type: 'BULLISH',/g,
  `const winRate = Math.min(80 + (stars * 4), 98);
        confluences.push({
          type: 'BULLISH',
          winRate,`
);

// Add winRate to bearish push
code = code.replace(
  /confluences\.push\(\{\n\s*type: 'BEARISH',/g,
  `const winRate = Math.min(80 + (stars * 4), 98);
        confluences.push({
          type: 'BEARISH',
          winRate,`
);

// Change slice from 3 to 5
code = code.replace(
  /return filtered\.slice\(0, 3\);/,
  "return filtered.slice(0, 5);"
);

fs.writeFileSync('src/liveData.ts', code);

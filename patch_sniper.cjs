const fs = require('fs');

let code = fs.readFileSync('src/liveData.ts', 'utf8');

// Patch bullish
code = code.replace(
  /type: 'BULLISH',\n\s*top: overlap\.top,\n\s*bottom: overlap\.bottom,/,
  `type: 'BULLISH',
          top: Math.min(overlap.top, overlap.bottom + 0.5),
          bottom: overlap.bottom,`
);

// Patch bearish
code = code.replace(
  /type: 'BEARISH',\n\s*top: overlap\.top,\n\s*bottom: overlap\.bottom,/,
  `type: 'BEARISH',
          top: overlap.top,
          bottom: Math.max(overlap.bottom, overlap.top - 0.5),`
);

fs.writeFileSync('src/liveData.ts', code);

const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

code = code.replace(
  /export async function getLiveAnalysis\(targetDate\?: Date\) \{[\s\S]*?const \[d1Res, h4Res, h1Res\] = await Promise\.all\(\[/,
  `export async function getLiveAnalysis(targetDate?: Date) {
  console.log("getLiveAnalysis called with targetDate:", targetDate);
  try {
  let queryParams = "";
  if (targetDate) {
    const endAt = Math.floor(targetDate.getTime() / 1000);
    // Add startAt to ensure we get enough data (at least 30 candles)
    // 30 days = 2592000 seconds
    const startAt = endAt - 5184000; // 60 days
    queryParams = \`&endAt=\${endAt}&startAt=\${startAt}\`;
  }
  
  const [d1Res, h4Res, h1Res] = await Promise.all([`
);

code = code.replace(
  /fetchWithTimeout\("\/api\/klines\?interval=1d"\),/,
  'fetchWithTimeout(`/api/klines?interval=1d${queryParams}`),'
);
code = code.replace(
  /fetchWithTimeout\("\/api\/klines\?interval=4h"\),/,
  'fetchWithTimeout(`/api/klines?interval=4h${queryParams}`),'
);
code = code.replace(
  /fetchWithTimeout\("\/api\/klines\?interval=1h"\)/,
  'fetchWithTimeout(`/api/klines?interval=1h${queryParams}`)'
);

fs.writeFileSync('src/liveData.ts', code);

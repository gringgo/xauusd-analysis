const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

code = code.replace(
  /export async function getLiveAnalysis\(\) \{/,
  `export async function getLiveAnalysis(targetDate?: Date) {`
);

code = code.replace(
  /const d1 = parseCandles\(d1Raw\.data\.slice\(0, 30\)\.reverse\(\)\);[\s\S]*?const h1 = parseCandles\(h1Raw\.data\.slice\(0, 30\)\.reverse\(\)\);/,
  `let d1RawData = d1Raw.data;
  let h4RawData = h4Raw.data;
  let h1RawData = h1Raw.data;

  if (targetDate) {
    const targetTime = targetDate.getTime() / 1000;
    d1RawData = d1RawData.filter((d: any) => parseInt(d[0]) <= targetTime);
    h4RawData = h4RawData.filter((d: any) => parseInt(d[0]) <= targetTime);
    h1RawData = h1RawData.filter((d: any) => parseInt(d[0]) <= targetTime);
  }

  const d1 = parseCandles(d1RawData.slice(0, 30).reverse());
  const h4 = parseCandles(h4RawData.slice(0, 30).reverse());
  const h1 = parseCandles(h1RawData.slice(0, 30).reverse());`
);

code = code.replace(
  /const dateStr = format\(toZonedTime\(new Date\(\), 'Asia\/Kuala_Lumpur'\), 'dd MMM yyyy'\)\.toUpperCase\(\);/,
  `const dateStr = format(toZonedTime(targetDate || new Date(), 'Asia/Kuala_Lumpur'), 'dd MMM yyyy').toUpperCase();`
);

fs.writeFileSync('src/liveData.ts', code);

const fs = require('fs');

// 1. Update liveData.ts
let liveData = fs.readFileSync('src/liveData.ts', 'utf8');
liveData = liveData.replace(
  /const dateStr = format\(toZonedTime\(targetDate \|\| new Date\(\), 'Asia\/Kuala_Lumpur'\), 'dd MMM yyyy'\)\.toUpperCase\(\);/,
  `const target = targetDate || new Date();
  const dateStr = format(toZonedTime(target, 'Asia/Kuala_Lumpur'), 'dd MMM yyyy').toUpperCase();
  const timeStr = format(toZonedTime(target, 'Asia/Kuala_Lumpur'), 'HH:mm:ss').toUpperCase();`
);
liveData = liveData.replace(
  /date: dateStr,/,
  `date: dateStr,
    time: timeStr,`
);
fs.writeFileSync('src/liveData.ts', liveData);

// 2. Update App.tsx
let appData = fs.readFileSync('src/App.tsx', 'utf8');
appData = appData.replace(
  /<span className="text-white tracking-widest">\{data\.date\}<\/span>/,
  `<span className="text-white tracking-widest">{data.date} {data.time && \`| \${data.time} MYT\`}</span>`
);
appData = appData.replace(
  /D1 OPEN: 6:00 AM MYT/,
  `D1 OPEN: 8:00 AM MYT`
);
fs.writeFileSync('src/App.tsx', appData);

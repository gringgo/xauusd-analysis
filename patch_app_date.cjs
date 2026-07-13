const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[dateInput, setDateInput\] = useState<string>\(\n\s*new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\]\n\s*\);/,
  `const [dateInput, setDateInput] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getTime() + 8 * 3600 * 1000).toISOString().split('T')[0];
  });`
);

code = code.replace(
  /setTargetDate\(new Date\(e\.target\.value \+ 'T23:59:59'\)\);/,
  `setTargetDate(new Date(e.target.value + 'T23:59:59+08:00'));`
);

fs.writeFileSync('src/App.tsx', code);

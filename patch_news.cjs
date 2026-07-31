const fs = require('fs');
let code = fs.readFileSync('src/components/FrontPageNewsHistory.tsx', 'utf8');

const regex = /\/\/ Only show news for TODAY in MYT timezone[\s\S]*?return true;/;
code = code.replace(regex, "return true;");

fs.writeFileSync('src/components/FrontPageNewsHistory.tsx', code);

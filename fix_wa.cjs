const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = "if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {\n      return;\n    }";
const replacement = target + "\n    if (apiUrl.includes('github.com')) {\n      console.warn('Evolution API URL appears to be a GitHub link instead of an API endpoint. Skipping WhatsApp alert.');\n      return;\n    }";

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);

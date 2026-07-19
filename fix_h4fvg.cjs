const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

code = code.replace(/let h4Fvg = findFVG\(h4Visible\);/, "let h4Fvg = findFVG(h4Visible);\n  let h4Ob = findOrderBlock(h4Visible);");
code = code.replace(/let h1Fvg = findFVG\(h1Visible\);/, "let h1Fvg = findFVG(h1Visible);\n  let h1Ob = findOrderBlock(h1Visible);");

fs.writeFileSync('src/liveData.ts', code);

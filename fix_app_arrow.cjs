const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/\{i < 2 && <ArrowUp className="w-4 h-4 text-\[\#22c55e\]" strokeWidth=\{3\} \/>\}/g, '<ArrowUp className="w-4 h-4 text-[#22c55e]" strokeWidth={3} />');
code = code.replace(/\{i < 2 && <ArrowDown className="w-4 h-4 text-\[\#ef4444\]" strokeWidth=\{3\} \/>\}/g, '<ArrowDown className="w-4 h-4 text-[#ef4444]" strokeWidth={3} />');

fs.writeFileSync('src/App.tsx', code);

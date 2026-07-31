const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace first instance of BOS section
const regex1 = /\{\/\* BOS \*\/\}\s*<div className="border border\[#b49a45\]\/30 rounded-xl bg\[#0a0a0a\] shadow-\[0_0_15px_rgba\(0,0,0,0\.5\)\]">\s*<div className="border-b border\[#b49a45\]\/30 bg\[#111\] px-4 py-2">\s*<span className="text-\[#ffcc00\] font-bold text-xs sm:text-sm tracking-wide">BOS \(BREAK OF STRUCTURE\)<\/span>\s*<\/div>\s*<div className="p-4 text-xs sm:text-sm text-gray-200 space-y-2">\s*<p className="text-\[#ffcc00\]">\{data\.bos\.status\}<\/p>\s*<p>Structure masih:<\/p>\s*<p className="text-\[#ef4444\] font-bold text-base tracking-widest bg-red-950\/30 p-2 rounded text-center border border-red-900\/50">\s*\{data\.bos\.structure\}\s*<\/p>\s*<div className="border-t border-gray-700 pt-3 mt-3">\s*<p className="mb-2 text-gray-400">Tukar bias jika:<\/p>\s*\{data\.bos\.changeBiasConditions\.map\(\(cond, i\) => \(\s*<div key=\{i\} className=\{`flex items-center gap-2 text-gray-300 bg-\[#111\] p-1\.5 rounded \$\{i===0 \? 'mb-1' : ''\} border border-gray-800`\}>\s*<CheckCircle2 className="w-4 h-4 text-\[#22c55e\] shrink-0" \/>\s*<span>\{cond\}<\/span>\s*<\/div>\s*\)\)\}\s*<\/div>\s*<\/div>\s*<\/div>/g;

code = code.replace(regex1, "");

fs.writeFileSync('src/App.tsx', code);

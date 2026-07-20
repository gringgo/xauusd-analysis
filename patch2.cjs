const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
const target = `                <span className="ml-2 px-1.5 py-0.5 bg-[#1e3a8a] text-white text-[10px] rounded font-bold border border-[#b49a45]">
                  D1 OPEN: 6:00 AM MYT
                </span>`;
const replace = `                <span className="ml-2 px-1.5 py-0.5 bg-[#1e3a8a] text-white text-[10px] rounded font-bold border border-[#b49a45]">
                  D1 OPEN: 6:00 AM MYT
                </span>
                
                <span className={\`ml-2 px-1.5 py-0.5 text-white text-[10px] rounded font-bold border \${marketOpen ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}\`}>
                  {marketOpen ? 'PASARAN BUKA' : 'PASARAN TUTUP'}
                </span>`;
code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);

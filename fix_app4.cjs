const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newAnalytics = `
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const JournalAnalytics = ({ journal }: { journal: any[] }) => {
  const completed = journal.filter(j => j.status === 'WIN' || j.status === 'LOSS');
  const wins = journal.filter(j => j.status === 'WIN').length;
  const losses = journal.filter(j => j.status === 'LOSS').length;
  const winRate = completed.length > 0 ? ((wins / completed.length) * 100).toFixed(1) : '0.0';
  
  const equityData = [{ trade: 0, balance: 100 }];
  let currentBalance = 100;
  // Journal entries are likely in reverse chronological order (newest first)
  // So we reverse it to get chronological order for the equity curve
  [...completed].reverse().forEach((j, i) => {
    if (j.status === 'WIN') currentBalance += 2; // Assuming 1:2 RR risking 1%
    else if (j.status === 'LOSS') currentBalance -= 1;
    equityData.push({ trade: i + 1, balance: currentBalance, date: j.date });
  });

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4 flex flex-col items-center justify-center">
          <div className="text-gray-400 text-xs sm:text-sm mb-1 font-bold">Kadar Kemenangan (Win Rate)</div>
          <div className="text-2xl sm:text-3xl font-black text-white">{winRate}%</div>
          <div className="text-xs text-gray-500 mt-1">{wins} Win / {losses} Loss</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4 flex flex-col items-center justify-center">
          <div className="text-gray-400 text-xs sm:text-sm mb-1 font-bold">Nisbah R:R Purata</div>
          <div className="text-2xl sm:text-3xl font-black text-[#4da6ff]">1:2</div>
          <div className="text-xs text-gray-500 mt-1">Anggaran (Risiko 1%, Untung 2%)</div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4 flex flex-col items-center justify-center">
          <div className="text-gray-400 text-xs sm:text-sm mb-1 font-bold">Jumlah Dagangan</div>
          <div className="text-2xl sm:text-3xl font-black text-[#ffcc00]">{completed.length}</div>
          <div className="text-xs text-gray-500 mt-1">Selesai (Menang/Kalah)</div>
        </div>
      </div>
      
      {completed.length > 0 && (
        <div className="bg-[#0a0a0a] border border-[#b49a45] rounded p-4">
          <div className="text-white font-bold text-sm mb-4">Graf Pertumbuhan Akaun (Simulasi)</div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="trade" stroke="#666" tick={{fill: '#888', fontSize: 10}} tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#666" tick={{fill: '#888', fontSize: 10}} tickLine={false} axisLine={false} width={40} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#4da6ff' }}
                  formatter={(value) => [\`\${value}%\`, 'Balance']}
                  labelFormatter={(label) => \`Dagangan #\${label}\`}
                />
                <Line type="stepAfter" dataKey="balance" stroke="#4da6ff" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#ffcc00' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
};
`;

code = code.replace(/const JournalAnalytics = \(\{ journal \}: \{ journal: any\[\] \}\) => \{[\s\S]*?    <\/div>\n  \)\n\};\n/, newAnalytics + '\n');
fs.writeFileSync('src/App.tsx', code);

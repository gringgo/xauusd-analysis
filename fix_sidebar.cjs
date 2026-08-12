const fs = require('fs');
let file = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8');

file = file.replace(
  /\{\s*id:\s*'sec-liquidity-bos',\s*label:\s*'Liquidity & BOS Structure',\s*category:\s*'STRUKTUR PASARAN',\s*icon:\s*<Droplets className="w-4.5 h-4.5 text-indigo-400" \/>,\s*badge:\s*'LIQ',\s*badgeColor:\s*'bg-indigo-500\/20 text-indigo-400 border-indigo-500\/30'\s*\},/,
  `{
    id: 'sec-liquidity',
    label: 'Zon Liquidity (Perangkap)',
    category: 'STRUKTUR PASARAN',
    icon: <Droplets className="w-4.5 h-4.5 text-blue-400" />,
    badge: 'LIQ',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  {
    id: 'sec-bos',
    label: 'Break of Structure (BOS)',
    category: 'STRUKTUR PASARAN',
    icon: <Activity className="w-4.5 h-4.5 text-cyan-400" />,
    badge: 'BOS',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
  },`
);

// We need to import Activity in SidebarNav.tsx if it's not imported.
if (!file.includes('Activity')) {
  file = file.replace("import { Layers, Droplets", "import { Layers, Droplets, Activity");
}

fs.writeFileSync('src/components/SidebarNav.tsx', file);

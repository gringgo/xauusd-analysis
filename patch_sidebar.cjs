const fs = require('fs');
let code = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8');

const sbrNav = `,
  {
    id: 'sec-sbr-rbs',
    label: 'SBR / RBS & SND Rajah',
    category: 'TEKNIKAL LUKISAN',
    icon: <Ruler className="w-4.5 h-4.5 text-amber-400" />,
    badge: 'DIAGRAM',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  }`;

code = code.replace("badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'\n  }", "badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'\n  }" + sbrNav);

if (!code.includes('import { Ruler')) {
  code = code.replace("History, ", "History, Ruler, ");
}

fs.writeFileSync('src/components/SidebarNav.tsx', code);

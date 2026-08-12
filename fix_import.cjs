const fs = require('fs');
let file = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8');
if (!file.includes('Activity,')) {
  file = file.replace("LayoutDashboard,", "LayoutDashboard,\n  Activity,");
  fs.writeFileSync('src/components/SidebarNav.tsx', file);
}

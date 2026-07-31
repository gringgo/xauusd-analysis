const fs = require('fs');

// Patch App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Remove import
app = app.replace("import { LivePriceSetup } from './components/LivePriceSetup';\n", "");

// Remove the section
const sectionRegex = /\{\(viewMode === 'ALL' \|\| activeSection === 'sec-live-analysis'\) && \(\s*<div id="sec-live-analysis" className="scroll-mt-6 w-full mt-4">\s*<LivePriceSetup[\s\S]*?\/>\s*<\/div>\s*\)\}/;
app = app.replace(sectionRegex, "");
fs.writeFileSync('src/App.tsx', app);

// Patch SidebarNav.tsx
let sidebar = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8');
const sidebarRegex = /\{\s*id:\s*'sec-live-analysis'[\s\S]*?\},/;
sidebar = sidebar.replace(sidebarRegex, "");
fs.writeFileSync('src/components/SidebarNav.tsx', sidebar);


const fs = require('fs');
let sidebar = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8');

// The replacement was: 
// import React, {    id: 'sec-alpha', ... },  { useState } from 'react';
// I will just undo that and put it in the correct place.

sidebar = sidebar.replace("import React, {    id: 'sec-alpha',\n    label: 'Alpha Confluence (Sniper)',\n    category: 'HIGH PROBABILITY SETUP',\n    icon: <Target className=\"w-4.5 h-4.5 text-[#ffcc00]\" />,\n    badge: 'ALPHA',\n    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'\n  },\n  { useState }", "import React, { useState }");

const alphaSidebarItem = `{
    id: 'sec-alpha',
    label: 'Alpha Confluence (Sniper)',
    category: 'HIGH PROBABILITY SETUP',
    icon: <Target className="w-4.5 h-4.5 text-[#ffcc00]" />,
    badge: 'ALPHA',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  },
  `;

// Put it before `id: 'sec-bias-plan'`
sidebar = sidebar.replace("{    id: 'sec-bias-plan',", alphaSidebarItem + "{    id: 'sec-bias-plan',");

// Also, let's make sure if the match missed, we can handle it.
// Actually, let's just use string replace.
sidebar = sidebar.replace(/\{\s*id:\s*'sec-bias-plan'/g, alphaSidebarItem + "{    id: 'sec-bias-plan'");

fs.writeFileSync('src/components/SidebarNav.tsx', sidebar);

const fs = require('fs');
let sidebar = fs.readFileSync('src/components/SidebarNav.tsx', 'utf8');

// Replace lines 1-10 with just "import React, { useState } from 'react';"
// Let's use string split and join
let lines = sidebar.split('\\n');
// the problem was there were multiple newlines. Let's just find "import React, {" and replace until "} from 'react';"
sidebar = sidebar.replace(/import React, \{[\s\S]*?\} from 'react';/, "import React, { useState } from 'react';");

fs.writeFileSync('src/components/SidebarNav.tsx', sidebar);

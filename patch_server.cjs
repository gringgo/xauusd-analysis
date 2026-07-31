const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/"date": "29 Julai 2026 \| 08:30 PM \(MYT\)",/g, '"date": "Rabu, 29 Julai 2026 | 08:30 PM (MYT)",');
code = code.replace(/"date": "03 Jul 2026 \| 08:30 PM",/g, '"date": "Jumaat, 03 Jul 2026 | 08:30 PM",');
code = code.replace(/"date": "18 Jun 2026 \| 02:00 AM",/g, '"date": "Khamis, 18 Jun 2026 | 02:00 AM",');
code = code.replace(/"date": "15 Mei 2026 \| 08:30 PM",/g, '"date": "Rabu, 15 Mei 2026 | 08:30 PM",');

fs.writeFileSync('server.ts', code);

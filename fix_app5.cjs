const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove the inline import
code = code.replace(/import \{ LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid \} from 'recharts';\n/, '');

// Add the import to the top
code = "import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';\n" + code;

fs.writeFileSync('src/App.tsx', code);

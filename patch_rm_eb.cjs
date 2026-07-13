const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import React from 'react';\n/, '');
code = code.replace(/class ErrorBoundary[\s\S]*?function MainApp\(\) \{/m, 'export default function App() {');
code = code.replace(/export default function App\(\) \{ return <ErrorBoundary><MainApp \/><\/ErrorBoundary>; \}/, '');

fs.writeFileSync('src/App.tsx', code);

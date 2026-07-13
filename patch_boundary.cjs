const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('class ErrorBoundary')) {
  code = `import React from 'react';\n` + code;
  code = code.replace(
    /export default function App\(\) {/,
    `class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() { 
    if (this.state.hasError) return <div className="min-h-screen bg-black text-red-500 p-8 break-all font-mono text-xs">Render Error: {this.state.error?.toString()}</div>; 
    return this.props.children; 
  }
}

function MainApp() {`
  );
  
  code = code.replace(
    /export default function App\(\) \{[\s\S]*?\n\}/m,
    function(match) {
        return match + `\n\nexport default function App() { return <ErrorBoundary><MainApp /></ErrorBoundary>; }`;
    }
  );
}

fs.writeFileSync('src/App.tsx', code);

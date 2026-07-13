const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /class ErrorBoundary extends React\.Component<any, any> \{[\s\S]*?function MainApp\(\) \{/m,
  `class ErrorBoundary extends React.Component<any, { hasError: boolean, error: any }> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() { 
    if (this.state.hasError) return <div className="min-h-screen bg-black text-red-500 p-8 break-all font-mono text-xs">Render Error: {this.state.error?.toString()}</div>; 
    return this.props.children; 
  }
}

function MainApp() {`
);

fs.writeFileSync('src/App.tsx', code);

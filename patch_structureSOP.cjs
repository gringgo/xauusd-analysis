const fs = require('fs');
let code = fs.readFileSync('src/components/StructureSOPDashboard.tsx', 'utf8');

// We only process 'sbr', 'rbs' in the useEffect
code = code.replace(
  /\['sbr', 'rbs', 'dbd', 'rbr'\]\.forEach/g,
  "['sbr', 'rbs'].forEach"
);

// We only render SBR, RBS in renderDashboard
code = code.replace(
  /const renderDashboard = \(setup: any, type: 'SBR' \| 'RBS' \| 'DBD' \| 'RBR', timeframe: string\) => \{/,
  "const renderDashboard = (setup: any, type: 'SBR' | 'RBS', timeframe: string) => {"
);

// Remove checks for rbr and dbd
code = code.replace(
  /const hasH8RBR =[^;]+;/g, ""
);
code = code.replace(
  /const hasH4RBR =[^;]+;/g, ""
);
code = code.replace(
  /const hasH1RBR =[^;]+;/g, ""
);
code = code.replace(
  /const hasH8DBD =[^;]+;/g, ""
);
code = code.replace(
  /const hasH4DBD =[^;]+;/g, ""
);
code = code.replace(
  /const hasH1DBD =[^;]+;/g, ""
);

// Update conditional rendering
code = code.replace(
  /if \(!hasH8SBR && !hasH8RBS && !hasH8DBD && !hasH8RBR && !hasH4SBR && !hasH4RBS && !hasH1SBR && !hasH1RBS && !hasH4DBD && !hasH4RBR && !hasH1DBD && !hasH1RBR\) \{/,
  "if (!hasH8SBR && !hasH8RBS && !hasH4SBR && !hasH4RBS && !hasH1SBR && !hasH1RBS) {"
);

// Remove the render lines
code = code.replace(
  /\{hasH8DBD && renderDashboard\(sbrRbsData\.h8\.dbd, 'DBD', 'H8 TIMEFRAME'\)\}/g, ""
);
code = code.replace(
  /\{hasH8RBR && renderDashboard\(sbrRbsData\.h8\.rbr, 'RBR', 'H8 TIMEFRAME'\)\}/g, ""
);
code = code.replace(
  /\{hasH4DBD && renderDashboard\(sbrRbsData\.h4\.dbd, 'DBD', 'H4 TIMEFRAME'\)\}/g, ""
);
code = code.replace(
  /\{hasH4RBR && renderDashboard\(sbrRbsData\.h4\.rbr, 'RBR', 'H4 TIMEFRAME'\)\}/g, ""
);
code = code.replace(
  /\{hasH1DBD && renderDashboard\(sbrRbsData\.h1\.dbd, 'DBD', 'H1 TIMEFRAME'\)\}/g, ""
);
code = code.replace(
  /\{hasH1RBR && renderDashboard\(sbrRbsData\.h1\.rbr, 'RBR', 'H1 TIMEFRAME'\)\}/g, ""
);

// Update isSell/isBuy logic
code = code.replace(
  /const isSell = type === 'SBR' \|\| type === 'DBD'; \/\/ Sell setup/g,
  "const isSell = type === 'SBR'; // Sell setup"
);
code = code.replace(
  /const isBuy = type === 'RBS' \|\| type === 'RBR'; \/\/ Buy setup/g,
  "const isBuy = type === 'RBS'; // Buy setup"
);
code = code.replace(
  /const isSell = type === 'sbr' \|\| type === 'dbd';/g,
  "const isSell = type === 'sbr';"
);

fs.writeFileSync('src/components/StructureSOPDashboard.tsx', code);

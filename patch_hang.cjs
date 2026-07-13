const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /return \(\) => clearInterval\(interval\);\n  \}, \[\]\);/,
  `return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!data && !error) setError("App.tsx timed out after 5s - getLiveAnalysis promise hasn't resolved or rejected!");
    }, 5000);
    return () => clearTimeout(t);
  }, [data, error]);`
);

fs.writeFileSync('src/App.tsx', code);

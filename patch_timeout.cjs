const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const t = setTimeout\(\(\) => \{\n\s*if \(\!data && \!error\) setError\("Timeout fetching data for " \+ targetDate\.toDateString\(\)\);\n\s*\}, 5000\);/,
  `const t = setTimeout(() => {
      if (!data && !error) setError("Timeout fetching data for " + targetDate.toDateString());
    }, 15000);`
);

fs.writeFileSync('src/App.tsx', code);

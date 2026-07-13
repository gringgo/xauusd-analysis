const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(
  /server: \{/,
  `server: {
      proxy: {
        '/api/kucoin': {
          target: 'https://api.kucoin.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\\/api\\/kucoin/, '')
        }
      },`
);

fs.writeFileSync('vite.config.ts', code);

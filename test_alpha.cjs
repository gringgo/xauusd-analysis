const fs = require('fs');
fetch('http://127.0.0.1:3000/api/klines?symbol=XAUUSD&interval=1h&limit=50')
  .then(r => r.json())
  .then(data => console.log("H1 data length:", data.length))
  .catch(console.error);

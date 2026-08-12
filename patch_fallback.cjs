const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf8');

const additionalNews = `
  {
    "id": 991,
    "event": "Core CPI m/m",
    "category": "CPI",
    "date": "Rabu, 12 Ogo 2026 | 08:30 PM (MYT)",
    "forecast": "0.2%",
    "previous": "0.1%",
    "actual": "-",
    "prediction": "BERGANTUNG",
    "preNewsAnalysis": "",
    "analysis": "Data Core CPI m/m.",
    "impact": "HIGH",
    "status": "PENDING",
    "pipsWon": 0,
    "createdAt": new Date().toISOString()
  },
  {
    "id": 992,
    "event": "Core CPI y/y",
    "category": "CPI",
    "date": "Rabu, 12 Ogo 2026 | 08:30 PM (MYT)",
    "forecast": "3.2%",
    "previous": "3.3%",
    "actual": "-",
    "prediction": "BERGANTUNG",
    "preNewsAnalysis": "",
    "analysis": "Data Core CPI y/y.",
    "impact": "HIGH",
    "status": "PENDING",
    "pipsWon": 0,
    "createdAt": new Date().toISOString()
  },
  {
    "id": 993,
    "event": "CPI m/m",
    "category": "CPI",
    "date": "Rabu, 12 Ogo 2026 | 08:30 PM (MYT)",
    "forecast": "0.1%",
    "previous": "0.0%",
    "actual": "-",
    "prediction": "BERGANTUNG",
    "preNewsAnalysis": "",
    "analysis": "Data CPI m/m.",
    "impact": "HIGH",
    "status": "PENDING",
    "pipsWon": 0,
    "createdAt": new Date().toISOString()
  },
  {
    "id": 994,
    "event": "CPI y/y",
    "category": "CPI",
    "date": "Rabu, 12 Ogo 2026 | 08:30 PM (MYT)",
    "forecast": "3.0%",
    "previous": "3.0%",
    "actual": "-",
    "prediction": "BERGANTUNG",
    "preNewsAnalysis": "",
    "analysis": "Data CPI y/y.",
    "impact": "HIGH",
    "status": "PENDING",
    "pipsWon": 0,
    "createdAt": new Date().toISOString()
  },
`;

server = server.replace(
  'const fallbackNewsHistory: any[] = [',
  'const fallbackNewsHistory: any[] = [\n' + additionalNews
);

fs.writeFileSync('server.ts', server);

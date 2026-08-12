// Script to query db using drizzle locally
const { execSync } = require('child_process');
try {
  const result = execSync('curl -s http://127.0.0.1:3000/api/news-history');
  const items = JSON.parse(result.toString());
  const cpiItems = items.filter(i => i.event.includes('CPI'));
  console.log("CPI Items in DB:");
  console.log(JSON.stringify(cpiItems, null, 2));
} catch (e) {
  console.error(e);
}

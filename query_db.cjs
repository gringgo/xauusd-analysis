const { Database } = require('sqlite3');
const db = new Database('./sqlite.db');

db.all("SELECT id, event, date FROM high_impact_news ORDER BY id DESC LIMIT 20", [], (err, rows) => {
  if (err) throw err;
  console.log(rows);
});

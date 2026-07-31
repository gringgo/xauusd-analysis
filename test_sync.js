fetch("http://127.0.0.1:3000/api/auto-sync-news", { method: "POST" })
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);

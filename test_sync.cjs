async function testSync() {
  const calendarRes = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json"
    }
  });
  const rawNews = await calendarRes.json();
  console.log("Total raw news:", rawNews.length);
  
  let highImpactUsd = rawNews.filter(n => {
    if (n.country !== 'USD') return false;
    if (n.impact !== 'High' && n.impact !== 'Medium') return false;
    
    if (n.date) {
       const d = new Date(n.date).getTime();
       if (!isNaN(d) && d < Date.now()) return false;
    }
    return true;
  });
  
  console.log("Filtered high impact USD futures:", highImpactUsd);
}
testSync().catch(console.error);

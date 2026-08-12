const itemsToProcess = [
  {
    title: 'Core CPI m/m',
    country: 'USD',
    date: '2026-08-12T08:30:00-04:00',
    impact: 'High',
    forecast: '0.2%',
    previous: '0.0%'
  },
  {
    title: 'Core CPI y/y',
    country: 'USD',
    date: '2026-08-12T08:30:00-04:00',
    impact: 'High',
    forecast: '2.5%',
    previous: '2.6%'
  }
];

function isWeekendNews(dateStr) {
  const normalized = dateStr.toLowerCase();
  return normalized.includes("saturday") || normalized.includes("sabtu") || normalized.includes("sunday") || normalized.includes("ahad");
}

function normalizeNewsKey(event, date) {
  return `${event.toLowerCase().replace(/[^a-z0-9]/g, '')}_${date.split('|')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}`;
}

const formattedItems = itemsToProcess.map((item) => {
  let dateStr = item.date;
  if (!item.isAIGenerated && item.date) {
    try {
      const dateObj = new Date(item.date);
      if (!isNaN(dateObj.getTime())) {
        const formattedDate = dateObj.toLocaleDateString('ms-MY', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
        const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kuala_Lumpur' });
        dateStr = `${formattedDate} | ${formattedTime} (MYT)`;
      }
    } catch (e) {
      dateStr = item.date;
    }
  }
  return {
    ...item,
    dateStr
  }
});

console.log("formattedItems:", formattedItems);

for (const item of formattedItems) {
  const itemImpact = (item.impact || 'HIGH').toUpperCase();
  if (!itemImpact.includes('HIGH')) { console.log("Skipped due to impact:", item.title); continue; }
  if (isWeekendNews(item.dateStr || '')) { console.log("Skipped due to weekend:", item.title); continue; }
  
  const newKey = normalizeNewsKey(item.title || '', item.dateStr || '');
  console.log("Would insert:", item.title, item.dateStr, "key:", newKey);
}

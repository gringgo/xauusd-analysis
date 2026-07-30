const parseMalayDate = (dateStr) => {
    if (!dateStr) return 0;
    try {
      const cleaned = dateStr.replace(/\(MYT\)/g, '').trim();
      const parts = cleaned.split('|');
      if (parts.length < 2) {
        const ms = new Date(dateStr).getTime();
        return isNaN(ms) ? 0 : ms;
      }
      
      let [datePart, timePart] = parts;
      datePart = datePart.trim();
      timePart = timePart.trim();

      const months = {
        'Januari': 'Jan', 'Februari': 'Feb', 'Mac': 'Mar', 'Mei': 'May',
        'Julai': 'Jul', 'Ogos': 'Aug', 'Ogo': 'Aug', 'Oktober': 'Oct', 'Okt': 'Oct',
        'Disember': 'Dec', 'Dis': 'Dec'
      };

      let englishDatePart = datePart;
      for (const [my, en] of Object.entries(months)) {
        if (datePart.includes(my)) {
          englishDatePart = datePart.replace(my, en);
          break;
        }
      }

      const finalDateStr = `${englishDatePart} ${timePart}`;
      const ms = new Date(finalDateStr).getTime();
      return isNaN(ms) ? 0 : ms;
    } catch (e) {
      return 0;
    }
  };

console.log("30 Jul 2026 | 02:00 AM (MYT) ->", parseMalayDate("30 Jul 2026 | 02:00 AM (MYT)"));
console.log("03 Ogos 2026 | 10:00 PM (MYT) ->", parseMalayDate("03 Ogos 2026 | 10:00 PM (MYT)"));
console.log("28 Jul 2026 | 02:00 PM ->", parseMalayDate("28 Jul 2026 | 02:00 PM"));


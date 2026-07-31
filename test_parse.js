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
      // Remove any weekday prefix like "Rabu," or "Khamis, "
      datePart = datePart.replace(/^[a-zA-Z]+,\s*/, '');

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

      const finalDateStr = `${englishDatePart} ${timePart} GMT+0800`;
      const ms = new Date(finalDateStr).getTime();
      return isNaN(ms) ? 0 : ms;
    } catch (e) {
      return 0;
    }
  };

console.log(parseMalayDate("Rabu, 29 Julai 2026 | 08:30 PM (MYT)"));

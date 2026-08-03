const parseMalayDate = (dateStr) => {
    if (!dateStr) return 0;
    try {
      const cleaned = dateStr.replace(/\(MYT\)/g, '').trim();
      const parts = cleaned.split('|');
      let datePart = (parts[0] || '').trim();
      let timePart = (parts[1] || '12:00 PM').trim();

      datePart = datePart.replace(/^[a-zA-Z]+,\s*/, '');

      const months = {
        'Januari': 'Jan', 'Februari': 'Feb', 'Mac': 'Mar', 'Mei': 'May',
        'Jun': 'Jun', 'Julai': 'Jul', 'Ogos': 'Aug', 'Ogo': 'Aug', 'September': 'Sep',
        'Oktober': 'Oct', 'Okt': 'Oct', 'November': 'Nov', 'Disember': 'Dec', 'Dis': 'Dec'
      };

      let englishDatePart = datePart;
      for (const [ms, en] of Object.entries(months)) {
        if (englishDatePart.includes(ms)) {
          englishDatePart = englishDatePart.replace(ms, en);
          break;
        }
      }

      if (!/\d{4}/.test(englishDatePart)) {
        const currentYear = new Date().getFullYear();
        englishDatePart += ` ${currentYear}`;
      }

      const finalDateStr = `${englishDatePart} ${timePart} GMT+0800`;
      const ms = new Date(finalDateStr).getTime();
      return isNaN(ms) ? 0 : ms;
    } catch (e) {
      return 0;
    }
}
console.log(parseMalayDate("Isnin, 03 Ogo 2026 | 08:30 PM (MYT)"));
console.log(new Date(parseMalayDate("Isnin, 03 Ogo 2026 | 08:30 PM (MYT)")).toString());

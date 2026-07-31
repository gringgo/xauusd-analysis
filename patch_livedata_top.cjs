const fs = require('fs');
let code = fs.readFileSync('src/liveData.ts', 'utf8');

const parseMalayDateCode = `
export const parseMalayDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    try {
      const cleaned = dateStr.replace(/\\(MYT\\)/g, '').trim();
      const parts = cleaned.split('|');
      if (parts.length < 2) {
        const ms = new Date(dateStr).getTime();
        return isNaN(ms) ? 0 : ms;
      }
      
      let [datePart, timePart] = parts;
      datePart = datePart.trim();
      datePart = datePart.replace(/^[a-zA-Z]+,\\s*/, '');
      timePart = timePart.trim();

      const months: Record<string, string> = {
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

      const finalDateStr = \`\${englishDatePart} \${timePart} GMT+0800\`;
      const ms = new Date(finalDateStr).getTime();
      return isNaN(ms) ? 0 : ms;
    } catch (e) {
      return 0;
    }
};
`;

code = code.replace(/import \{.*?\} from '.*?';\n/, match => match + '\n' + parseMalayDateCode + '\n');
fs.writeFileSync('src/liveData.ts', code);

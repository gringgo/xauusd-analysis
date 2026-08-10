const fs = require('fs');
const content = fs.readFileSync('src/components/SnrBrnSetupModule.tsx', 'utf8');

const replacement = `
    if (currentPrice && currentPrice > 0) {
      const p = Number(currentPrice);
      const lowerBRN = Math.floor(p / 10) * 10;
      const upperBRN = Math.ceil(p / 10) * 10;
      
      if (upperBRN !== lowerBRN) {
        // Cek confluence: adakah BRN berdekatan (dalam 20 pips/2.0 point) dengan zon SBR/RBS?
        const upperHasConfluence = zones.some(z => !z.isBuy && Math.abs(parseFloat(z.price) - upperBRN) <= 2.0);
        const lowerHasConfluence = zones.some(z => z.isBuy && Math.abs(parseFloat(z.price) - lowerBRN) <= 2.0);
        
        // Major BRN (gandaan 50 atau 100)
        const isUpperMajor = upperBRN % 50 === 0;
        const isLowerMajor = lowerBRN % 50 === 0;

        // Hanya tambah zon BRN jika ia adalah Major BRN atau mempunyai confluence dengan zon SBR/RBS
        if (upperHasConfluence || isUpperMajor) {
          zones.push({
            id: \`brn_upper_\${upperBRN}\`,
            name: upperHasConfluence ? \`BRN + SNR CONFLUENCE\` : \`MAJOR BRN Resistance\`,
            price: upperBRN.toFixed(2),
            desc: upperHasConfluence ? \`BRN Confluence kuat dengan zon SBR - Fokus SELL\` : \`Major Big Round Number - Fokus SELL\`,
            isBuy: false
          });
        }
        
        if (lowerHasConfluence || isLowerMajor) {
          zones.push({
            id: \`brn_lower_\${lowerBRN}\`,
            name: lowerHasConfluence ? \`BRN + SNR CONFLUENCE\` : \`MAJOR BRN Support\`,
            price: lowerBRN.toFixed(2),
            desc: lowerHasConfluence ? \`BRN Confluence kuat dengan zon RBS - Fokus BUY\` : \`Major Big Round Number - Fokus BUY\`,
            isBuy: true
          });
        }
      }
    }
`;

const updated = content.replace(/if \(currentPrice && currentPrice > 0\) \{[\s\S]*?setDetectedZones\(zones\);/, replacement.trim() + '\n    setDetectedZones(zones);');
fs.writeFileSync('src/components/SnrBrnSetupModule.tsx', updated);

const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /import html2canvas from 'html2canvas';/,
  `import * as htmlToImage from 'html-to-image';`
);

const oldFunction = `  const handleDownloadImage = async () => {
    const element = document.getElementById('export-container');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#000000',
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = \`XAUUSD-Analysis-\${data.date.replace(/\\s+/g, '-')}.png\`;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('Gagal memuat turun gambar. Sila cuba lagi.');
    }
  };`;

const newFunction = `  const handleDownloadImage = async () => {
    const element = document.getElementById('export-container');
    if (!element) return;
    
    try {
      // Create a cloned element style for better quality if needed, 
      // but html-to-image works well with defaults.
      const dataUrl = await htmlToImage.toPng(element, { 
        backgroundColor: '#000000',
        pixelRatio: 2
      });
      
      const link = document.createElement('a');
      link.download = \`XAUUSD-Analysis-\${data.date.replace(/\\s+/g, '-')}.png\`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export image:', err);
      alert('Gagal memuat turun gambar. Sila cuba lagi. ' + err);
    }
  };`;

code = code.replace(oldFunction, newFunction);
fs.writeFileSync('src/App.tsx', code);

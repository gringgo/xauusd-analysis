const fs = require('fs');
const content = fs.readFileSync('src/lib/signalStore.ts', 'utf8');

const newLogic = `
      // Prevent duplicates: Only 1 signal per day untuk zone harga yang sama (supaya signal fresh)
      const duplicateTodaySignals = signals.filter(s => {
        const signalDateStr = new Date(s.timestamp || now).toLocaleDateString('en-CA', { timeZone: 'Asia/Kuala_Lumpur' });
        
        if (signalDateStr !== todayDateStr) return false;
        if (s.direction !== newSignal.direction) return false;
        
        // Sama ada range nama sama persis, atau harga entry sangat dekat (dalam 2.5 mata/pip)
        const isSameRange = s.entryRange === newSignal.entryRange;
        const isPriceClose = Math.abs((s.entryPrice || 0) - (newSignal.entryPrice || 0)) <= 2.5;
        
        return isSameRange || isPriceClose;
      });`;

const updated = content.replace(/\/\/ Prevent duplicates: Only 1 signal per day for the same zone \(regardless of status\)[\s\S]*?\}\);/, newLogic.trim());
fs.writeFileSync('src/lib/signalStore.ts', updated);

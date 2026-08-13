const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// In sendWhatsAppAlert: replace message building
const waSearch = `    const isAlpha = signal.type && signal.type.includes('ALPHA');
    const actualSl = isAlpha && signal.sl ? Number(signal.sl).toFixed(2) : slVal;
    
    let message = \`*XAUUSD SIGNAL AKTIF* 🚨\\n\\n\`;
    message += \`🔹 *Jenis Signal:* \${signal.type} \${signal.timeframe} (\${emoji} \${signal.direction})\\n\`;
    message += \`🔹 *Trigger:* \${entryPriceVal}\\n\`;
    message += \`🔹 *Entry Zone:* \${signal.entryRange}\\n\`;
    message += \`🔹 *Candle Pattern:* \${patternVal}\\n\`;
    
    if (isAlpha && signal.tp) {
      message += \`🔹 *TP (50pips):* \${Number(signal.tp).toFixed(2)}\\n\`;
    } else {
      message += \`🔹 *TP1 (40pips):* \${tp1Val}\\n\`;
      message += \`🔹 *TP2 (50pips):* \${tp2Val}\\n\`;
      message += \`🔹 *TP3 (60pips):* \${tp3Val}\\n\`;
      message += \`🔹 *TP4 (70pips):* \${tp4Val}\\n\`;
      message += \`🔹 *TP5 (80pips):* \${tp5Val}\\n\`;
      message += \`🔹 *TP6 (90pips):* \${tp6Val}\\n\`;
      message += \`🔹 *TP7 (100pips):* \${tp7Val}\\n\`;
    }
    
    message += \`🔹 *SL (50pips):* \${actualSl}\\n\`;`;

const waReplace = `    const actualSl = signal.sl ? Number(signal.sl).toFixed(2) : slVal;
    
    let message = \`*XAUUSD SIGNAL AKTIF* 🚨\\n\\n\`;
    message += \`🔹 *Jenis Signal:* \${signal.type} \${signal.timeframe} (\${emoji} \${signal.direction})\\n\`;
    message += \`🔹 *Trigger:* \${entryPriceVal}\\n\`;
    message += \`🔹 *Entry Zone:* \${signal.entryRange}\\n\`;
    message += \`🔹 *Candle Pattern:* \${patternVal}\\n\`;
    message += \`🔹 *TP1 (40pips):* \${tp1Val}\\n\`;
    message += \`🔹 *TP2 (50pips):* \${tp2Val}\\n\`;
    message += \`🔹 *TP3 (60pips):* \${tp3Val}\\n\`;
    message += \`🔹 *TP4 (70pips):* \${tp4Val}\\n\`;
    message += \`🔹 *TP5 (80pips):* \${tp5Val}\\n\`;
    message += \`🔹 *TP6 (90pips):* \${tp6Val}\\n\`;
    message += \`🔹 *TP7 (100pips):* \${tp7Val}\\n\`;
    message += \`🔹 *SL (50pips):* \${actualSl}\\n\`;`;

code = code.replace(waSearch, waReplace);

// In sendTelegramSignalAlert: replace message building
const tgSearch = `    const isAlpha = signal.type && signal.type.includes('ALPHA');
    const actualSl = isAlpha && signal.sl ? Number(signal.sl).toFixed(2) : slVal;
    
    let message = \`🚨 <b>XAUUSD SIGNAL AKTIF</b> 🚨\\n\\n\`;
    message += \`🔹 <b>Jenis Signal:</b> \${signal.type} \${signal.timeframe} (\${emoji} \${signal.direction})\\n\`;
    message += \`🔹 <b>Trigger:</b> \${entryPriceVal}\\n\`;
    message += \`🔹 <b>Entry Zone:</b> \${signal.entryRange}\\n\`;
    message += \`🔹 <b>Candle Pattern:</b> \${patternVal}\\n\`;
    
    if (isAlpha && signal.tp) {
      message += \`🔹 <b>TP (50pips):</b> \${Number(signal.tp).toFixed(2)}\\n\`;
    } else {
      message += \`🔹 <b>TP1 (40pips):</b> \${tp1Val}\\n\`;
      message += \`🔹 <b>TP2 (50pips):</b> \${tp2Val}\\n\`;
      message += \`🔹 <b>TP3 (60pips):</b> \${tp3Val}\\n\`;
      message += \`🔹 <b>TP4 (70pips):</b> \${tp4Val}\\n\`;
      message += \`🔹 <b>TP5 (80pips):</b> \${tp5Val}\\n\`;
      message += \`🔹 <b>TP6 (90pips):</b> \${tp6Val}\\n\`;
      message += \`🔹 <b>TP7 (100pips):</b> \${tp7Val}\\n\`;
    }
    
    message += \`🔹 <b>SL (50pips):</b> \${actualSl}\\n\`;`;

const tgReplace = `    const actualSl = signal.sl ? Number(signal.sl).toFixed(2) : slVal;
    
    let message = \`🚨 <b>XAUUSD SIGNAL AKTIF</b> 🚨\\n\\n\`;
    message += \`🔹 <b>Jenis Signal:</b> \${signal.type} \${signal.timeframe} (\${emoji} \${signal.direction})\\n\`;
    message += \`🔹 <b>Trigger:</b> \${entryPriceVal}\\n\`;
    message += \`🔹 <b>Entry Zone:</b> \${signal.entryRange}\\n\`;
    message += \`🔹 <b>Candle Pattern:</b> \${patternVal}\\n\`;
    message += \`🔹 <b>TP1 (40pips):</b> \${tp1Val}\\n\`;
    message += \`🔹 <b>TP2 (50pips):</b> \${tp2Val}\\n\`;
    message += \`🔹 <b>TP3 (60pips):</b> \${tp3Val}\\n\`;
    message += \`🔹 <b>TP4 (70pips):</b> \${tp4Val}\\n\`;
    message += \`🔹 <b>TP5 (80pips):</b> \${tp5Val}\\n\`;
    message += \`🔹 <b>TP6 (90pips):</b> \${tp6Val}\\n\`;
    message += \`🔹 <b>TP7 (100pips):</b> \${tp7Val}\\n\`;
    message += \`🔹 <b>SL (50pips):</b> \${actualSl}\\n\`;`;

code = code.replace(tgSearch, tgReplace);

fs.writeFileSync('server.ts', code);
console.log("Server.ts patched successfully.");

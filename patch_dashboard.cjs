const fs = require('fs');

let code = fs.readFileSync('src/components/AlphaConfluenceDashboard.tsx', 'utf8');

// Replace the dispatch logic
code = code.replace(
  /const hasBeenRetested = retestedRef\.current\.has\(sigId\);[\s\S]*?\}\);\n      \}/,
  `const hasBeenRetested = retestedRef.current.has(sigId);
      
      // Dispatch Signal if price enters zone
      if (hasRetested && !isInvalidated && !dispatchedRef.current.has(sigId)) {
        dispatchedRef.current.add(sigId);
        dispatchNewSignal({
          type: 'ALPHA ZON SNIPER',
          timeframe: 'M15/M5 (Confluence)',
          direction: isBuy ? 'BUY' : 'SELL',
          entryRange: \`\${bottomPrice.toFixed(2)} - \${topPrice.toFixed(2)}\`,
          entryPrice: optimalEntry,
          tp: isBuy ? optimalEntry + 5.0 : optimalEntry - 5.0,
          sl: isBuy ? bottomPrice - 1.5 : topPrice + 1.5,
          winRate: conf.winRate || 95,
          notes: \`Confluence Elements: \${conf.elements.join(', ')}\`
        });
      }`
);

// Replace UI to add win rate
code = code.replace(
  /<div className="flex items-center gap-2 mb-1">\s*<span className=\{\`font-black text-lg \$\{isBuy \? 'text-emerald-400' : 'text-rose-400'\}\`\}>\s*\{isBuy \? 'BUY ZONE' : 'SELL ZONE'\}\s*<\/span>\s*<span className="flex items-center gap-0\.5 text-\[\#ffcc00\] text-sm">\s*\{Array\.from\(\{length: conf\.stars\}\)\.map\(\(_, i\) => <span key=\{i\}>⭐<\/span>\)\}\s*<\/span>\s*<\/div>/,
  `<div className="flex items-center gap-2 mb-1">
                        <span className={\`font-black text-lg \${isBuy ? 'text-emerald-400' : 'text-rose-400'}\`}>
                          {isBuy ? 'BUY ZONE' : 'SELL ZONE'}
                        </span>
                        <div className="flex items-center gap-1.5 ml-2 bg-black/40 px-2 py-0.5 rounded border border-gray-700/50">
                          <span className="flex items-center gap-0.5 text-[#ffcc00] text-sm">
                            {Array.from({length: conf.stars}).map((_, i) => <span key={i}>⭐</span>)}
                          </span>
                          <span className="text-xs font-bold text-[#ffcc00] ml-1">{conf.winRate || 95}% Win</span>
                        </div>
                      </div>`
);

fs.writeFileSync('src/components/AlphaConfluenceDashboard.tsx', code);

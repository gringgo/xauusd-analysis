#!/bin/bash
sed -i 's/yLabels: \[/yLabels: \[/g' src/liveData.ts
sed -i 's/(max + pad).toFixed(2),/{ val: (max + pad).toFixed(2) },/g' src/liveData.ts
sed -i 's/(max).toFixed(2),/{ val: (max).toFixed(2), highlight: "red" },/g' src/liveData.ts
sed -i 's/((max + min)\/2).toFixed(2),/{ val: ((max + min)\/2).toFixed(2), highlight: "purple" },/g' src/liveData.ts
sed -i 's/(min).toFixed(2),/{ val: (min).toFixed(2), highlight: "green" },/g' src/liveData.ts
sed -i 's/(min - pad).toFixed(2)/{ val: (min - pad).toFixed(2) }/g' src/liveData.ts

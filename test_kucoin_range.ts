import { getLiveAnalysis } from './src/liveData';

// Polyfill fetch for relative URL
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  if (url.startsWith('/')) {
    url = 'http://localhost:3000' + url;
  }
  return originalFetch(url, options);
};

async function run() {
  const date = new Date('2024-01-01T23:59:59Z');
  const data = await getLiveAnalysis(date);
  console.log("FVG:", data.fvg);
  console.log("H4 FvgBox:", data.charts.h4.fvgBox);
  console.log("H1 FvgBox:", data.charts.h1.fvgBox);
}
run();

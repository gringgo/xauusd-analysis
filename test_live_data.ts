import { getLiveAnalysis } from './src/liveData.ts';

const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  if (typeof url === 'string' && url.startsWith('/api')) {
    url = 'http://localhost:3000' + url;
  }
  return originalFetch(url, options);
};

async function run() {
  try {
    const target = new Date('2026-07-10T23:59:59Z');
    const data = await getLiveAnalysis(target);
    console.log(data.date);
    console.log(data.charts.d1.candles.length);
  } catch (e) {
    console.error(e);
  }
}
run();

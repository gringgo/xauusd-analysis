import { getLiveAnalysis } from './src/liveData.ts';

async function main() {
  const data = await getLiveAnalysis();
  console.log("Alpha Confluence:");
  console.log(JSON.stringify(data.alphaConfluence, null, 2));
}
main();

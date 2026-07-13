async function run() {
  const endAt = Math.floor(new Date('2026-07-10T23:59:59Z').getTime() / 1000);
  const startAt = endAt - 5184000;
  
  const url = `https://api.kucoin.com/api/v1/market/candles?type=1hour&symbol=PAXG-USDT&startAt=${startAt}&endAt=${endAt}`;
  console.log(url);
  const res = await fetch(url);
  const json = await res.json();
  console.log("length:", json.data?.length);
  if (json.data && json.data.length > 0) {
    console.log("first:", new Date(parseInt(json.data[0][0]) * 1000).toISOString());
    console.log("last:", new Date(parseInt(json.data[json.data.length-1][0]) * 1000).toISOString());
  }
}
run();

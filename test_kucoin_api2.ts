async function run() {
  const endAt = Math.floor(new Date('2024-05-15T23:59:59Z').getTime() / 1000);
  const startAt = endAt - 5184000;
  
  const url = `https://api.kucoin.com/api/v1/market/candles?type=1hour&symbol=PAXG-USDT&startAt=${startAt}&endAt=${endAt}`;
  const res = await fetch(url);
  const json = await res.json();
  console.log("length:", json.data?.length);
}
run();

const endAt = Math.floor(Date.now() / 1000);
const startAt = endAt - 5184000;
const url = `https://api.kucoin.com/api/v1/market/candles?type=1hour&symbol=PAXG-USDT&startAt=${startAt}&endAt=${endAt}`;
fetch(url).then(r => r.json()).then(d => {
  console.log(d.data.length);
});

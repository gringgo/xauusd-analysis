const url = "https://api.kucoin.com/api/v1/market/candles?type=1hour&symbol=PAXG-USDT&endAt=1784122236&startAt=1778938236";
fetch(url).then(r => r.json()).then(console.log).catch(console.error);

export async function onRequest(context: any) {
  try {
    const urlObj = new URL(context.request.url);
    const interval = urlObj.searchParams.get("interval") || "1d";
    const endAt = urlObj.searchParams.get("endAt");
    const startAt = urlObj.searchParams.get("startAt");

    // Map the interval to KuCoin candle types
    let type = "1day";
    if (interval === "4h") type = "4hour";
    if (interval === "1h") type = "1hour";

    let url = `https://api.kucoin.com/api/v1/market/candles?type=${type}&symbol=PAXG-USDT`;
    if (startAt) url += `&startAt=${startAt}`;
    if (endAt) url += `&endAt=${endAt}`;

    const response = await fetch(url);
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch from KuCoin" }),
        {
          status: response.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}

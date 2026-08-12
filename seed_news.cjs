async function seed() {
  const items = [
    {
      event: "Core CPI y/y",
      category: "CPI",
      date: "Wednesday, 12 Aug 2026 | 08:30 PM (MYT)",
      forecast: "3.2%",
      previous: "3.3%",
      actual: "-",
      prediction: "BERGANTUNG",
      preNewsAnalysis: "",
      analysis: "Kadar inflasi teras tahunan dijangka kekal tinggi. Pergerakan Dolar bergantung kepada perbezaan data sebenar.",
      impact: "HIGH",
      status: "PENDING",
      pipsWon: 0
    },
    {
      event: "CPI m/m",
      category: "CPI",
      date: "Wednesday, 12 Aug 2026 | 08:30 PM (MYT)",
      forecast: "0.2%",
      previous: "-0.1%",
      actual: "-",
      prediction: "BERGANTUNG",
      preNewsAnalysis: "",
      analysis: "Data inflasi CPI bulanan akan memberi petunjuk tentang tekanan harga pengguna terkini, memberi kesan ketara kepada USD dan XAUUSD.",
      impact: "HIGH",
      status: "PENDING",
      pipsWon: 0
    },
    {
      event: "CPI y/y",
      category: "CPI",
      date: "Wednesday, 12 Aug 2026 | 08:30 PM (MYT)",
      forecast: "3.0%",
      previous: "3.0%",
      actual: "-",
      prediction: "BERGANTUNG",
      preNewsAnalysis: "",
      analysis: "Kadar inflasi tahunan keseluruhan. Bacaan yang lebih tinggi daripada jangkaan boleh mengukuhkan USD dan menekan emas ke bawah.",
      impact: "HIGH",
      status: "PENDING",
      pipsWon: 0
    }
  ];

  for (const item of items) {
    const res = await fetch("http://127.0.0.1:3000/api/news-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    console.log(await res.json());
  }
}
seed().catch(console.error);

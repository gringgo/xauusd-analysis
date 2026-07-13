const d = ["1783857600","4099.17","4097.66","4099.17","4097.26"];
console.log({
  time: parseInt(d[0]) * 1000,
  open: parseFloat(d[1]),
  close: parseFloat(d[2]),
  high: parseFloat(d[3]),
  low: parseFloat(d[4])
})

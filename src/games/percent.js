export default {
  id: "percent", label: "Procenten", icon: "%", color: "#34d399", unlockedAt: 2,
  generate(_tier, _stats) {
    const combos = [
      [10,20],[10,30],[10,50],[10,100],[10,200],
      [20,50],[20,100],[25,40],[25,80],[25,100],
      [50,20],[50,60],[50,100],[5,100],[5,200],
      [15,100],[15,200],[30,100],[40,50],[75,100],
    ];
    const [p, base] = combos[Math.floor(Math.random() * combos.length)];
    const ans = Math.round(p / 100 * base);
    return { a: p, b: base, op: "%", answer: ans, module: "percent", display: p + "% van " + base };
  },
};

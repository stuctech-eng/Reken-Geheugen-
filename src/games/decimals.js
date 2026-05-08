export default {
  id: "decimals", label: "Decimalen", icon: ",", color: "#94a3b8", unlockedAt: 3,
  generate(_tier, _stats) {
    const a = (Math.floor(Math.random() * 90) + 10) / 10;
    const b = (Math.floor(Math.random() * 90) + 10) / 10;
    const ans = Math.round((a + b) * 10) / 10;
    return { a, b, op: "+", answer: ans, module: "decimals",
      display: `${a.toFixed(1)} + ${b.toFixed(1)}`, isDecimal: true, ansFloat: ans };
  },
};

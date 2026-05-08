import { aRnd } from "./utils.js";
export default {
  id: "multiply", label: "Vermenigvuldigen", icon: "✕", color: "#f59e0b", unlockedAt: 1,
  generate(tier, stats) {
    const ma = [2, 20, 50, 100, 200][tier], mb = [2, 10, 20, 50, 100][tier];
    const a = aRnd(2, ma, stats), b = aRnd(2, mb, stats);
    return { a, b, op: "×", answer: a * b, module: "multiply" };
  },
};

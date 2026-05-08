import { aRnd } from "./utils.js";
export default {
  id: "tables", label: "Tafels", icon: "×", color: "#f97316", unlockedAt: 0,
  generate(tier, stats) {
    const m = [10, 12, 20, 50, 100][tier];
    const a = aRnd(2, m, stats), b = aRnd(2, 10, stats);
    return { a, b, op: "×", answer: a * b, module: "tables" };
  },
};

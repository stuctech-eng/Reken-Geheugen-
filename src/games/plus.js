import { aRnd } from "./utils.js";
export default {
  id: "plus", label: "Optellen", icon: "+", color: "#4ade80", unlockedAt: 0,
  generate(tier, stats) {
    const m = [10, 30, 100, 300, 1000][tier];
    const a = aRnd(1, m, stats), b = aRnd(1, m, stats);
    return { a, b, op: "+", answer: a + b, module: "plus" };
  },
};

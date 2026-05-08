import { aRnd } from "./utils.js";
export default {
  id: "minus", label: "Aftrekken", icon: "−", color: "#60a5fa", unlockedAt: 0,
  generate(tier, stats) {
    const m = [10, 30, 100, 300, 1000][tier];
    const a = aRnd(2, m, stats), b = aRnd(1, a, stats);
    return { a, b, op: "−", answer: a - b, module: "minus" };
  },
};

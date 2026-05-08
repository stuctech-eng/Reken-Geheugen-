import { aRnd } from "./utils.js";
export default {
  id: "divide", label: "Delen", icon: "÷", color: "#c084fc", unlockedAt: 2,
  generate(tier, stats) {
    const maxD = [2, 2, 12, 20, 50][tier], maxA = [2, 2, 12, 20, 50][tier];
    const b = aRnd(2, maxD, stats);
    const ans = aRnd(2, maxA, stats);
    return { a: b * ans, b, op: "÷", answer: ans, module: "divide" };
  },
};

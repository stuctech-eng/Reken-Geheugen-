import { gcd } from "./utils.js";
export default {
  id: "fractions", label: "Breuken", icon: "½", color: "#e879f9", unlockedAt: 3,
  generate(_tier, _stats) {
    const denoms = [2, 3, 4, 5, 6, 8, 10];
    const d = denoms[Math.floor(Math.random() * denoms.length)];
    const n1 = Math.floor(Math.random() * (d - 1)) + 1;
    const n2 = Math.floor(Math.random() * (d - 1)) + 1;
    const rawNum = n1 + n2;
    const g = gcd(rawNum, d);
    const ansNum = rawNum / g, ansDen = d / g;
    const ansStr = ansDen === 1 ? String(ansNum) : ansNum + "/" + ansDen;
    return { a: n1 + "/" + d, b: n2 + "/" + d, op: "+", answer: ansStr, module: "fractions",
      display: n1 + "/" + d + " + " + n2 + "/" + d, isFraction: true, rawNum, rawDen: d };
  },
};

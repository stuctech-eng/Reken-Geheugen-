import { MATH_MODULES } from "../games/index.js";
import { gcd } from "../games/utils.js";
import { recentAcc } from "../core/career.js";

export function pickModule(enabled, tierIdx, modStats, brain) {
  const avail = enabled.filter(id => MATH_MODULES[id] && MATH_MODULES[id].unlockedAt <= tierIdx);
  if (!avail.length) return "plus";
  if (brain) {
    const scored = avail.map(id => {
      const s = modStats[id] || { correct: 0, total: 0 };
      return { id, acc: s.total > 0 ? s.correct / s.total : 1 };
    });
    scored.sort((a, b) => a.acc - b.acc);
    if (Math.random() < 0.65) return scored[0].id;
  }
  return avail[Math.floor(Math.random() * avail.length)];
}

export function buildQ(modId, tierIdx, stats) {
  return (MATH_MODULES[modId] || MATH_MODULES.plus).generate(tierIdx, stats);
}

export function buildChoices(correct, tierIdx, q) {
  // FRACTIONS
  if (q && q.isFraction) {
    const d = q.rawDen, rightNum = q.rawNum;
    const candidates = new Set([correct]);
    for (const off of [-2, -1, 1, 2, 3, -3, 4, -4]) {
      if (candidates.size >= 4) break;
      const n = rightNum + off;
      if (n <= 0) continue;
      const g = gcd(n, d);
      const str = (d / g) === 1 ? String(n / g) : (n / g) + "/" + (d / g);
      if (str !== correct) candidates.add(str);
    }
    let extra = 1;
    while (candidates.size < 4) { candidates.add((rightNum + extra * 3) + "/" + d); extra++; }
    return [...candidates].sort(() => Math.random() - 0.5);
  }
  // DECIMALS
  if (q && q.isDecimal) {
    const ans = q.ansFloat;
    const candidates = new Set([ans]);
    for (const off of [0.1, 0.2, -0.1, -0.2, 0.3, -0.3, 0.5, -0.5, 1.0, -1.0]) {
      if (candidates.size >= 4) break;
      const v = Math.round((ans + off) * 10) / 10;
      if (v > 0 && v !== ans) candidates.add(v);
    }
    return [...candidates].sort(() => Math.random() - 0.5);
  }
  // DEFAULT integers
  const spread = [3, 8, 20, 50, 120][tierIdx];
  const set = new Set([correct]);
  let t = 0;
  while (set.size < 4 && t++ < 60) {
    const d = Math.floor(Math.random() * spread) + 1;
    const s = Math.random() > 0.5 ? 1 : -1;
    const v = correct + s * d;
    if (v !== correct && v >= 0) set.add(v);
  }
  return [...set].sort(() => Math.random() - 0.5);
}

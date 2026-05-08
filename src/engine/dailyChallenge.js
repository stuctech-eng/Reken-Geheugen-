import { buildQ } from "./questionEngine.js";

export function getDailyQs(tierIdx) {
  const today = new Date().toISOString().slice(0, 10);
  let seed = today.split("-").reduce((a, b) => a + parseInt(b), 0);
  const mods = ["plus", "minus", "tables"];
  const qs = [];
  for (let i = 0; i < 10; i++) {
    seed = ((seed * 1664525 + 1013904223) & 0xffffffff) >>> 0;
    const mod = mods[seed % mods.length];
    qs.push(buildQ(mod, Math.min(tierIdx, 1), {}));
  }
  return qs;
}

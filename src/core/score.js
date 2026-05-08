export function calcScore({ correct, total, avgMs, combo, tierIdx, mode }) {
  const acc = total > 0 ? correct / total : 0;
  const accScore = Math.round(acc * 100 * 10);
  const speed = Math.max(0, Math.round((4000 - avgMs) / 120));
  const diff = (tierIdx + 1) * 6;
  const modeBonus = mode === "time" ? 35 : mode === "survival" ? 55 : mode === "combo" ? 25 : 0;
  const raw = Math.round((accScore + speed + diff + modeBonus) * combo);
  return { accScore, speed, combo, diff, raw, xp: Math.round(raw / 10), coins: Math.round(correct * combo * 1.5) };
}

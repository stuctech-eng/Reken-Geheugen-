import { TIERS } from "./tiers.js";

export function getTierIdx(xp) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].xpMin) return i;
  }
  return 0;
}

export function checkPromotion(save) {
  const ti = getTierIdx(save.xp);
  const next = TIERS[ti + 1];
  if (!next) return null;
  const acc = save.totalQuestions > 0 ? (save.totalCorrect / save.totalQuestions) * 100 : 0;
  if (save.xp >= next.xpMin && acc >= next.requiredAccuracy && save.totalQuestions >= next.minQuestions) return ti + 1;
  return null;
}

export function getDecayWarning(save) {
  if (!save.lastPlayed) return false;
  return (Date.now() - save.lastPlayed) / (1000 * 60 * 60 * 24) > 3;
}

export function recentAcc(save) {
  const h = save.careerHistory.slice(-5);
  if (!h.length) return 100;
  return h.reduce((a, b) => a + b.accuracy, 0) / h.length;
}

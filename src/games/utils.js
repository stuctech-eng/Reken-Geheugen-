export function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

export function aRnd(min, max, stats) {
  if (stats && stats.recentAcc < 60 && Math.random() > 0.4)
    return Math.floor(Math.random() * Math.max(1, Math.floor((max - min) * 0.4 + 1))) + min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

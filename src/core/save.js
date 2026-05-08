export const DEFAULT_SAVE = {
  xp: 0, coins: 0, totalCorrect: 0, totalQuestions: 0,
  bestStreak: 0, currentStreak: 0, sessionsPlayed: 0,
  moduleStats: {
    plus:      { correct:0, total:0, avgTime:0, bestStreak:0 },
    minus:     { correct:0, total:0, avgTime:0, bestStreak:0 },
    tables:    { correct:0, total:0, avgTime:0, bestStreak:0 },
    multiply:  { correct:0, total:0, avgTime:0, bestStreak:0 },
    divide:    { correct:0, total:0, avgTime:0, bestStreak:0 },
    percent:   { correct:0, total:0, avgTime:0, bestStreak:0 },
    fractions: { correct:0, total:0, avgTime:0, bestStreak:0 },
    decimals:  { correct:0, total:0, avgTime:0, bestStreak:0 },
  },
  careerHistory: [],
  settings: { enabledModules: ["plus", "minus", "tables"], sound: false },
  lastPlayed: null,
  dailyDate: null,
  dailyDone: false,
};

export function dClone(o) { return JSON.parse(JSON.stringify(o)); }

export function dMerge(t, s) {
  for (const k of Object.keys(s)) {
    if (s[k] && typeof s[k] === "object" && !Array.isArray(s[k])) t[k] = dMerge(t[k] || {}, s[k]);
    else t[k] = s[k];
  }
  return t;
}

export function loadSave() {
  try {
    const r = localStorage.getItem("rg3_save");
    if (!r) return dClone(DEFAULT_SAVE);
    return dMerge(dClone(DEFAULT_SAVE), JSON.parse(r));
  } catch { return dClone(DEFAULT_SAVE); }
}

export function writeSave(d) {
  try { localStorage.setItem("rg3_save", JSON.stringify(d)); } catch {}
}

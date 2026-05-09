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
  // Module level per onderdeel (1-10), los van career tier
  moduleLevels: {
    plus:1, minus:1, tables:1, multiply:1, divide:1, percent:1, fractions:1, decimals:1,
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

// Module level logic
export function getModuleLevel(save, modId) {
  return save.moduleLevels?.[modId] || 1;
}

// After a practice session: update level based on accuracy
export function calcNewModuleLevel(currentLevel, accuracy) {
  if (accuracy >= 85 && currentLevel < 10) return currentLevel + 1;
  if (accuracy < 55 && currentLevel > 1)   return currentLevel - 1;
  return currentLevel;
}

// Difficulty range for a module at a given level (1-10)
export function getModuleDifficultyRange(modId, level) {
  const ranges = {
    plus:      [[1,5],[1,10],[1,20],[1,30],[1,50],[1,100],[1,200],[1,500],[1,750],[1,1000]],
    minus:     [[1,5],[1,10],[1,20],[1,30],[1,50],[1,100],[1,200],[1,500],[1,750],[1,1000]],
    tables:    [[1,3],[1,5],[1,6],[1,7],[1,8],[1,9],[1,10],[1,12],[1,15],[1,20]],
    multiply:  [[2,5],[2,10],[2,12],[2,15],[2,20],[3,20],[5,20],[5,25],[5,50],[10,50]],
    divide:    [[2,5],[2,8],[2,10],[2,12],[2,15],[3,15],[3,20],[4,20],[5,20],[5,25]],
    percent:   [[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]], // handled separately
    fractions: [[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]], // handled separately
    decimals:  [[0],[0],[0],[0],[0],[0],[0],[0],[0],[0]], // handled separately
  };
  const r = (ranges[modId] || ranges.plus)[Math.min(level - 1, 9)];
  return { min: r[0], max: r[1] };
}

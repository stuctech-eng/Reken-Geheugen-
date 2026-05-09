import { useState, useEffect } from "react";
import { TIERS } from "./core/tiers.js";
import { getTierIdx, checkPromotion, getDecayWarning, recentAcc } from "./core/career.js";
import { DEFAULT_SAVE, dClone, dMerge, calcNewModuleLevel } from "./core/save.js";
import { initAuth } from "./services/firebase.js";
import { loadFromFirestore, saveToFirestore } from "./services/sync.js";
import HomeScreen     from "./screens/HomeScreen.jsx";
import ModeScreen     from "./screens/ModeScreen.jsx";
import GameScreen     from "./screens/GameScreen.jsx";
import ResultScreen   from "./screens/ResultScreen.jsx";
import CareerScreen   from "./screens/CareerScreen.jsx";
import SettingsScreen from "./screens/SettingsScreen.jsx";

export default function App() {
  const [uid, setUid]         = useState(null);
  const [save, setSave]       = useState(dClone(DEFAULT_SAVE));
  const [loading, setLoading] = useState(true);
  const [screen, setScreen]   = useState("home");
  const [selMode, setSelMode] = useState("classic");
  const [lastResult, setLastResult] = useState(null);
  const [promoAlert, setPromoAlert] = useState(null);

  // ── Init: auth + load data ──────────────────────────────────
  useEffect(() => {
    initAuth()
      .then(async (userId) => {
        setUid(userId);
        const data = await loadFromFirestore(userId);
        setSave(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Auth failed:", err);
        // Still load from localStorage if auth fails
        try {
          const local = localStorage.getItem("rg3_save");
          if (local) setSave(dMerge(dClone(DEFAULT_SAVE), JSON.parse(local)));
        } catch {}
        setLoading(false);
      });
  }, []);

  const tierIdx   = getTierIdx(save.xp);
  const tier      = TIERS[tierIdx];
  const nextTier  = TIERS[tierIdx + 1];
  const tierProg  = nextTier ? Math.min((save.xp - tier.xpMin) / (nextTier.xpMin - tier.xpMin), 1) : 1;
  const decay     = getDecayWarning(save);
  const recAccVal = recentAcc(save);

  // ── Save helper ─────────────────────────────────────────────
  function upSave(patch) {
    setSave(prev => {
      const next = dMerge(dClone(prev), patch);
      if (uid) saveToFirestore(uid, next);
      else localStorage.setItem("rg3_save", JSON.stringify(next));
      return next;
    });
  }

  // ── Game finish ─────────────────────────────────────────────
  function handleFinish(result) {
    const modPatch = {};
    for (const [mod, data] of Object.entries(result.moduleBreakdown)) {
      const prev = save.moduleStats[mod] || { correct:0, total:0, avgTime:0, bestStreak:0 };
      const nt = prev.total + data.total, nc = prev.correct + data.correct;
      modPatch[mod] = {
        correct: nc, total: nt,
        avgTime: nt > 0 ? Math.round((prev.avgTime * prev.total + data.totalMs) / nt) : 0,
        bestStreak: Math.max(prev.bestStreak || 0, data.streak || 0),
      };
    }

    // Update module level for practice sessions
    const mlPatch = {};
    if (result.isPractice && result.practiceModId) {
      mlPatch[result.practiceModId] = result.finalLevel
        || calcNewModuleLevel(save.moduleLevels?.[result.practiceModId] || 1, result.accuracy);
    }

    const today = new Date().toISOString().slice(0, 10);
    const hist = [...save.careerHistory, {
      date: Date.now(), accuracy: result.accuracy, xpGained: result.score.xp
    }].slice(-20);

    const patch = {
      xp: save.xp + result.score.xp,
      coins: save.coins + result.score.coins,
      totalCorrect: save.totalCorrect + result.correct,
      totalQuestions: save.totalQuestions + result.total,
      bestStreak: Math.max(save.bestStreak, result.bestStreak),
      currentStreak: result.endStreak,
      sessionsPlayed: save.sessionsPlayed + 1,
      moduleStats: modPatch,
      moduleLevels: { ...(save.moduleLevels || {}), ...mlPatch },
      careerHistory: hist,
      lastPlayed: Date.now(),
      dailyDate: result.isDaily ? today : save.dailyDate,
      dailyDone: result.isDaily ? true : save.dailyDone,
    };

    setSave(prev => {
      const next = dMerge(dClone(prev), patch);
      // Save to Firestore + localStorage
      if (uid) saveToFirestore(uid, next);
      else localStorage.setItem("rg3_save", JSON.stringify(next));
      // Check promotion
      const promo = checkPromotion(next);
      if (promo !== null && promo > getTierIdx(prev.xp)) setPromoAlert(TIERS[promo]);
      return next;
    });

    setLastResult(result);
    setScreen("result");
  }

  // ── Loading screen ──────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight:"100dvh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:36 }}>🧮</div>
        <div style={{ color:"#4ade80", fontSize:14, fontFamily:"monospace", letterSpacing:2 }}>LADEN...</div>
      </div>
    );
  }

  // ── Screen router ────────────────────────────────────────────
  if (screen === "game")     return <GameScreen tierIdx={tierIdx} tier={tier} mode={selMode} save={save} onFinish={handleFinish} onBack={() => setScreen("mode")} />;
  if (screen === "result")   return <ResultScreen result={lastResult} tier={tier} save={save} promoAlert={promoAlert} onDismiss={() => setPromoAlert(null)} onHome={() => setScreen("home")} onReplay={() => setScreen("game")} />;
  if (screen === "mode")     return <ModeScreen tier={tier} tierIdx={tierIdx} save={save} onSelect={m => { setSelMode(m); setScreen("game"); }} onBack={() => setScreen("home")} />;
  if (screen === "settings") return <SettingsScreen tier={tier} tierIdx={tierIdx} save={save} onUpdate={upSave} onBack={() => setScreen("home")} />;
  if (screen === "career")   return <CareerScreen save={save} tier={tier} tierIdx={tierIdx} tierProg={tierProg} nextTier={nextTier} recAccVal={recAccVal} onBack={() => setScreen("home")} />;

  return <HomeScreen save={save} tier={tier} tierIdx={tierIdx} tierProg={tierProg} nextTier={nextTier} decay={decay} onPlay={() => setScreen("mode")} onSettings={() => setScreen("settings")} onCareer={() => setScreen("career")} />;
}

import { useState, useEffect } from "react";
import { TIERS } from "./core/tiers.js";
import { getTierIdx, checkPromotion, getDecayWarning, recentAcc } from "./core/career.js";
import { DEFAULT_SAVE, dClone, dMerge, calcNewModuleLevel } from "./core/save.js";
import { initAuth } from "./services/firebase.js";
import { loadFromFirestore, saveToFirestore } from "./services/sync.js";
import {
  updateGlobalLeaderboard, updateModuleLeaderboard, updateDailyLeaderboard
} from "./services/leaderboard.js";
import HomeScreen        from "./screens/HomeScreen.jsx";
import ModeScreen        from "./screens/ModeScreen.jsx";
import GameScreen        from "./screens/GameScreen.jsx";
import ResultScreen      from "./screens/ResultScreen.jsx";
import CareerScreen      from "./screens/CareerScreen.jsx";
import SettingsScreen    from "./screens/SettingsScreen.jsx";
import LeaderboardScreen from "./screens/LeaderboardScreen.jsx";
import UsernameScreen    from "./screens/UsernameScreen.jsx";

export default function App() {
  const [uid, setUid]           = useState(null);
  const [save, setSave]         = useState(dClone(DEFAULT_SAVE));
  const [loading, setLoading]   = useState(true);
  const [needsName, setNeedsName] = useState(false);
  const [screen, setScreen]     = useState("home");
  const [selMode, setSelMode]   = useState("classic");
  const [lastResult, setLastResult] = useState(null);
  const [promoAlert, setPromoAlert] = useState(null);

  // ── Init ─────────────────────────────────────────────────────
  useEffect(() => {
    initAuth()
      .then(async (userId) => {
        setUid(userId);
        const data = await loadFromFirestore(userId);
        setSave(data);
        // First time: no username yet
        if (!data.username) setNeedsName(true);
        setLoading(false);
      })
      .catch(() => {
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

  // ── Save helper ───────────────────────────────────────────────
  function upSave(patch) {
    setSave(prev => {
      const next = dMerge(dClone(prev), patch);
      if (uid) saveToFirestore(uid, next);
      else localStorage.setItem("rg3_save", JSON.stringify(next));
      return next;
    });
  }

  // ── Username done ─────────────────────────────────────────────
  function handleUsernameDone(displayName) {
    const patch = { username: displayName.toLowerCase().replace(/\s+/g,"_"), displayName };
    upSave(patch);
    setNeedsName(false);
    // Push to global leaderboard immediately
    if (uid) updateGlobalLeaderboard(uid, displayName, save.xp, tier.label);
  }

  // ── Game finish ───────────────────────────────────────────────
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
      if (uid) saveToFirestore(uid, next);
      else localStorage.setItem("rg3_save", JSON.stringify(next));

      // ── Leaderboard updates ──────────────────────────────────
      const name = next.displayName || next.username || "Anoniem";
      if (uid && name !== "Anoniem") {
        // Global — always update
        updateGlobalLeaderboard(uid, name, next.xp, TIERS[getTierIdx(next.xp)].label);
        // Daily — only if daily challenge
        if (result.isDaily) {
          updateDailyLeaderboard(uid, name, result.score.raw);
        }
        // Modules — update for each played module
        for (const modId of Object.keys(result.moduleBreakdown)) {
          const ms = next.moduleStats[modId];
          if (ms?.total > 0) {
            const acc = Math.round(ms.correct / ms.total * 100);
            const lvl = next.moduleLevels?.[modId] || 1;
            updateModuleLeaderboard(uid, name, modId, lvl, acc);
          }
        }
      }

      const promo = checkPromotion(next);
      if (promo !== null && promo > getTierIdx(prev.xp)) setPromoAlert(TIERS[promo]);
      return next;
    });

    setLastResult(result);
    setScreen("result");
  }

  // ── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight:"100dvh", background:"#080808", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
        <div style={{ fontSize:36 }}>🧮</div>
        <div style={{ color:"#4ade80", fontSize:14, fontFamily:"monospace", letterSpacing:2 }}>LADEN...</div>
      </div>
    );
  }

  // ── Username flow ─────────────────────────────────────────────
  if (needsName) {
    return <UsernameScreen uid={uid} tier={tier} onDone={handleUsernameDone} />;
  }

  // ── Router ────────────────────────────────────────────────────
  if (screen === "game")        return <GameScreen tierIdx={tierIdx} tier={tier} mode={selMode} save={save} onFinish={handleFinish} onBack={() => setScreen("mode")} />;
  if (screen === "result")      return <ResultScreen result={lastResult} tier={tier} save={save} promoAlert={promoAlert} onDismiss={() => setPromoAlert(null)} onHome={() => setScreen("home")} onReplay={() => setScreen("game")} />;
  if (screen === "mode")        return <ModeScreen tier={tier} tierIdx={tierIdx} save={save} onSelect={m => { setSelMode(m); setScreen("game"); }} onBack={() => setScreen("home")} />;
  if (screen === "settings")    return <SettingsScreen tier={tier} tierIdx={tierIdx} save={save} onUpdate={upSave} onBack={() => setScreen("home")} />;
  if (screen === "career")      return <CareerScreen save={save} tier={tier} tierIdx={tierIdx} tierProg={tierProg} nextTier={nextTier} recAccVal={recAccVal} onBack={() => setScreen("home")} />;
  if (screen === "leaderboard") return <LeaderboardScreen uid={uid} tier={tier} save={save} onBack={() => setScreen("home")} />;

  return (
    <HomeScreen
      save={save} tier={tier} tierIdx={tierIdx}
      tierProg={tierProg} nextTier={nextTier} decay={decay}
      onPlay={() => setScreen("mode")}
      onSettings={() => setScreen("settings")}
      onCareer={() => setScreen("career")}
      onLeaderboard={() => setScreen("leaderboard")}
    />
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { MATH_MODULES, PRACTICE_MODULES } from "../games/index.js";
import { pickModule, buildQ, buildChoices } from "../engine/questionEngine.js";
import { getDailyQs } from "../engine/dailyChallenge.js";
import { recentAcc } from "../core/career.js";
import { calcScore } from "../core/score.js";
import { getModuleLevel, calcNewModuleLevel, getModuleDifficultyRange } from "../core/save.js";
import { Bar } from "../components/Shared.jsx";
import { S } from "../styles/index.js";

// Build a practice question with level-based difficulty
function buildPracticeQ(modId, level) {
  const { min, max } = getModuleDifficultyRange(modId, level);
  const mod = MATH_MODULES[modId];
  if (!mod) return buildQ("plus", 0, {});
  // Use stats with custom range by overriding aRnd behavior via a high recentAcc
  return mod.generate(
    // Map level to tier-like index for range (clamp 0-4)
    Math.min(Math.floor((level - 1) / 2), 4),
    { recentAcc: 100 } // no adaptive reduction in practice
  );
}

export default function GameScreen({ tierIdx, tier, mode, save, onFinish, onBack }) {
  // Detect practice mode
  const practiceEntry = PRACTICE_MODULES.find(p => p.id === mode);
  const isPractice = !!practiceEntry;
  const practiceModId = practiceEntry?.modId; // null = "Alles"

  const enabledMods = save.settings?.enabledModules || ["plus","minus","tables"];
  const isBrain = mode === "brain";
  const isDaily = mode === "daily";

  // For practice: determine which modules to use
  const practicePool = isPractice
    ? (practiceModId ? [practiceModId] : enabledMods.filter(id => MATH_MODULES[id]?.unlockedAt <= tierIdx))
    : null;

  // Current module level for practice
  const [currentLevel, setCurrentLevel] = useState(() => {
    if (!isPractice || !practiceModId) return 1;
    return getModuleLevel(save, practiceModId);
  });

  const [sess, setSess] = useState({
    correct:0, total:0, streak:0, bestStreak:0,
    combo:1, maxCombo:1, moduleBreakdown:{}, times:[],
  });
  const [q, setQ] = useState(null);
  const [choices, setChoices] = useState([]);
  const [fb, setFb] = useState(null);
  const [timeLeft, setTimeLeft] = useState(mode === "time" ? 60 : null);
  const [perQ, setPerQ] = useState(tier.timeLimit);
  const [lives, setLives] = useState(3);
  const [done, setDone] = useState(false);
  const [dailyQs] = useState(() => isDaily ? getDailyQs(tierIdx) : null);
  const [dIdx, setDIdx] = useState(0);
  const [levelUpMsg, setLevelUpMsg] = useState(null);

  const doneRef = useRef(false);
  const sessRef = useRef(sess); sessRef.current = sess;
  const levelRef = useRef(currentLevel);
  const qStart = useRef(Date.now());
  const perQRef = useRef(perQ);
  const perQTimer = useRef(null);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
  }, []);

  // Pick next practice module (round-robin or single)
  const pickPracticePool = useCallback((pool) => {
    return pool[Math.floor(Math.random() * pool.length)];
  }, []);

  const loadQ = useCallback(() => {
    let newQ;
    if (isDaily && dailyQs) {
      if (dIdx >= dailyQs.length) { finish(); return; }
      newQ = dailyQs[dIdx]; setDIdx(i => i + 1);
    } else if (isPractice && practicePool) {
      const modId = pickPracticePool(practicePool);
      const lvl = practiceModId ? levelRef.current : (getModuleLevel(save, modId) || 1);
      newQ = buildPracticeQ(modId, lvl);
    } else {
      const mod = pickModule(enabledMods, tierIdx, save.moduleStats, isBrain);
      newQ = buildQ(mod, tierIdx, { recentAcc: recentAcc(save) });
    }
    setQ(newQ);
    setChoices(buildChoices(newQ.answer, tierIdx, newQ));
    setFb(null);
    setPerQ(tier.timeLimit);
    perQRef.current = tier.timeLimit;
    qStart.current = Date.now();
  }, [tierIdx, enabledMods, isBrain, isDaily, dailyQs, dIdx, finish, isPractice, practicePool, practiceModId]);

  useEffect(() => { loadQ(); }, []);

  // Time Attack timer
  useEffect(() => {
    if (mode !== "time" || doneRef.current) return;
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); finish(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [mode, finish]);

  // Per-question timer (not for practice/classic/brain)
  useEffect(() => {
    if (!tier.timeLimit || isPractice || mode === "classic" || mode === "brain" || mode === "time" || !q || fb) return;
    clearInterval(perQTimer.current);
    perQTimer.current = setInterval(() => {
      perQRef.current = (perQRef.current || 0) - 1;
      setPerQ(perQRef.current);
      if (perQRef.current <= 0) { clearInterval(perQTimer.current); handleAnswer(null, true); }
    }, 1000);
    return () => clearInterval(perQTimer.current);
  }, [q, fb]);

  // Check level-up every 10 practice questions
  useEffect(() => {
    if (!isPractice || !practiceModId) return;
    const s = sessRef.current;
    if (s.total > 0 && s.total % 10 === 0) {
      const acc = Math.round(s.correct / s.total * 100);
      const newLvl = calcNewModuleLevel(levelRef.current, acc);
      if (newLvl !== levelRef.current) {
        levelRef.current = newLvl;
        setCurrentLevel(newLvl);
        setLevelUpMsg(newLvl > levelRef.current - 1
          : "Level omhoog! Lvl " + newLvl
          : "Level omlaag: Lvl " + newLvl
        );
        setTimeout(() => setLevelUpMsg(null), 2500);
      }
    }
  }, [sess.total]);

  // Finish effect
  useEffect(() => {
    if (!done) return;
    const s = sessRef.current;
    const accuracy = s.total > 0 ? Math.round(s.correct / s.total * 100) : 0;
    const avgMs = s.times.length > 0 ? Math.round(s.times.reduce((a, b) => a + b, 0) / s.times.length) : 1500;

    let score;
    if (isPractice) {
      // Practice score: accuracy x streak x level (no time pressure)
      const lvl = practiceModId ? levelRef.current : 1;
      const accScore = Math.round((accuracy / 100) * 100 * 8);
      const combo = s.maxCombo;
      const lvlBonus = lvl * 5;
      const raw = Math.round((accScore + lvlBonus) * combo);
      score = { accScore, speed:0, combo, diff:lvlBonus, raw, xp:Math.round(raw/12), coins:Math.round(s.correct * combo) };
    } else {
      score = calcScore({ correct:s.correct, total:s.total, avgMs, combo:s.maxCombo, tierIdx, mode });
    }

    onFinish({
      correct:s.correct, total:s.total, accuracy,
      bestStreak:s.bestStreak, endStreak:s.streak,
      avgMs, score, moduleBreakdown:s.moduleBreakdown,
      isDaily, mode, isPractice,
      practiceModId,
      finalLevel: practiceModId ? levelRef.current : null,
    });
  }, [done]);

  function handleAnswer(choice, timeout = false) {
    if (fb || doneRef.current || !q) return;
    clearInterval(perQTimer.current);
    const elapsed = Date.now() - qStart.current;
    const ok = !timeout && choice === q.answer;
    const modId = q.module || "plus";
    setSess(prev => {
      const str = ok ? prev.streak + 1 : 0;
      const combo = ok ? Math.min(Math.floor(str / 3) + 1, 5) : Math.max(1, prev.combo - 1);
      const pm = prev.moduleBreakdown[modId] || { correct:0, total:0, totalMs:0, streak:0 };
      return {
        ...prev,
        correct: prev.correct + (ok ? 1 : 0),
        total: prev.total + 1,
        streak: str,
        bestStreak: Math.max(prev.bestStreak, str),
        combo, maxCombo: Math.max(prev.maxCombo, combo),
        moduleBreakdown: { ...prev.moduleBreakdown, [modId]: { correct:pm.correct+(ok?1:0), total:pm.total+1, totalMs:pm.totalMs+elapsed, streak:ok?(pm.streak||0)+1:0 }},
        times: [...prev.times, elapsed],
      };
    });
    setFb(ok ? "correct" : "wrong");
    if (!ok && mode === "survival") { const nl = lives - 1; setLives(nl); if (nl <= 0) { setTimeout(finish, 700); return; } }
    if (isDaily && dIdx >= (dailyQs?.length || 10) - 1) { setTimeout(finish, 600); return; }
    setTimeout(() => { if (!doneRef.current) loadQ(); }, ok ? 350 : 700);
  }

  if (!q) return <div style={S.root(tier.bg)} />;
  const acc = sess.total > 0 ? Math.round(sess.correct / sess.total * 100) : 100;
  const tColor = perQ !== null && perQ <= 2 ? "#f87171" : tier.color;
  const modColor = q.module ? (MATH_MODULES[q.module]?.color || tier.color) : tier.color;

  return (
    <div style={S.root(tier.bg)}>
      <div style={{ ...S.page, gap:12 }}>

        {/* Top bar */}
        <div style={S.row}>
          <button style={S.backBtn} onClick={onBack}>✕</button>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {mode === "survival" && [...Array(3)].map((_, i) => <span key={i} style={{ fontSize:18, opacity:i<lives?1:0.15 }}>❤️</span>)}
            {mode === "time" && <span style={{ color:timeLeft<10?"#f87171":tier.color, fontWeight:900, fontFamily:"monospace", fontSize:20 }}>{timeLeft}s</span>}
            {tier.timeLimit && !isPractice && mode !== "time" && mode !== "classic" && mode !== "brain" && perQ !== null &&
              <span style={{ color:tColor, fontWeight:900, fontFamily:"monospace", fontSize:18 }}>{perQ}s</span>}
            {/* Practice level indicator */}
            {isPractice && practiceModId && (
              <span style={{ color:modColor, fontWeight:900, fontSize:13 }}>Lvl {currentLevel}</span>
            )}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {sess.combo > 1 && <span style={{ color:"#fbbf24", fontWeight:900, fontSize:13 }}>×{sess.combo}</span>}
            <span style={{ color:"#555", fontSize:12 }}>{sess.correct}/{sess.total}</span>
          </div>
        </div>

        {/* Level up message */}
        {levelUpMsg && (
          <div style={{ textAlign:"center", background:modColor+"22", border:"1px solid "+modColor+"44", borderRadius:12, padding:"8px", color:modColor, fontWeight:800, fontSize:14 }}>
            {levelUpMsg}
          </div>
        )}

        {sess.streak >= 3 && !levelUpMsg && (
          <div style={{ textAlign:"center", color:"#fbbf24", fontWeight:800, fontSize:13 }}>
            🔥 {sess.streak} streak
          </div>
        )}

        {/* Module badge */}
        {q.module && (
          <div style={{ textAlign:"center" }}>
            <span style={{ ...S.badge, background:modColor+"22", color:modColor, borderColor:modColor+"44" }}>
              {MATH_MODULES[q.module]?.icon} {MATH_MODULES[q.module]?.label}
              {isPractice && practiceModId && " · Lvl " + currentLevel}
            </span>
          </div>
        )}

        {/* Practice mode level progress bar */}
        {isPractice && practiceModId && (
          <div>
            <Bar pct={(sess.total % 10) / 10} color={modColor} />
            <div style={{ fontSize:11, color:"#555", textAlign:"center", marginTop:3 }}>
              {10 - (sess.total % 10)} vragen tot level check
            </div>
          </div>
        )}

        {/* Question */}
        <div style={S.qCard(fb, tier.color)}>
          <div style={S.qMain}>{q.display || (q.a + " " + q.op + " " + q.b)}</div>
          <div style={{ color:"#444", fontSize:24, marginTop:4 }}>= ?</div>
        </div>

        {tier.hints && <div style={{ textAlign:"center", color:"#333", fontSize:12 }}>💡 Tip: denk stap voor stap</div>}

        {/* Choices */}
        <div style={S.grid2}>
          {choices.map((c, i) => {
            const state = fb==="correct"&&c===q.answer?"correct":fb==="wrong"&&c===q.answer?"hint":fb&&c!==q.answer?"dim":"idle";
            const display = q.isDecimal && typeof c === "number" ? c.toFixed(1) : c;
            return <button key={i} style={S.choice(state, tier.color)} onClick={() => handleAnswer(c)}>{display}</button>;
          })}
        </div>

        {isDaily && <Bar pct={dIdx / (dailyQs?.length || 10)} color={tier.color} />}

        <div style={{ textAlign:"center", color:"#444", fontSize:12 }}>
          Nauwkeurigheid: <span style={{ color:tier.color, fontWeight:700 }}>{acc}%</span>
          {isBrain && q.module && <span style={{ color:"#555" }}> · Focus: {MATH_MODULES[q.module]?.label}</span>}
        </div>

        {/* Stop button — practice always, others after 5 questions */}
        {(isPractice || mode === "classic" || mode === "combo" || mode === "brain") && sess.total >= 5 &&
          <button style={S.stopBtn} onClick={finish}>Sessie afsluiten ({sess.total} vragen)</button>}
      </div>
    </div>
  );
}

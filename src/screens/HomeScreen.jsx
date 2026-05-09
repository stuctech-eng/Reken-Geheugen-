import { Bar, Btn, Stat } from "../components/Shared.jsx";
import { S } from "../styles/index.js";

export default function HomeScreen({ save, tier, tierIdx, tierProg, nextTier, decay, onPlay, onSettings, onCareer, onLeaderboard }) {
  const today = new Date().toISOString().slice(0, 10);
  const dailyDone = save.dailyDate === today && save.dailyDone;
  const acc = save.totalQuestions > 0 ? Math.round(save.totalCorrect / save.totalQuestions * 100) : 0;

  return (
    <div style={S.root(tier.bg)}>
      <div style={S.page}>
        <div style={S.topNav}>
          <Btn icon="▲" color={tier.color} onClick={onCareer} label="Career" />
          <div style={S.rankPill(tier.color)}>
            <span>{tier.emoji}</span>
            <span style={{ fontWeight:800, letterSpacing:1 }}>{tier.label.toUpperCase()}</span>
          </div>
          <Btn icon="=" color={tier.color} onClick={onSettings} label="Instellingen" />
        </div>

        <div style={{ textAlign:"center", padding:"8px 0" }}>
          <h1 style={S.heroTitle}>Reken<br/>Geheugen</h1>
          <p style={{ color:"#444", fontSize:13, margin:"4px 0 0" }}>{tier.desc}</p>
        </div>

        <div style={S.card(tier.color)}>
          <div style={{ ...S.row, marginBottom:8 }}>
            <span style={{ color:tier.color, fontWeight:900 }}>{save.xp} XP</span>
            {nextTier
              ? <span style={{ color:"#555", fontSize:12 }}>→ {nextTier.label} @ {nextTier.xpMin} XP</span>
              : <span style={{ color:tier.color, fontSize:12 }}>MAX LEVEL ★</span>}
          </div>
          <Bar pct={tierProg} color={tier.color} />
          {nextTier && <div style={{ fontSize:11, color:"#444", marginTop:5 }}>Vereist: ≥{nextTier.requiredAccuracy}% acc · {nextTier.minQuestions} vragen</div>}
        </div>

        {decay && <div style={S.warn}>⚠️ Skill Decay Warning — 3+ dagen niet geoefend!</div>}

        <div style={S.grid4}>
          <Stat label="Nauwkeurig" value={acc + "%"} color={tier.color} />
          <Stat label="Best Streak" value={save.bestStreak + "🔥"} color={tier.color} />
          <Stat label="Sessies" value={save.sessionsPlayed} color={tier.color} />
          <Stat label="Coins" value={save.coins + "🪙"} color={tier.color} />
        </div>

        <button style={S.playBtn(tier.color)} onClick={onPlay}>SPELEN</button>

        <div style={S.dailyRow(dailyDone)}>
          <span>🎯 Daily Challenge</span>
          <span style={{ color:dailyDone?"#4ade80":"#555", fontSize:13 }}>{dailyDone?"✓ Voltooid":"Nog te doen"}</span>
        </div>
      </div>
    </div>
  );
}

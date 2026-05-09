import { Bar, BackBtn, KPI } from "../components/Shared.jsx";
import { TIERS } from "../core/tiers.js";
import { S } from "../styles/index.js";

export default function CareerScreen({ save, tier, tierIdx, tierProg, nextTier, recAccVal, onBack }) {
  const acc = save.totalQuestions > 0 ? Math.round(save.totalCorrect / save.totalQuestions * 100) : 0;

  return (
    <div style={S.root(tier.bg)}>
      <div style={S.page}>
        <BackBtn onClick={onBack} />
        <h2 style={S.title(tier.color)}>Career</h2>

        <div style={S.card(tier.color)}>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:28 }}>{tier.emoji}</span>
            <div>
              <div style={{ fontWeight:900, color:tier.color, fontSize:18 }}>{tier.label}</div>
              <div style={{ color:"#555", fontSize:12 }}>{tier.desc}</div>
            </div>
          </div>
          <Bar pct={tierProg} color={tier.color} />
          <div style={{ ...S.row, marginTop:8 }}>
            <span style={{ color:tier.color, fontSize:13 }}>{save.xp} XP</span>
            {nextTier && <span style={{ color:"#444", fontSize:12 }}>{nextTier.xpMin} XP nodig</span>}
          </div>
        </div>

        <div style={S.grid2}>
          <KPI label="Nauwkeurigheid" value={acc + "%"} target={nextTier ? "≥" + nextTier.requiredAccuracy + "%" : "MAX"} ok={!nextTier||acc>=(nextTier?.requiredAccuracy||0)} color={tier.color} />
          <KPI label="Vragen gespeeld" value={save.totalQuestions} target={nextTier ? "≥" + nextTier.minQuestions : "MAX"} ok={!nextTier||save.totalQuestions>=(nextTier?.minQuestions||0)} color={tier.color} />
          <KPI label="Recente acc." value={Math.round(recAccVal) + "%"} target="Laatste 5 sessies" ok={recAccVal>=70} color={tier.color} />
          <KPI label="Beste Streak" value={save.bestStreak + "🔥"} target="" ok={true} color={tier.color} />
        </div>

        <div style={{ width:"100%" }}>
          <div style={{ fontSize:11, color:"#444", marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>Career Ladder</div>
          {TIERS.map((t, i) => (
            <div key={t.id} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 12px", borderRadius:12, marginBottom:6, background:i===tierIdx?t.color+"15":"#ffffff06", border:"1px solid "+(i===tierIdx?t.color+"44":i<tierIdx?t.color+"22":"#1a1a1a") }}>
              <span style={{ fontSize:16 }}>{t.emoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:i<=tierIdx?t.color:"#444" }}>{t.label}</div>
                <div style={{ fontSize:11, color:"#555" }}>{t.xpMin} XP · ≥{t.requiredAccuracy}% · {t.minQuestions} vragen</div>
              </div>
              {i < tierIdx && <span style={{ color:"#4ade80", fontSize:12 }}>✓</span>}
              {i === tierIdx && <span style={{ color:t.color, fontSize:11, fontWeight:700 }}>HUIDIG</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

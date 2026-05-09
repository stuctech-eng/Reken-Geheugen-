import { BackBtn } from "../components/Shared.jsx";
import { GAME_MODES, MATH_MODULES, PRACTICE_MODULES } from "../games/index.js";
import { S } from "../styles/index.js";

export default function ModeScreen({ tier, tierIdx, save, onSelect, onBack }) {
  const today = new Date().toISOString().slice(0, 10);
  const dailyDone = save.dailyDate === today && save.dailyDone;
  const moduleLevels = save.moduleLevels || {};

  return (
    <div style={S.root(tier.bg)}>
      <div style={S.page}>
        <BackBtn onClick={onBack} />
        <h2 style={S.title(tier.color)}>Kies Modus</h2>
        <p style={{ color:"#555", fontSize:13, margin:"-6px 0 4px" }}>{tier.emoji} {tier.label} niveau</p>

        {/* ── GAME MODI ── */}
        <div style={sectionLabel}>🎮 Game Modi</div>
        <div style={S.grid2}>
          {GAME_MODES.map(m => {
            const locked = m.id === "daily" && dailyDone;
            return (
              <button key={m.id} style={S.modeCard(tier.color, locked)} onClick={() => !locked && onSelect(m.id)} disabled={locked}>
                <div style={{ fontSize:26, marginBottom:5 }}>{m.icon}</div>
                <div style={{ fontWeight:800, fontSize:14 }}>{m.label}</div>
                <div style={{ fontSize:11, color:"#777", marginTop:3, lineHeight:1.4 }}>{m.desc}</div>
                {locked && <div style={{ fontSize:10, color:"#4ade80", marginTop:5 }}>Vandaag voltooid</div>}
              </button>
            );
          })}
        </div>

        {/* ── OEFENEN ── */}
        <div style={sectionLabel}>📚 Oefenen</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {PRACTICE_MODULES.map(pm => {
            const locked = pm.unlockedAt > tierIdx;
            const level = pm.modId ? (moduleLevels[pm.modId] || 1) : null;
            const modColor = pm.modId ? (MATH_MODULES[pm.modId]?.color || tier.color) : tier.color;
            const stats = pm.modId ? save.moduleStats?.[pm.modId] : null;
            const acc = stats?.total > 0 ? Math.round(stats.correct / stats.total * 100) : null;

            return (
              <button
                key={pm.id}
                style={practiceCard(modColor, locked)}
                onClick={() => !locked && onSelect(pm.id)}
                disabled={locked}
              >
                {/* Left: icon + label */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={iconBox(modColor, locked)}>{pm.icon}</div>
                  <div style={{ textAlign:"left" }}>
                    <div style={{ fontWeight:800, fontSize:15, color: locked ? "#444" : "#fff" }}>{pm.label}</div>
                    {locked
                      ? <div style={{ fontSize:11, color:"#444" }}>Ontgrendelt op {["Beginner","Amateur","Gevorderd","Pro","Elite"][pm.unlockedAt]}</div>
                      : <div style={{ fontSize:11, color:"#666" }}>Geen tijdsdruk — vrij oefenen</div>
                    }
                  </div>
                </div>

                {/* Right: level + accuracy */}
                {!locked && (
                  <div style={{ textAlign:"right" }}>
                    {level !== null && (
                      <div style={{ color: modColor, fontWeight:900, fontSize:16 }}>Lvl {level}</div>
                    )}
                    {acc !== null && (
                      <div style={{ fontSize:11, color: acc >= 80 ? "#4ade80" : acc >= 60 ? "#fbbf24" : "#f87171" }}>{acc}%</div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const sectionLabel = {
  fontSize:11, color:"#555", textTransform:"uppercase",
  letterSpacing:1.5, marginTop:4, marginBottom:2,
};

const practiceCard = (color, locked) => ({
  display:"flex", justifyContent:"space-between", alignItems:"center",
  background: locked ? "#ffffff05" : "#ffffff0a",
  border: `1px solid ${locked ? "#1a1a1a" : color + "33"}`,
  borderRadius:16, padding:"14px 16px",
  cursor: locked ? "default" : "pointer",
  opacity: locked ? 0.5 : 1,
  WebkitTapHighlightColor:"transparent",
});

const iconBox = (color, locked) => ({
  width:40, height:40, borderRadius:12,
  background: locked ? "#ffffff08" : color + "22",
  border: `1px solid ${locked ? "#222" : color + "44"}`,
  display:"flex", alignItems:"center", justifyContent:"center",
  fontSize:16, fontWeight:900, color: locked ? "#444" : color,
  flexShrink:0,
});

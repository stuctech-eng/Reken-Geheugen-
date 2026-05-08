import { BackBtn } from "../components/Shared.jsx";
import { GAME_MODES } from "../games/index.js";
import { S } from "../styles/index.js";

export default function ModeScreen({ tier, save, onSelect, onBack }) {
  const today = new Date().toISOString().slice(0, 10);
  const dailyDone = save.dailyDate === today && save.dailyDone;

  return (
    <div style={S.root(tier.bg)}>
      <div style={S.page}>
        <BackBtn onClick={onBack} />
        <h2 style={S.title(tier.color)}>Kies Modus</h2>
        <p style={{ color:"#555", fontSize:13, margin:"-6px 0 8px" }}>{tier.emoji} {tier.label} niveau</p>
        <div style={S.grid2}>
          {GAME_MODES.map(m => {
            const locked = m.id === "daily" && dailyDone;
            return (
              <button key={m.id} style={S.modeCard(tier.color, locked)} onClick={() => !locked && onSelect(m.id)} disabled={locked}>
                <div style={{ fontSize:26, marginBottom:5 }}>{m.icon}</div>
                <div style={{ fontWeight:800, fontSize:14 }}>{m.label}</div>
                <div style={{ fontSize:11, color:"#777", marginTop:3, lineHeight:1.4 }}>{m.desc}</div>
                {locked && <div style={{ fontSize:10, color:"#4ade80", marginTop:5 }}>✓ Vandaag voltooid</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

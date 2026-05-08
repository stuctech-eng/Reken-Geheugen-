import { BackBtn } from "../components/Shared.jsx";
import { MATH_MODULES } from "../games/index.js";
import { TIERS } from "../core/tiers.js";
import { DEFAULT_SAVE } from "../core/save.js";
import { S } from "../styles/index.js";

export default function SettingsScreen({ tier, tierIdx, save, onUpdate, onBack }) {
  const settings = save.settings || DEFAULT_SAVE.settings;
  const enabled = settings.enabledModules || [];

  function toggleMod(id) {
    const c = [...enabled];
    const i = c.indexOf(id);
    if (i >= 0) { if (c.length <= 1) return; c.splice(i, 1); } else c.push(id);
    onUpdate({ settings: { ...settings, enabledModules: c } });
  }

  return (
    <div style={S.root(tier.bg)}>
      <div style={S.page}>
        <BackBtn onClick={onBack} />
        <h2 style={S.title(tier.color)}>Instellingen</h2>

        <div style={S.card(tier.color)}>
          <div style={S.sTitle}>Modules aan/uit</div>
          {Object.values(MATH_MODULES).map(mod => {
            const unlocked = mod.unlockedAt <= tierIdx, on = enabled.includes(mod.id);
            return (
              <div key={mod.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #1a1a1a", opacity:unlocked?1:0.35 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ fontSize:16, color:unlocked?mod.color:"#444" }}>{mod.icon}</span>
                  <div>
                    <div style={{ fontWeight:700, color:unlocked?"#ccc":"#444", fontSize:14 }}>{mod.label}</div>
                    {!unlocked && <div style={{ fontSize:10, color:"#444" }}>Ontgrendelt op {TIERS[mod.unlockedAt].label}</div>}
                  </div>
                </div>
                <button style={S.toggle(on&&unlocked, mod.color)} onClick={() => unlocked && toggleMod(mod.id)} disabled={!unlocked}>
                  {on && unlocked ? "AAN" : "UIT"}
                </button>
              </div>
            );
          })}
        </div>

        <div style={S.card(tier.color)}>
          <div style={S.sTitle}>Module Statistieken</div>
          {Object.values(MATH_MODULES).map(mod => {
            const ms = save.moduleStats?.[mod.id]; if (!ms) return null;
            const a = ms.total > 0 ? Math.round(ms.correct / ms.total * 100) : 0;
            return (
              <div key={mod.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid #1a1a1a", fontSize:13 }}>
                <span style={{ color:mod.color, width:110 }}>{mod.icon} {mod.label}</span>
                <span style={{ color:a>=80?"#4ade80":a>=60?"#fbbf24":"#f87171", fontWeight:700 }}>{a}%</span>
                <span style={{ color:"#555" }}>{ms.correct}/{ms.total}</span>
                <span style={{ color:"#444", fontSize:11 }}>⌀{(ms.avgTime/1000).toFixed(1)}s</span>
              </div>
            );
          })}
        </div>

        <button
          style={{ ...S.stopBtn, color:"#f87171", borderColor:"#f8717133" }}
          onClick={() => { if (window.confirm("Reset alle data?")) { localStorage.removeItem("rg3_save"); window.location.reload(); } }}
        >
          ⚠️ Reset alle data
        </button>
      </div>
    </div>
  );
}

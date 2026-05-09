import { useState } from "react";
import { BackBtn } from "../components/Shared.jsx";
import { GAME_MODES, MATH_MODULES, PRACTICE_MODULES } from "../games/index.js";
import { S } from "../styles/index.js";

export default function ModeScreen({ tier, tierIdx, save, onSelect, onBack }) {
const today = new Date().toISOString().slice(0, 10);
const dailyDone = save.dailyDate === today && save.dailyDone;
const moduleLevels = save.moduleLevels || {};
const [oefenOpen, setOefenOpen] = useState(false);

return (
<div style={S.root(tier.bg)}>
<div style={S.page}>
<BackBtn onClick={onBack} />
<h2 style={S.title(tier.color)}>Kies Modus</h2>
<p style={{ color:"#555", fontSize:13, margin:"-6px 0 4px" }}>
{tier.emoji} {tier.label} niveau
</p>


    <div style={sectionLabel}>Game Modi</div>
    <div style={S.grid2}>
      {GAME_MODES.map(function(m) {
        const locked = m.id === "daily" && dailyDone;
        return (
          <button
            key={m.id}
            style={S.modeCard(tier.color, locked)}
            onClick={function() { if (!locked) onSelect(m.id); }}
            disabled={locked}
          >
            <div style={{ fontSize:26, marginBottom:5 }}>{m.icon}</div>
            <div style={{ fontWeight:800, fontSize:14 }}>{m.label}</div>
            <div style={{ fontSize:11, color:"#777", marginTop:3, lineHeight:1.4 }}>{m.desc}</div>
            {locked && (
              <div style={{ fontSize:10, color:"#4ade80", marginTop:5 }}>Vandaag voltooid</div>
            )}
          </button>
        );
      })}
    </div>

    <button
      onClick={function() { setOefenOpen(!oefenOpen); }}
      style={oefenToggleBtn(tier.color, oefenOpen)}
    >
      <span style={{ fontSize:18 }}>📚</span>
      <span style={{ fontWeight:800, fontSize:15 }}>Oefeningen</span>
      <span style={{ marginLeft:"auto", fontSize:13, color:tier.color }}>
        {oefenOpen ? "▲ Inklappen" : "▼ Uitklappen"}
      </span>
    </button>

    {oefenOpen && (
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {PRACTICE_MODULES.map(function(pm) {
          const mod = pm.modId ? MATH_MODULES[pm.modId] : null;
          const modColor = mod ? mod.color : tier.color;
          const level = pm.modId ? (moduleLevels[pm.modId] || 1) : null;
          const stats = pm.modId && save.moduleStats ? save.moduleStats[pm.modId] : null;
          const acc = stats && stats.total > 0
            ? Math.round((stats.correct / stats.total) * 100)
            : null;
          const accColor =
            acc === null ? "#555" :
            acc >= 80 ? "#4ade80" :
            acc >= 60 ? "#fbbf24" : "#f87171";

          return (
            <button
              key={pm.id}
              onClick={function() { onSelect(pm.id); }}
              style={{
                display:"flex",
                justifyContent:"space-between",
                alignItems:"center",
                background:"#ffffff0a",
                border:"1px solid " + modColor + "33",
                borderRadius:16,
                padding:"14px 16px",
                cursor:"pointer",
                WebkitTapHighlightColor:"transparent",
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:40, height:40, borderRadius:12,
                  background:modColor + "22",
                  border:"1px solid " + modColor + "44",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, fontWeight:900, color:modColor,
                  flexShrink:0,
                }}>
                  {pm.icon}
                </div>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontWeight:800, fontSize:15, color:"#fff" }}>{pm.label}</div>
                  <div style={{ fontSize:11, color:"#666" }}>Geen tijdsdruk</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                {level !== null && (
                  <div style={{ color:modColor, fontWeight:900, fontSize:16 }}>Lvl {level}</div>
                )}
                {acc !== null && (
                  <div style={{ fontSize:11, color:accColor }}>{acc}%</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    )}
  </div>
</div>


);
}

const sectionLabel = {
fontSize:11, color:"#555", textTransform:"uppercase",
letterSpacing:1.5, marginTop:4, marginBottom:2,
};

function oefenToggleBtn(color, open) {
return {
display:"flex", alignItems:"center", gap:10,
width:"100%", padding:"16px",
background: open ? color + "18" : "#ffffff0a",
border:"1px solid " + (open ? color + "44" : "#2a2a2a"),
borderRadius:16, cursor:"pointer",
color:"#fff", marginTop:4,
WebkitTapHighlightColor:"transparent",
};
}
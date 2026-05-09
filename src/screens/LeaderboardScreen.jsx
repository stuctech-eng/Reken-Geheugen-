import { useState, useEffect } from "react";
import { BackBtn } from "../components/Shared.jsx";
import { MATH_MODULES } from "../games/index.js";
import {
  fetchGlobalTop10, fetchModuleTop10, fetchDailyTop10, fetchMyRankGlobal
} from "../services/leaderboard.js";
import { S } from "../styles/index.js";

const TABS = [
  { id:"global",  label:"Globaal", icon:"🌍" },
  { id:"modules", label:"Modules", icon:"📚" },
  { id:"daily",   label:"Daily",   icon:"🎯" },
];

const MODULE_TABS = ["plus","minus","tables","multiply","divide","percent"];

export default function LeaderboardScreen({ uid, tier, save, onBack }) {
  const [tab, setTab]         = useState("global");
  const [modTab, setModTab]   = useState("plus");
  const [data, setData]       = useState([]);
  const [myRank, setMyRank]   = useState(null);
  const [loading, setLoading] = useState(true);

  const displayName = save.displayName || save.username || "Jij";

  useEffect(() => { loadData(); }, [tab, modTab]);

  async function loadData() {
    setLoading(true);
    setMyRank(null);
    try {
      let rows = [];
      if (tab === "global") {
        rows = await fetchGlobalTop10();
        const rank = await fetchMyRankGlobal(uid, save.xp);
        setMyRank(rank);
      } else if (tab === "modules") {
        rows = await fetchModuleTop10(modTab);
      } else if (tab === "daily") {
        rows = await fetchDailyTop10();
      }
      setData(rows);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  const isMe = (row) => row.uid === uid;
  const today = new Date().toLocaleDateString("nl-NL", { day:"numeric", month:"long" });

  return (
    <div style={S.root(tier.bg)}>
      <div style={S.page}>
        <BackBtn onClick={onBack} />
        <h2 style={S.title(tier.color)}>Leaderboard</h2>

        {/* Main tabs */}
        <div style={tabRow}>
          {TABS.map(t => (
            <button key={t.id} style={tabBtn(t.id === tab, tier.color)} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Module sub-tabs */}
        {tab === "modules" && (
          <div style={modTabRow}>
            {MODULE_TABS.map(id => {
              const mod = MATH_MODULES[id];
              return (
                <button
                  key={id}
                  style={modTabBtn(id === modTab, mod?.color || tier.color)}
                  onClick={() => setModTab(id)}
                >
                  {mod?.icon} {mod?.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Daily date */}
        {tab === "daily" && (
          <div style={{ color:"#555", fontSize:12, textAlign:"center", marginTop:-4 }}>
            Vandaag: {today} — reset morgen
          </div>
        )}

        {/* My position card */}
        <div style={myCard(tier.color)}>
          <span style={{ color:"#555", fontSize:13 }}>Jouw positie</span>
          <span style={{ color:tier.color, fontWeight:900, fontSize:18 }}>
            {tab === "global" && myRank ? `#${myRank}` : "—"}
            {tab === "modules" ? `Lvl ${save.moduleLevels?.[modTab] || 1}` : ""}
            {tab === "daily" ? "Speel Daily!" : ""}
          </span>
          <span style={{ color:"#666", fontSize:13 }}>{displayName}</span>
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <div style={{ textAlign:"center", color:"#444", padding:40 }}>Laden...</div>
        ) : data.length === 0 ? (
          <div style={{ textAlign:"center", color:"#444", padding:40 }}>
            Nog geen scores.<br/>Speel een potje!
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {data.map((row, i) => (
              <div key={row.uid} style={rowCard(isMe(row), tier.color)}>
                {/* Rank */}
                <div style={rankCol(i)}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${row.rank}`}
                </div>

                {/* Name */}
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight: isMe(row) ? 900 : 600, color: isMe(row) ? tier.color : "#ccc", fontSize:15 }}>
                    {row.displayName} {isMe(row) ? "★" : ""}
                  </div>
                </div>

                {/* Score */}
                <div style={{ textAlign:"right" }}>
                  {tab === "global" && (
                    <div style={{ color:tier.color, fontWeight:700 }}>{row.xp} XP</div>
                  )}
                  {tab === "modules" && (
                    <>
                      <div style={{ color:tier.color, fontWeight:700 }}>Lvl {row.level}</div>
                      <div style={{ color:"#555", fontSize:11 }}>{row.accuracy}% acc</div>
                    </>
                  )}
                  {tab === "daily" && (
                    <div style={{ color:tier.color, fontWeight:700 }}>{row.score} pts</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────
const tabRow = {
  display:"flex", gap:8, width:"100%",
};
const tabBtn = (active, color) => ({
  flex:1, padding:"10px 4px", borderRadius:12,
  background: active ? color + "22" : "#ffffff08",
  border: `1px solid ${active ? color + "66" : "#222"}`,
  color: active ? color : "#555",
  fontWeight: active ? 800 : 500,
  fontSize:13, cursor:"pointer",
});
const modTabRow = {
  display:"flex", gap:6, overflowX:"auto", paddingBottom:4,
};
const modTabBtn = (active, color) => ({
  flexShrink:0, padding:"6px 12px", borderRadius:999,
  background: active ? color + "22" : "#ffffff08",
  border: `1px solid ${active ? color + "44" : "#222"}`,
  color: active ? color : "#555",
  fontWeight: active ? 700 : 400,
  fontSize:12, cursor:"pointer", whiteSpace:"nowrap",
});
const myCard = (color) => ({
  display:"flex", justifyContent:"space-between", alignItems:"center",
  background: color + "12",
  border: `1px solid ${color}33`,
  borderRadius:14, padding:"12px 16px",
});
const rowCard = (isMe, color) => ({
  display:"flex", alignItems:"center", gap:12,
  background: isMe ? color + "12" : "#ffffff07",
  border: `1px solid ${isMe ? color + "44" : "#1a1a1a"}`,
  borderRadius:14, padding:"12px 14px",
});
const rankCol = (i) => ({
  width:32, textAlign:"center",
  fontSize: i < 3 ? 22 : 14,
  fontWeight:900, color: i < 3 ? "#fbbf24" : "#555",
});

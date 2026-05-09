import { RStat, SRow } from "../components/Shared.jsx";
import { MATH_MODULES } from "../games/index.js";
import { S } from "../styles/index.js";

export default function ResultScreen({ result, tier, promoAlert, onDismiss, onHome, onReplay }) {
  const g = result.accuracy>=95?{e:"🏆",l:"Uitstekend!"}:result.accuracy>=85?{e:"⭐",l:"Geweldig!"}:result.accuracy>=70?{e:"👍",l:"Goed gedaan"}:result.accuracy>=50?{e:"💪",l:"Blijf oefenen"}:{e:"😤",l:"Niet opgeven!"};

  return (
    <div style={S.root(tier.bg)}>
      <div style={S.page}>
        {promoAlert && (
          <div style={S.promo(promoAlert.color)}>
            <span style={{ fontSize:24 }}>🎉</span>
            <div>
              <div style={{ fontWeight:900, color:promoAlert.color }}>Promotie! → {promoAlert.label}</div>
              <div style={{ fontSize:12, color:"#aaa" }}>Je bent bevorderd naar het volgende niveau!</div>
            </div>
            <button style={{ background:"none", border:"none", color:"#666", fontSize:16, cursor:"pointer" }} onClick={onDismiss}>✕</button>
          </div>
        )}

        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:48 }}>{g.e}</div>
          <div style={{ fontSize:22, fontWeight:900, color:tier.color, marginTop:6 }}>{g.l}</div>
          {result.isPractice && result.practiceModId && result.finalLevel && (
            <div style={{ fontSize:14, color:"#666", marginTop:6 }}>
              Module level: <span style={{ color:tier.color, fontWeight:900 }}>Lvl {result.finalLevel}</span>
            </div>
          )}
          {result.isPractice && (
            <div style={{ fontSize:12, color:"#444", marginTop:4 }}>Oefen sessie — geen tijdsdruk</div>
          )}
        </div>

        <div style={S.card(tier.color)}>
          <div style={{ fontSize:11, color:"#555", marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>Score Breakdown</div>
          <SRow label="Nauwkeurigheid" value={result.score.accScore} color={tier.color} />
          <SRow label="Snelheidsbonus" value={"+" + result.score.speed} color="#60a5fa" />
          <SRow label={"Combo ×" + result.score.combo} value={"×" + result.score.combo} color="#fbbf24" />
          <SRow label="Niveau bonus" value={"+" + result.score.diff} color="#c084fc" />
          <div style={{ borderTop:"1px solid #222", marginTop:8, paddingTop:8, ...S.row }}>
            <span style={{ color:"#666" }}>Totaal</span>
            <span style={{ color:tier.color, fontWeight:900, fontSize:18 }}>{result.score.raw} pts</span>
          </div>
        </div>

        <div style={S.grid3}>
          <RStat label="Nauwkeurig" value={result.accuracy + "%"} color={tier.color} />
          <RStat label="Goed/Totaal" value={result.correct + "/" + result.total} color={tier.color} />
          <RStat label="XP" value={"+" + result.score.xp} color="#fbbf24" />
          <RStat label="Coins" value={"+" + result.score.coins + "🪙"} color="#fbbf24" />
          <RStat label="Beste Streak" value={result.bestStreak + "🔥"} color={tier.color} />
          <RStat label="Gem. tijd" value={(result.avgMs/1000).toFixed(1) + "s"} color={tier.color} />
        </div>

        {Object.keys(result.moduleBreakdown).length > 1 && (
          <div style={S.card(tier.color)}>
            <div style={{ fontSize:11, color:"#555", marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>Fouten Analyse per Module</div>
            {Object.entries(result.moduleBreakdown).map(([id, data]) => {
              const mod = MATH_MODULES[id]; if (!mod) return null;
              const a = data.total > 0 ? Math.round(data.correct / data.total * 100) : 0;
              return (
                <div key={id} style={{ ...S.row, padding:"6px 0", borderBottom:"1px solid #1a1a1a", fontSize:13 }}>
                  <span style={{ color:mod.color, width:110 }}>{mod.icon} {mod.label}</span>
                  <span style={{ color:a>=80?"#4ade80":a>=60?"#fbbf24":"#f87171", fontWeight:700 }}>{a}%</span>
                  <span style={{ color:"#555" }}>{data.correct}/{data.total}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display:"flex", gap:10 }}>
          <button style={S.playBtn(tier.color)} onClick={onReplay}>Opnieuw</button>
          <button style={S.homeBtn} onClick={onHome}>Home</button>
        </div>
      </div>
    </div>
  );
}

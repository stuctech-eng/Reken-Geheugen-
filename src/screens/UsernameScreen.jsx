import { useState } from "react";
import { claimUsername } from "../services/leaderboard.js";
import { S } from "../styles/index.js";

export default function UsernameScreen({ uid, tier, onDone }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await claimUsername(uid, input.trim());
      onDone(input.trim());
    } catch (err) {
      setError(err.message || "Probeer een andere naam");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.root(tier.bg)}>
      <div style={{ ...S.page, justifyContent:"center", minHeight:"100dvh" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:52, marginBottom:12 }}>🏆</div>
          <h2 style={{ fontSize:28, fontWeight:900, color:tier.color, margin:0 }}>Kies je naam</h2>
          <p style={{ color:"#555", fontSize:14, marginTop:8 }}>
            Deze naam verschijnt op het leaderboard.<br/>Eenmalig te kiezen.
          </p>
        </div>

        <div style={{ width:"100%" }}>
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setError(null); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Jouw naam..."
            maxLength={20}
            style={inputStyle(tier.color, !!error)}
            autoFocus
          />

          {error && (
            <div style={{ color:"#f87171", fontSize:13, marginTop:8, textAlign:"center" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ color:"#444", fontSize:12, marginTop:8, textAlign:"center" }}>
            2–20 tekens · Uniek per speler · Niet aanpasbaar
          </div>
        </div>

        <button
          style={{
            ...S.playBtn(tier.color),
            marginTop:24,
            opacity: (!input.trim() || loading) ? 0.5 : 1,
          }}
          onClick={handleSubmit}
          disabled={!input.trim() || loading}
        >
          {loading ? "CONTROLEREN..." : "BEVESTIGEN"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = (color, hasError) => ({
  width: "100%",
  padding: "16px 18px",
  background: "#ffffff08",
  border: `2px solid ${hasError ? "#f87171" : color + "44"}`,
  borderRadius: 16,
  color: "#fff",
  fontSize: 22,
  fontWeight: 700,
  outline: "none",
  fontFamily: "'Trebuchet MS', sans-serif",
  textAlign: "center",
  letterSpacing: 1,
});

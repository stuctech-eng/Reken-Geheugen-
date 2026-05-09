export function Bar({ pct, color }) {
  return (
    <div style={{ height:8, background:"#ffffff10", borderRadius:999, overflow:"hidden" }}>
      <div style={{ height:"100%", width:Math.min(pct*100,100)+"%", background:"linear-gradient(90deg,"+color+"88,"+color+")", borderRadius:999, transition:"width 0.5s" }} />
    </div>
  );
}

export function Btn({ icon, color, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        background: color + "18",
        border: "1px solid " + color + "33",
        borderRadius: 10,
        width: 38, height: 38,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 17, cursor: "pointer", color,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {icon}
    </button>
  );
}

export function BackBtn({ onClick }) {
  return <button style={{ background:"none", border:"none", color:"#555", fontSize:15, cursor:"pointer", padding:0, alignSelf:"flex-start" }} onClick={onClick}>← Terug</button>;
}

export function Stat({ label, value, color }) {
  return (
    <div style={{ background:"#ffffff07", border:"1px solid "+color+"18", borderRadius:12, padding:"10px 4px", textAlign:"center" }}>
      <div style={{ fontSize:16, fontWeight:900, color }}>{value}</div>
      <div style={{ fontSize:10, color:"#555", marginTop:2 }}>{label}</div>
    </div>
  );
}

export function RStat({ label, value, color }) {
  return (
    <div style={{ background:"#ffffff06", border:"1px solid "+color+"22", borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
      <div style={{ fontSize:16, fontWeight:900, color }}>{value}</div>
      <div style={{ fontSize:10, color:"#555", marginTop:2 }}>{label}</div>
    </div>
  );
}

export function SRow({ label, value, color }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
      <span style={{ color:"#666", fontSize:13 }}>{label}</span>
      <span style={{ color, fontWeight:700, fontSize:13 }}>{value}</span>
    </div>
  );
}

export function KPI({ label, value, target, ok, color }) {
  return (
    <div style={{ background:"#ffffff06", border:"1px solid "+(ok?color+"44":"#33333366"), borderRadius:12, padding:"12px 10px" }}>
      <div style={{ fontSize:17, fontWeight:900, color:ok?color:"#f87171" }}>{value}</div>
      <div style={{ fontSize:10, color:"#555", marginTop:2 }}>{label}</div>
      {target && <div style={{ fontSize:10, color:ok?"#4ade8088":"#f8717188", marginTop:4 }}>{ok?"✓ ":"→ "}{target}</div>}
    </div>
  );
}

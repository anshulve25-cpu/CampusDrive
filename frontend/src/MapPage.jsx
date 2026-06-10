import { useState, useEffect } from "react";
import { PageLayout } from "./Layout";

const CAMPUS_STOPS = [
  { name:"Main Gate", top:"85%", left:"15%" },
  { name:"Library", top:"45%", left:"35%" },
  { name:"Academic Block A", top:"30%", left:"50%" },
  { name:"Hostel Zone 1", top:"20%", left:"70%" },
  { name:"Cafeteria", top:"55%", left:"60%" },
  { name:"Admin Block", top:"65%", left:"40%" },
  { name:"Sports Complex", top:"15%", left:"30%" },
  { name:"Medical Center", top:"70%", left:"75%" },
];

const INITIAL_DRIVERS = [
  { id:"d1", name:"Ramesh Kumar", emoji:"🛺", top:40, left:30, online:true, vehicle:"E-Rickshaw", rating:4.8 },
  { id:"d2", name:"Suresh Patel", emoji:"🛺", top:55, left:55, online:true, vehicle:"Golf Cart", rating:4.9 },
  { id:"d3", name:"Mohan Lal", emoji:"🛺", top:25, left:65, online:true, vehicle:"Auto", rating:4.7 },
  { id:"d4", name:"Vijay Singh", emoji:"🛺", top:70, left:45, online:false, vehicle:"E-Rickshaw", rating:4.6 },
];

export default function MapPage() {
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [selected, setSelected] = useState(null);
  const [tick, setTick] = useState(0);

  // Animate driver positions
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(ds => ds.map(d => d.online ? {
        ...d,
        top: Math.min(85, Math.max(10, d.top + (Math.random() - 0.5) * 3)),
        left: Math.min(88, Math.max(10, d.left + (Math.random() - 0.5) * 3)),
      } : d));
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PageLayout title="Live Map">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:"1rem", height:"calc(100vh - 130px)" }}>

        {/* Map */}
        <div style={{ background:"#0e1018", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, overflow:"hidden", position:"relative" }}>
          {/* Grid overlay */}
          <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize:"50px 50px" }} />

          {/* Ambient glow */}
          <div style={{ position:"absolute", top:"30%", left:"25%", width:200, height:200, background:"radial-gradient(circle,rgba(0,239,255,0.05),transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />
          <div style={{ position:"absolute", top:"60%", left:"60%", width:180, height:180, background:"radial-gradient(circle,rgba(0,255,153,0.05),transparent 70%)", borderRadius:"50%", pointerEvents:"none" }} />

          {/* Campus stops */}
          {CAMPUS_STOPS.map(s => (
            <div key={s.name} style={{ position:"absolute", top:s.top, left:s.left, transform:"translate(-50%,-50%)", textAlign:"center", zIndex:1 }}>
              <div style={{ width:8, height:8, background:"rgba(255,255,255,0.2)", borderRadius:"50%", margin:"0 auto 3px", border:"1px solid rgba(255,255,255,0.1)" }} />
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", background:"rgba(14,16,24,0.8)", padding:"1px 5px", borderRadius:3, whiteSpace:"nowrap" }}>{s.name}</div>
            </div>
          ))}

          {/* Driver markers */}
          {drivers.map(d => (
            <div key={d.id} onClick={() => setSelected(selected?.id === d.id ? null : d)}
              style={{ position:"absolute", top:`${d.top}%`, left:`${d.left}%`, transform:"translate(-50%,-50%)", textAlign:"center", cursor:"pointer", zIndex:2, transition:"top 1.5s ease, left 1.5s ease" }}>
              <div style={{ fontSize:22, filter:`drop-shadow(0 0 8px ${d.online?"#00ff99":"#444"})`, opacity:d.online?1:0.4 }}>{d.emoji}</div>
              <div style={{ fontSize:9, background:d.online?"rgba(0,255,153,0.15)":"rgba(255,255,255,0.05)", border:`1px solid ${d.online?"rgba(0,255,153,0.4)":"rgba(255,255,255,0.1)"}`, borderRadius:4, padding:"1px 5px", color:d.online?"#00ff99":"#666", marginTop:2, whiteSpace:"nowrap" }}>{d.name.split(" ")[0]}</div>
            </div>
          ))}

          {/* Driver popup */}
          {selected && (
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:"#151824", border:"1px solid rgba(0,239,255,0.3)", borderRadius:12, padding:"1.25rem", width:220, zIndex:10, animation:"fadeIn .2s ease" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div style={{ fontSize:32 }}>{selected.emoji}</div>
                <button onClick={() => setSelected(null)} style={{ background:"transparent", border:"none", color:"#8a92a8", fontSize:18, cursor:"pointer", lineHeight:1 }}>×</button>
              </div>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>{selected.name}</div>
              <div style={{ fontSize:12, color:"#8a92a8", marginBottom:8 }}>{selected.vehicle} · ⭐{selected.rating}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:selected.online?"#00ff99":"#666" }} />
                <span style={{ color:selected.online?"#00ff99":"#666" }}>{selected.online?"Online":"Offline"}</span>
              </div>
              {selected.online && <button style={{ width:"100%", marginTop:12, padding:"8px", background:"#00efff", border:"none", borderRadius:8, color:"#000", fontWeight:700, fontSize:13, cursor:"pointer" }}>Request This Driver</button>}
            </div>
          )}

          {/* Live badge */}
          <div style={{ position:"absolute", bottom:12, left:12, background:"rgba(14,16,24,0.9)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 12px", fontSize:11, color:"#8a92a8", display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:6, height:6, background:"#00ff99", borderRadius:"50%", animation:"pulseDot 2s infinite" }} />
            Live · Updates every 2s · {drivers.filter(d=>d.online).length} drivers active
          </div>

          {/* Legend */}
          <div style={{ position:"absolute", bottom:12, right:12, background:"rgba(14,16,24,0.9)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"6px 12px", fontSize:11, color:"#8a92a8", display:"flex", gap:12 }}>
            <span>🟢 Online</span><span>⚫ Offline</span><span>● Campus stop</span>
          </div>
        </div>

        {/* Driver list panel */}
        <div style={{ overflowY:"auto" }}>
          <div style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"1rem" }}>All Drivers</div>
          {drivers.map(d => (
            <div key={d.id} onClick={() => setSelected(selected?.id === d.id ? null : d)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:selected?.id===d.id?"rgba(0,239,255,0.06)":"#151824", border:`1px solid ${selected?.id===d.id?"rgba(0,239,255,0.3)":"rgba(255,255,255,0.07)"}`, borderRadius:10, marginBottom:8, cursor:"pointer", transition:"all .2s" }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:"#1c2130", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{d.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{d.name}</div>
                <div style={{ fontSize:11, color:"#8a92a8" }}>{d.vehicle}</div>
              </div>
              <div style={{ width:8, height:8, borderRadius:"50%", background:d.online?"#00ff99":"#444" }} />
            </div>
          ))}

          <div style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px", margin:"1.5rem 0 1rem" }}>Campus Stops</div>
          {CAMPUS_STOPS.map(s => (
            <div key={s.name} style={{ padding:"8px 12px", background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:8, marginBottom:6, fontSize:12, color:"#8a92a8", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"rgba(255,255,255,0.2)" }} />{s.name}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}

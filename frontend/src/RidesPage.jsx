import { useState } from "react";
import { useAuthStore } from "./Authstore";
import { PageLayout } from "./Layout";

const STATUS_COLOR = { requested:"#ffdd57", accepted:"#00efff", inprogress:"#00ff99", completed:"#7b5ea7", cancelled:"#ff4d6d" };

const PASSENGER_RIDES = [
  { _id:"1", pickup:{name:"Main Gate"}, destination:{name:"Library"}, status:"completed", fare:15, rating:5, time:"Today 10:30 AM", driver:"Ramesh Kumar" },
  { _id:"2", pickup:{name:"Hostel Zone 1"}, destination:{name:"Cafeteria"}, status:"completed", fare:12, rating:4, time:"Today 8:15 AM", driver:"Suresh Patel" },
  { _id:"3", pickup:{name:"Admin Block"}, destination:{name:"Sports Complex"}, status:"cancelled", fare:0, rating:null, time:"Yesterday 3:00 PM", driver:"—" },
  { _id:"4", pickup:{name:"Library"}, destination:{name:"Research Park"}, status:"completed", fare:22, rating:5, time:"Yesterday 11:00 AM", driver:"Mohan Lal" },
  { _id:"5", pickup:{name:"Medical Center"}, destination:{name:"Main Gate"}, status:"completed", fare:18, rating:3, time:"2 days ago", driver:"Vijay Singh" },
];

const DRIVER_REQUESTS = [
  { _id:"r1", passenger:{name:"Aarav Shah", emoji:"👨‍🎓"}, pickup:{name:"Main Gate"}, destination:{name:"Library"}, fare:15, time:"Just now", status:"requested" },
  { _id:"r2", passenger:{name:"Priya Gupta", emoji:"👩‍🎓"}, pickup:{name:"Academic Block A"}, destination:{name:"Hostel Zone 2"}, fare:20, time:"2 min ago", status:"requested" },
];

export default function RidesPage() {
  const { user } = useAuthStore();
  const isDriver = user?.role === "driver";
  const [filter, setFilter] = useState("all");
  const [requests, setRequests] = useState(DRIVER_REQUESTS);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="info") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const filtered = filter === "all" ? PASSENGER_RIDES : PASSENGER_RIDES.filter(r => r.status === filter);

  return (
    <PageLayout title={isDriver ? "Ride Requests" : "My Rides"}>
      {isDriver ? (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
            {[["Pending",requests.length,"#ffdd57"],["Completed Today","8","#00ff99"],["Total Rides","142","#00efff"]].map(([l,v,c])=>(
              <div key={l} style={{ background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"1rem 1.25rem" }}>
                <div style={{ fontSize:11, color:"#8a92a8", textTransform:"uppercase", letterSpacing:".8px", marginBottom:8 }}>{l}</div>
                <div style={{ fontSize:28, fontWeight:600, fontFamily:"Space Mono,monospace", color:c }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"1rem" }}>Pending Requests</div>
          {requests.length === 0 && <div style={{ background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"2.5rem", textAlign:"center", color:"#8a92a8" }}><div style={{ fontSize:36, marginBottom:8 }}>🛺</div>No pending requests</div>}
          {requests.map(r => (
            <div key={r._id} style={{ display:"flex", alignItems:"center", gap:12, padding:"1rem 1.25rem", background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, marginBottom:8 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"#1c2130", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{r.passenger.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500 }}>{r.passenger.name}</div>
                <div style={{ fontSize:12, color:"#8a92a8", marginTop:2 }}>📍 {r.pickup.name} → {r.destination.name}</div>
                <div style={{ fontSize:11, color:"#4a5168", marginTop:2 }}>{r.time} · ₹{r.fare}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>{setRequests(rs=>rs.filter(x=>x._id!==r._id));showToast("Ride accepted! Head to pickup 🛺","success");}} style={{ padding:"6px 16px", border:"1px solid #00ff99", borderRadius:8, background:"transparent", color:"#00ff99", fontSize:13, cursor:"pointer" }}>Accept</button>
                <button onClick={()=>{setRequests(rs=>rs.filter(x=>x._id!==r._id));showToast("Ride rejected","warn");}} style={{ padding:"6px 16px", border:"1px solid #ff4d6d", borderRadius:8, background:"transparent", color:"#ff4d6d", fontSize:13, cursor:"pointer" }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Filter tabs */}
          <div style={{ display:"flex", gap:8, marginBottom:"1.5rem" }}>
            {["all","completed","cancelled"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{ padding:"6px 16px", border:`1px solid ${filter===f?"#00efff":"rgba(255,255,255,0.12)"}`, borderRadius:20, background:filter===f?"rgba(0,239,255,0.08)":"transparent", color:filter===f?"#00efff":"#8a92a8", fontSize:13, cursor:"pointer", fontFamily:"DM Sans,sans-serif", transition:"all .2s", textTransform:"capitalize" }}>{f==="all"?"All Rides":f}</button>
            ))}
            <span style={{ marginLeft:"auto", fontSize:13, color:"#8a92a8", alignSelf:"center" }}>{filtered.length} rides</span>
          </div>

          {filtered.map(r => (
            <div key={r._id} style={{ display:"flex", alignItems:"center", gap:12, padding:"1rem 1.25rem", background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, marginBottom:8, transition:"border-color .2s", cursor:"default" }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:"#1c2130", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🚗</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500 }}>{r.pickup.name} → {r.destination.name}</div>
                <div style={{ fontSize:12, color:"#8a92a8", marginTop:2 }}>{r.time} · Driver: {r.driver}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
                <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:600, background:`${STATUS_COLOR[r.status]}22`, color:STATUS_COLOR[r.status] }}>{r.status}</span>
                {r.status==="completed" && <span style={{ fontSize:13, fontWeight:600, color:"#00ff99" }}>₹{r.fare}</span>}
                {r.rating && <span style={{ fontSize:12, color:"#ffdd57" }}>{"⭐".repeat(r.rating)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div style={{ position:"fixed", top:70, right:20, background:"#151824", border:`1px solid rgba(255,255,255,0.1)`, borderLeft:`3px solid ${toast.type==="success"?"#00ff99":toast.type==="warn"?"#ffdd57":"#00efff"}`, borderRadius:10, padding:"10px 16px", fontSize:13, display:"flex", alignItems:"center", gap:8, zIndex:9999, color:"#e8eaf0" }}>
          <span>{toast.type==="success"?"✓":"⚠"}</span><span>{toast.msg}</span>
        </div>
      )}
    </PageLayout>
  );
}

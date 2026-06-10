import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "./Authstore";
import { PageLayout } from "./Layout";
import { getSocket } from "./Socket";

const CAMPUSES = ["Main Gate","Library","Academic Block A","Academic Block B",
  "Hostel Zone 1","Hostel Zone 2","Cafeteria","Sports Complex",
  "Admin Block","Medical Center","Research Park","Stadium"];

const STATUS_COLOR = {
  requested:"#ffdd57", accepted:"#00efff",
  inprogress:"#00ff99", completed:"#7b5ea7", cancelled:"#ff4d6d"
};
const STATUS_LABEL = {
  requested:"Searching for driver...", accepted:"Driver on the way",
  inprogress:"Ride in progress", completed:"Completed", cancelled:"Cancelled"
};
const STATUS_PCT = { requested:12, accepted:40, inprogress:70, completed:100, cancelled:0 };

const api = (path, opts = {}) => {
  const token = localStorage.getItem("cr_token");
  return fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    ...opts,
  }).then(r => r.json());
};

export default function PassengerDashboard() {
  const { user } = useAuthStore();
  const [drivers, setDrivers] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ pickup:"", destination:"", isScheduled:false, scheduledAt:"" });
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type="info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [driversRes, ridesRes] = await Promise.all([
        api("/drivers/online"),
        api("/rides?limit=10"),
      ]);
      setDrivers(Array.isArray(driversRes) ? driversRes : []);
      if (ridesRes.rides) {
        const active = ridesRes.rides.find(r =>
          ["requested","accepted","inprogress"].includes(r.status)
        );
        setActiveRide(active || null);
        setHistory(ridesRes.rides.filter(r =>
          ["completed","cancelled"].includes(r.status)
        ));
      }
    } catch (err) {
      console.error("Load error:", err);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Socket.IO real-time events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onAccepted = (ride) => {
      setActiveRide(ride);
      showToast(`🛺 Driver ${ride.driver?.name} accepted your ride!`, "success");
    };
    const onStarted = (ride) => {
      setActiveRide(ride);
      showToast("🚗 Your ride has started!", "info");
    };
    const onCompleted = (ride) => {
      setActiveRide(ride);
      showToast("✅ Ride completed! Please rate your driver.", "success");
    };
    const onCancelled = (ride) => {
      if (String(ride.passenger?._id) === String(user?._id) ||
          String(ride.passenger) === String(user?._id)) {
        setActiveRide(ride);
        showToast("Ride was cancelled", "warn");
      }
    };
    const onDriverStatus = () => {
      api("/drivers/online").then(d => setDrivers(Array.isArray(d) ? d : []));
    };

    socket.on("ride:accepted",  onAccepted);
    socket.on("ride:started",   onStarted);
    socket.on("ride:completed", onCompleted);
    socket.on("ride:cancelled", onCancelled);
    socket.on("driver:status",  onDriverStatus);

    // Join active ride room if exists
    if (activeRide?._id) socket.emit("ride:join", activeRide._id);

    return () => {
      socket.off("ride:accepted",  onAccepted);
      socket.off("ride:started",   onStarted);
      socket.off("ride:completed", onCompleted);
      socket.off("ride:cancelled", onCancelled);
      socket.off("driver:status",  onDriverStatus);
    };
  }, [activeRide?._id, user?._id]);

  const requestRide = async () => {
    if (!form.pickup || !form.destination) { showToast("Enter pickup and destination","warn"); return; }
    if (form.pickup === form.destination) { showToast("Pickup and destination can't be same","warn"); return; }
    setLoading(true);
    try {
      const ride = await api("/rides", {
        method: "POST",
        body: JSON.stringify({
          pickup: { name: form.pickup },
          destination: { name: form.destination },
          isScheduled: form.isScheduled,
          scheduledAt: form.scheduledAt || null,
        }),
      });
      if (ride._id) {
        setActiveRide(ride);
        setForm(f => ({ ...f, pickup:"", destination:"" }));
        showToast("🔍 Ride requested! Waiting for a driver...", "info");
        getSocket()?.emit("ride:join", ride._id);
      } else {
        showToast(ride.message || "Failed to request ride", "error");
      }
    } catch { showToast("Network error", "error"); }
    setLoading(false);
  };

  const cancelRide = async () => {
    if (!activeRide?._id) return;
    try {
      await api(`/rides/${activeRide._id}/cancel`, { method:"PATCH", body: JSON.stringify({ reason:"Cancelled by passenger" }) });
      setActiveRide(r => ({ ...r, status:"cancelled" }));
      showToast("Ride cancelled", "warn");
    } catch { showToast("Failed to cancel","error"); }
  };

  const submitRating = async () => {
    if (!rating) { showToast("Please select stars","warn"); return; }
    try {
      await api(`/rides/${activeRide._id}/rate`, {
        method:"POST",
        body: JSON.stringify({ stars: rating, feedback }),
      });
      showToast(`⭐ ${rating}-star rating submitted!`, "success");
      setActiveRide(null);
      setRating(0);
      setFeedback("");
      loadData();
    } catch (err) { showToast(err.message || "Rating failed","error"); }
  };

  const chipColor = { requested:"#ffdd57", accepted:"#00efff", inprogress:"#00ff99", completed:"#7b5ea7", cancelled:"#ff4d6d" };

  return (
    <PageLayout title="Dashboard">
      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          ["Total Rides", (history.length + (activeRide ? 1 : 0)), "#00efff", "All time"],
          ["Online Drivers", drivers.length, "#00ff99", "Available now"],
          ["My Rating", `${user?.rating || 5.0} ⭐`, "#ffdd57", "Avg rating"],
          ["Active Ride", activeRide ? STATUS_LABEL[activeRide.status] : "None", "#7b5ea7", activeRide ? "In progress" : "Book below"],
        ].map(([label, val, color, sub]) => (
          <div key={label} style={{ background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"1rem 1.25rem" }}>
            <div style={{ fontSize:11, color:"#8a92a8", textTransform:"uppercase", letterSpacing:".8px", marginBottom:8 }}>{label}</div>
            <div style={{ fontSize:activeRide && label==="Active Ride" ? 13 : 26, fontWeight:600, fontFamily:"Space Mono,monospace", color }}>{val}</div>
            <div style={{ fontSize:11, color:"#8a92a8", marginTop:4 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem" }}>
        {/* LEFT */}
        <div>
          {/* Active ride tracker */}
          {activeRide && !["completed","cancelled"].includes(activeRide.status) && (
            <div style={{ background:"#0e1018", border:`1px solid ${STATUS_COLOR[activeRide.status]}44`, borderRadius:14, padding:"1.25rem", marginBottom:"1rem" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px" }}>Active Ride</span>
                <span style={{ padding:"3px 12px", borderRadius:20, fontSize:11, fontWeight:600, background:`${STATUS_COLOR[activeRide.status]}22`, color:STATUS_COLOR[activeRide.status] }}>
                  {STATUS_LABEL[activeRide.status]}
                </span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1rem", fontSize:13 }}>
                <span style={{ color:"#00ff99" }}>📍</span><span>{activeRide.pickup?.name}</span>
                <span style={{ color:"#4a5168" }}>→</span>
                <span style={{ color:"#ff4d6d" }}>📍</span><span>{activeRide.destination?.name}</span>
                <span style={{ marginLeft:"auto", color:"#00ff99", fontWeight:600 }}>₹{activeRide.fare}</span>
              </div>
              <div style={{ height:4, background:"#1c2130", borderRadius:2, overflow:"hidden", marginBottom:".75rem" }}>
                <div style={{ height:"100%", borderRadius:2, background:STATUS_COLOR[activeRide.status], width:`${STATUS_PCT[activeRide.status]}%`, transition:"width 2s ease" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                {["Requested","Accepted","In Progress","Completed"].map((s,i) => {
                  const idx = ["requested","accepted","inprogress","completed"].indexOf(activeRide.status);
                  return <span key={s} style={{ fontSize:11, color:i<=idx ? STATUS_COLOR[["requested","accepted","inprogress","completed"][i]] : "#4a5168" }}>{s}</span>;
                })}
              </div>
              {activeRide.driver && (
                <div style={{ marginTop:"1rem", paddingTop:"1rem", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#00efff22,#00ff9922)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🛺</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:600 }}>{activeRide.driver.name}</div>
                    <div style={{ fontSize:12, color:"#8a92a8" }}>{activeRide.driver.vehicle?.type} · ⭐{activeRide.driver.rating}</div>
                  </div>
                  {activeRide.status === "accepted" && <span style={{ marginLeft:"auto", fontSize:12, color:"#00efff" }}>En route to you</span>}
                </div>
              )}
              {activeRide.status === "requested" && (
                <button onClick={cancelRide} style={{ marginTop:"1rem", padding:"6px 14px", border:"1px solid #ff4d6d", borderRadius:8, background:"transparent", color:"#ff4d6d", fontSize:12, cursor:"pointer" }}>
                  Cancel Ride
                </button>
              )}
            </div>
          )}

          {/* Rating card */}
          {activeRide?.status === "completed" && !activeRide.rating && (
            <div style={{ background:"#0e1018", border:"1px solid rgba(123,94,167,0.4)", borderRadius:14, padding:"1.25rem", marginBottom:"1rem" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"1rem" }}>Rate Your Ride</div>
              <div style={{ display:"flex", gap:10, marginBottom:14 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} onClick={() => setRating(i)} style={{ fontSize:32, cursor:"pointer", transform:i<=rating?"scale(1.2)":"scale(1)", transition:"transform .15s", filter:i<=rating?"none":"grayscale(1)", display:"inline-block" }}>⭐</span>
                ))}
              </div>
              <input value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Optional feedback for the driver..." style={{ width:"100%", padding:"10px 12px", background:"#151824", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"#e8eaf0", fontFamily:"DM Sans,sans-serif", fontSize:14, outline:"none", marginBottom:10, boxSizing:"border-box" }} />
              <button onClick={submitRating} style={{ padding:"8px 20px", background:"#00efff", border:"none", borderRadius:8, color:"#000", fontWeight:700, fontSize:13, cursor:"pointer" }}>Submit Rating</button>
            </div>
          )}

          {/* Book ride form */}
          <div style={{ background:"#0e1018", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"1.25rem" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"1rem" }}>Book a Ride</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#151824", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, marginBottom:6 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:"#00ff99", flexShrink:0 }} />
              <input list="campus-locs" value={form.pickup} onChange={e=>setForm(f=>({...f,pickup:e.target.value}))} placeholder="Pickup location" style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#e8eaf0", fontFamily:"DM Sans,sans-serif", fontSize:14 }} />
            </div>
            <div style={{ width:1, height:16, background:"rgba(255,255,255,0.12)", marginLeft:17, marginBottom:6 }} />
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", background:"#151824", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, marginBottom:"1rem" }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:"#ff4d6d", flexShrink:0 }} />
              <input list="campus-locs" value={form.destination} onChange={e=>setForm(f=>({...f,destination:e.target.value}))} placeholder="Destination" style={{ flex:1, background:"transparent", border:"none", outline:"none", color:"#e8eaf0", fontFamily:"DM Sans,sans-serif", fontSize:14 }} />
            </div>
            <datalist id="campus-locs">{CAMPUSES.map(c=><option key={c} value={c}/>)}</datalist>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"1rem" }}>
              <div onClick={()=>setForm(f=>({...f,isScheduled:!f.isScheduled}))} style={{ position:"relative", width:44, height:24, background:form.isScheduled?"#00ff99":"#1c2130", borderRadius:12, cursor:"pointer", transition:"background .3s", flexShrink:0 }}>
                <div style={{ position:"absolute", width:18, height:18, background:form.isScheduled?"#000":"#8a92a8", borderRadius:"50%", top:3, left:form.isScheduled?23:3, transition:"left .3s" }} />
              </div>
              <span style={{ fontSize:13, color:"#8a92a8" }}>Schedule for later</span>
            </div>
            {form.isScheduled && (
              <input type="datetime-local" value={form.scheduledAt} onChange={e=>setForm(f=>({...f,scheduledAt:e.target.value}))} style={{ width:"100%", padding:"10px 12px", background:"#151824", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"#e8eaf0", fontFamily:"DM Sans,sans-serif", fontSize:13, outline:"none", marginBottom:"1rem", boxSizing:"border-box" }} />
            )}
            <button onClick={requestRide} disabled={loading || (activeRide && ["requested","accepted","inprogress"].includes(activeRide?.status))}
              style={{ width:"100%", padding:12, background: (loading || (activeRide && ["requested","accepted","inprogress"].includes(activeRide?.status))) ? "#1c2130" : "#00efff", border:"none", borderRadius:10, color: (loading || (activeRide && ["requested","accepted","inprogress"].includes(activeRide?.status))) ? "#8a92a8" : "#000", fontWeight:700, fontSize:15, cursor: loading ? "not-allowed" : "pointer", fontFamily:"DM Sans,sans-serif", transition:"all .2s" }}>
              {loading ? "Requesting..." : activeRide && ["requested","accepted","inprogress"].includes(activeRide?.status) ? "Ride in Progress..." : "Request Ride"}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"1rem" }}>
            Available Drivers ({drivers.length})
          </div>
          {drivers.length === 0 && (
            <div style={{ background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"2rem", textAlign:"center", color:"#8a92a8", marginBottom:"1rem" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>🛺</div>
              No drivers online right now
            </div>
          )}
          {drivers.map(d => (
            <div key={d._id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, marginBottom:8 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#00efff22,#00ff9922)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🛺</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:500 }}>{d.name}</div>
                <div style={{ fontSize:12, color:"#8a92a8" }}>{d.vehicle?.type} · ⭐{d.rating?.toFixed(1)}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
                <div style={{ width:9, height:9, borderRadius:"50%", background:"#00ff99" }} />
                <span style={{ fontSize:10, color:"#00ff99" }}>Online</span>
              </div>
            </div>
          ))}

          <div style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px", margin:"1.5rem 0 1rem" }}>Recent Rides</div>
          {history.length === 0 && <div style={{ fontSize:13, color:"#8a92a8" }}>No ride history yet</div>}
          {history.slice(0,5).map(r => (
            <div key={r._id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, marginBottom:8 }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:"#1c2130", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🚗</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{r.pickup?.name} → {r.destination?.name}</div>
                <div style={{ fontSize:12, color:"#8a92a8" }}>{new Date(r.createdAt).toLocaleDateString()} · {r.status==="completed" ? `₹${r.fare}` : "—"}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                <span style={{ padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:600, background:`${STATUS_COLOR[r.status]}22`, color:STATUS_COLOR[r.status] }}>{r.status}</span>
                {r.rating && <span style={{ fontSize:12, color:"#ffdd57" }}>{"⭐".repeat(r.rating)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div style={{ position:"fixed", top:70, right:20, background:"#151824", border:`1px solid rgba(255,255,255,0.1)`, borderLeft:`3px solid ${toast.type==="success"?"#00ff99":toast.type==="warn"?"#ffdd57":toast.type==="error"?"#ff4d6d":"#00efff"}`, borderRadius:10, padding:"12px 18px", fontSize:13, display:"flex", alignItems:"center", gap:8, zIndex:9999, color:"#e8eaf0", maxWidth:320, boxShadow:"0 4px 24px rgba(0,0,0,0.4)", animation:"slideIn .3s ease" }}>
          <span style={{ fontSize:16 }}>{toast.type==="success"?"✓":toast.type==="warn"?"⚠":toast.type==="error"?"✕":"ℹ"}</span>
          <span>{toast.msg}</span>
        </div>
      )}
    </PageLayout>
  );
}

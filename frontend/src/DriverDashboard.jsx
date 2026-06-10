import { useState, useEffect, useCallback } from "react";
import { PageLayout } from "./Layout";
import { getSocket } from "./Socket";
import { useAuthStore } from "./Authstore";

const api = (path, opts = {}) => {
  const token = localStorage.getItem("cr_token");
  return fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    ...opts,
  }).then(r => r.json());
};

export default function DriverDashboard() {
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [stats, setStats] = useState({ total:0, completed:0, todayRides:0, avgRating:"5.0", totalEarnings:0 });
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type="info") => { setToast({msg,type}); setTimeout(()=>setToast(null),4000); };

  const loadData = useCallback(async () => {
    try {
      const [ridesRes, dashRes] = await Promise.all([
        api("/rides/available"),
        user?._id ? api(`/drivers/${user._id}/dashboard`) : Promise.resolve({}),
      ]);
      setRequests(Array.isArray(ridesRes) ? ridesRes : []);
      if (dashRes.total !== undefined) {
        setStats(dashRes);
        setHistory(dashRes.recentRides || []);
      }
      // Check for active ride
      const myRides = await api("/rides?limit=5");
      if (myRides.rides) {
        const active = myRides.rides.find(r => ["accepted","inprogress"].includes(r.status));
        setActiveRide(active || null);
      }
    } catch (err) { console.error(err); }
  }, [user?._id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Real-time socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNewRide = (ride) => {
      if (!isOnline) return;
      setRequests(rs => [ride, ...rs.filter(r => r._id !== ride._id)]);
      showToast(`🔔 New ride request from ${ride.passenger?.name}!`, "warn");
    };
    const onRideCancelled = (ride) => {
      setRequests(rs => rs.filter(r => r._id !== ride._id));
      if (activeRide?._id === ride._id) {
        setActiveRide(null);
        showToast("Passenger cancelled the ride", "warn");
      }
    };

    socket.on("ride:new",       onNewRide);
    socket.on("ride:cancelled", onRideCancelled);
    socket.on("ride:updated",   loadData);

    return () => {
      socket.off("ride:new",       onNewRide);
      socket.off("ride:cancelled", onRideCancelled);
      socket.off("ride:updated",   loadData);
    };
  }, [isOnline, activeRide?._id, loadData]);

  const toggleOnline = async () => {
    const next = !isOnline;
    try {
      await api("/drivers/status", { method:"PATCH", body: JSON.stringify({ isOnline: next }) });
      const socket = getSocket();
      socket?.emit(next ? "driver:goOnline" : "driver:goOffline");
      setIsOnline(next);
      showToast(next ? "✅ You are now Online — ready for rides!" : "⚫ You are now Offline", next ? "success" : "warn");
      if (next) loadData();
    } catch { showToast("Failed to update status","error"); }
  };

  const acceptRide = async (id) => {
    try {
      const ride = await api(`/rides/${id}/accept`, { method:"PATCH" });
      if (ride._id) {
        setRequests(rs => rs.filter(r => r._id !== id));
        setActiveRide(ride);
        getSocket()?.emit("ride:join", ride._id);
        showToast(`✅ Ride accepted! Head to ${ride.pickup?.name}`, "success");
      } else {
        showToast(ride.message || "Could not accept ride","error");
        loadData();
      }
    } catch { showToast("Failed to accept","error"); }
  };

  const rejectRide = (id) => {
    setRequests(rs => rs.filter(r => r._id !== id));
    showToast("Ride rejected","warn");
  };

  const startRide = async () => {
    try {
      const ride = await api(`/rides/${activeRide._id}/start`, { method:"PATCH" });
      setActiveRide(ride);
      showToast("🚗 Ride started!", "success");
    } catch { showToast("Failed to start ride","error"); }
  };

  const completeRide = async () => {
    try {
      const ride = await api(`/rides/${activeRide._id}/complete`, { method:"PATCH" });
      setActiveRide(null);
      showToast(`💰 Ride completed! ₹${ride.fare} earned`, "success");
      loadData();
    } catch { showToast("Failed to complete ride","error"); }
  };

  const STATUS_COLOR = { accepted:"#00efff", inprogress:"#00ff99", completed:"#7b5ea7" };

  return (
    <PageLayout title="Driver Dashboard" isOnline={isOnline} onToggleOnline={toggleOnline} pendingCount={requests.length}>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          ["Total Rides",    stats.total,                    "#00efff", "All time"],
          ["Today's Rides",  stats.todayRides || 0,          "#ffdd57", "Completed today"],
          ["Rating",         `${stats.avgRating} ⭐`,         "#00ff99", "Average"],
          ["Earnings",       `₹${stats.totalEarnings || 0}`, "#7b5ea7", "Total earned"],
        ].map(([label,val,color,sub]) => (
          <div key={label} style={{ background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"1rem 1.25rem" }}>
            <div style={{ fontSize:11, color:"#8a92a8", textTransform:"uppercase", letterSpacing:".8px", marginBottom:8 }}>{label}</div>
            <div style={{ fontSize:24, fontWeight:600, fontFamily:"Space Mono,monospace", color }}>{val}</div>
            <div style={{ fontSize:11, color:"#8a92a8", marginTop:4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Offline warning */}
      {!isOnline && (
        <div style={{ background:"rgba(255,221,87,0.08)", border:"1px solid rgba(255,221,87,0.25)", borderRadius:12, padding:"1rem 1.25rem", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:24 }}>⚠️</span>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:"#ffdd57" }}>You're Offline</div>
            <div style={{ fontSize:12, color:"#8a92a8", marginTop:2 }}>Toggle the status switch in the header to go online and receive ride requests</div>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:"1rem" }}>
        <div>
          {/* Active ride */}
          {activeRide && (
            <div style={{ background:"#0e1018", border:`1px solid ${STATUS_COLOR[activeRide.status]}44`, borderRadius:14, padding:"1.25rem", marginBottom:"1.5rem" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px" }}>Active Ride</span>
                <span style={{ padding:"3px 12px", borderRadius:20, fontSize:11, fontWeight:600, background:`${STATUS_COLOR[activeRide.status]}22`, color:STATUS_COLOR[activeRide.status] }}>
                  {activeRide.status === "accepted" ? "Heading to Pickup" : "In Progress"}
                </span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:"#1c2130", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🎓</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{activeRide.passenger?.name}</div>
                  <div style={{ fontSize:12, color:"#8a92a8" }}>📍 {activeRide.pickup?.name} → {activeRide.destination?.name}</div>
                </div>
                <div style={{ fontSize:18, fontWeight:700, color:"#00ff99" }}>₹{activeRide.fare}</div>
              </div>
              <div style={{ height:4, background:"#1c2130", borderRadius:2, overflow:"hidden", marginBottom:"1rem" }}>
                <div style={{ height:"100%", borderRadius:2, background:STATUS_COLOR[activeRide.status], width:activeRide.status==="accepted"?"40%":"75%", transition:"width 1s" }} />
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {activeRide.status === "accepted" && (
                  <button onClick={startRide} style={{ flex:1, padding:"10px", background:"#00efff", border:"none", borderRadius:10, color:"#000", fontWeight:700, fontSize:14, cursor:"pointer" }}>Start Ride 🚗</button>
                )}
                {activeRide.status === "inprogress" && (
                  <button onClick={completeRide} style={{ flex:1, padding:"10px", background:"#00ff99", border:"none", borderRadius:10, color:"#000", fontWeight:700, fontSize:14, cursor:"pointer" }}>Complete Ride ✅</button>
                )}
              </div>
            </div>
          )}

          {/* Incoming requests */}
          <div style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"1rem" }}>
            Incoming Requests
            {requests.length > 0 && <span style={{ background:"rgba(255,77,109,0.2)", color:"#ff4d6d", padding:"2px 8px", borderRadius:10, fontSize:11, marginLeft:8 }}>{requests.length}</span>}
          </div>
          {requests.length === 0 && (
            <div style={{ background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"2rem", textAlign:"center", color:"#8a92a8", marginBottom:"1rem" }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🛺</div>
              {isOnline ? "Waiting for ride requests..." : "Go online to receive requests"}
            </div>
          )}
          {requests.map(r => (
            <div key={r._id} style={{ display:"flex", alignItems:"center", gap:12, padding:"1rem 1.25rem", background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, marginBottom:10, animation:"fadeIn .3s ease" }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"#1c2130", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🎓</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{r.passenger?.name}</div>
                <div style={{ fontSize:12, color:"#8a92a8", marginTop:2 }}>📍 {r.pickup?.name} → {r.destination?.name}</div>
                <div style={{ fontSize:11, color:"#4a5168", marginTop:2 }}>
                  {new Date(r.createdAt).toLocaleTimeString()} · ₹{r.fare} · {r.distance?.toFixed(1)}km
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <button onClick={() => acceptRide(r._id)} disabled={!!activeRide}
                  style={{ padding:"6px 16px", border:"1px solid #00ff99", borderRadius:8, background:activeRide?"transparent":"rgba(0,255,153,0.1)", color:activeRide?"#4a5168":"#00ff99", fontSize:12, cursor:activeRide?"not-allowed":"pointer" }}>
                  Accept
                </button>
                <button onClick={() => rejectRide(r._id)}
                  style={{ padding:"6px 16px", border:"1px solid #ff4d6d", borderRadius:8, background:"transparent", color:"#ff4d6d", fontSize:12, cursor:"pointer" }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right col */}
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"1rem" }}>Recent Rides</div>
          {history.length === 0 && <div style={{ fontSize:13, color:"#8a92a8", marginBottom:"1.5rem" }}>No rides yet</div>}
          {history.slice(0,5).map(r => (
            <div key={r._id} style={{ background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 14px", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                <span style={{ fontWeight:500 }}>{r.passenger?.name || "Passenger"}</span>
                <span style={{ color:"#00ff99", fontWeight:600 }}>₹{r.fare}</span>
              </div>
              <div style={{ fontSize:12, color:"#8a92a8" }}>{r.pickup?.name} → {r.destination?.name}</div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span style={{ fontSize:11, color:"#4a5168" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                {r.rating && <span style={{ fontSize:12, color:"#ffdd57" }}>{"⭐".repeat(r.rating)}</span>}
              </div>
            </div>
          ))}

          <div style={{ fontSize:13, fontWeight:600, color:"#8a92a8", textTransform:"uppercase", letterSpacing:"1.5px", margin:"1.5rem 0 1rem" }}>Live Activity</div>
          <div style={{ background:"#151824", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"1rem" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:isOnline?"#00ff99":"#666", animation:isOnline?"pulseDot 2s infinite":"none" }} />
              <span style={{ fontSize:13, color:isOnline?"#00ff99":"#666" }}>{isOnline?"Online & Ready":"Offline"}</span>
            </div>
            <div style={{ fontSize:12, color:"#8a92a8" }}>Pending requests: <span style={{ color:"#ffdd57", fontWeight:600 }}>{requests.length}</span></div>
            <div style={{ fontSize:12, color:"#8a92a8", marginTop:4 }}>Active ride: <span style={{ color:activeRide?"#00efff":"#4a5168", fontWeight:600 }}>{activeRide ? "Yes" : "None"}</span></div>
          </div>
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


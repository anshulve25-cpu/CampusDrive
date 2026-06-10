import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./Authstore";

const NAV = [
  { path: "/dashboard", icon: "🏠", label: "Dashboard" },
  { path: "/rides",     icon: "🚗", label: "Rides" },
  { path: "/map",       icon: "🗺️", label: "Map" },
  { path: "/analytics", icon: "📊", label: "Analytics" },
  { path: "/profile",   icon: "👤", label: "Profile" },
];

export function Sidebar({ pendingCount = 0 }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside style={{
      width: 72, background: "#0e1018",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column",
      alignItems: "center", padding: "1rem 0", gap: 6, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        width: 40, height: 40,
        background: "linear-gradient(135deg,#00efff,#00ff99)",
        borderRadius: 10, display: "flex", alignItems: "center",
        justifyContent: "center", fontFamily: "Space Mono,monospace",
        fontWeight: 700, fontSize: 13, color: "#000", marginBottom: "1rem",
        cursor: "pointer",
      }} onClick={() => navigate("/dashboard")}>CR</div>

      {/* Nav items */}
      {NAV.map((n) => {
        const active = location.pathname === n.path;
        return (
          <button key={n.path} title={n.label} onClick={() => navigate(n.path)}
            style={{
              width: 44, height: 44, borderRadius: 10, border: "none",
              background: active ? "#151824" : "transparent",
              color: active ? "#00efff" : "#8a92a8",
              cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .2s", position: "relative",
            }}>
            {n.icon}
            {n.label === "Rides" && pendingCount > 0 && (
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, background: "#ff4d6d",
                borderRadius: "50%", border: "2px solid #0e1018",
              }} />
            )}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />
      <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.07)", margin: "4px 0" }} />

      {/* Logout */}
      <button title="Sign Out" onClick={handleLogout}
        style={{
          width: 44, height: 44, borderRadius: 10, border: "none",
          background: "transparent", color: "#8a92a8",
          cursor: "pointer", fontSize: 18,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
        }}>⏻</button>
    </aside>
  );
}

export function PageLayout({ title, children, isOnline, onToggleOnline, pendingCount = 0 }) {
  const { user } = useAuthStore();
  const isDriver = user?.role === "driver";

  return (
    <div style={{ display: "flex", height: "100vh", background: "#08090d", fontFamily: "DM Sans,sans-serif", color: "#e8eaf0", overflow: "hidden" }}>
      <Sidebar pendingCount={pendingCount} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{
          height: 56, background: "#0e1018",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center",
          padding: "0 1.5rem", gap: "1rem", flexShrink: 0,
        }}>
          <span style={{ fontFamily: "Space Mono,monospace", fontSize: 13, color: "#8a92a8", textTransform: "uppercase", letterSpacing: 2 }}>{title}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#8a92a8" }}>
            <div style={{ width: 7, height: 7, background: "#00ff99", borderRadius: "50%", animation: "pulseDot 2s infinite" }} />
            Live
          </div>

          {/* Driver online toggle */}
          {isDriver && onToggleOnline && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "0.5rem" }}>
              <span style={{ fontSize: 12, color: "#8a92a8" }}>Status:</span>
              <div onClick={onToggleOnline} style={{
                position: "relative", width: 44, height: 24,
                background: isOnline ? "#00ff99" : "#1c2130",
                borderRadius: 12, cursor: "pointer", transition: "background .3s",
              }}>
                <div style={{
                  position: "absolute", width: 18, height: 18,
                  background: isOnline ? "#000" : "#8a92a8",
                  borderRadius: "50%", top: 3,
                  left: isOnline ? 23 : 3, transition: "left .3s",
                }} />
              </div>
              <span style={{ fontSize: 12, color: isOnline ? "#00ff99" : "#8a92a8" }}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          )}

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#8a92a8" }}>
              {isDriver ? "🛺" : "🎓"} {user?.name}
            </span>
            <span style={{
              padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              background: isDriver ? "rgba(0,255,153,0.12)" : "rgba(0,239,255,0.12)",
              color: isDriver ? "#00ff99" : "#00efff",
            }}>{isDriver ? "Driver" : "Passenger"}</span>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.3)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

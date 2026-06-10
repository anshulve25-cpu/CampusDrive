import React from "react";
import { PageLayout } from "./Layout"; // Correct named import extraction
import { useAuthStore } from "./Authstore";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const profileUser = user || { name: "Campus User", email: "user@iitr.ac.id", role: "passenger" };
  const isDriver = profileUser.role === "driver";

  return (
    <PageLayout title="My Account Profile">
      <div style={{ maxWidth: 600, margin: "0 auto", background: "#0e1018", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, overflow: "hidden", animation: "fadeIn .4s ease" }}>
        
        {/* Banner */}
        <div style={{ height: 100, background: "linear-gradient(135deg, #1d4ed8, #4338ca)", position: "relative" }}>
          <div style={{ position: "absolute", bottom: -24, left: 24, width: 56, height: 56, background: "#08090d", border: "2px solid #0e1018", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#00efff" }}>
            {profileUser.name.charAt(0)}
          </div>
        </div>

        {/* Profile Content Body */}
        <div style={{ padding: "2.5rem 1.5rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#e8eaf0" }}>{profileUser.name}</h2>
            <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#8a92a8", fontFamily: "monospace" }}>System Identifier Node ID: #783921</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", background: "#08090d", padding: "1rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "#8a92a8" }}>Authorized Contact Node:</span>
              <span style={{ color: "#ccc", fontFamily: "monospace" }}>{profileUser.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingTop: "0.25rem" }}>
              <span style={{ color: "#8a92a8" }}>Assigned Environment Context:</span>
              <span style={{ color: "#ccc" }}>IIT Roorkee Campus Area</span>
            </div>
          </div>

          {/* Conditional Driver Badge Segment */}
          {isDriver && (
            <div style={{ background: "rgba(0, 255, 153, 0.03)", border: "1px solid rgba(0, 255, 153, 0.1)", padding: "1rem", borderRadius: 10, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h4 style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#00ff99", uppercase: "true", letterSpacing: 1 }}>Fleet Assets & Credentials</h4>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#8a92a8" }}>E-Rickshaw Plate ID:</span>
                <span style={{ color: "#e8eaf0", fontFamily: "monospace", fontWeight: 500 }}>UK-08-ER-5921</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#8a92a8" }}>Validation Status:</span>
                <span style={{ color: "#00ff99", fontWeight: 600 }}>Active Dispatch Badge</span>
              </div>
            </div>
          )}

          <button 
            onClick={() => alert("Session parameters successfully verified in local browser cache.")}
            style={{ width: "100%", background: "#151824", border: "1px solid rgba(255,255,255,0.08)", color: "#00efff", fontSize: 12, fontWeight: 600, padding: "0.6rem", borderRadius: 8, cursor: "pointer", transition: "all .2s" }}
          >
            Acknowledge Configuration Metrics
          </button>
        </div>

      </div>
    </PageLayout>
  );
}
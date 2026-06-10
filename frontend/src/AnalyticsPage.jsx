import React, { useState } from "react";
import { PageLayout } from "./Layout"; // Correct named import extraction

export default function AnalyticsPage() {
  const [forecastModel, setForecastModel] = useState("Linear Regression Models");

  const stats = [
    { label: "Peak Demand Window", value: "5:00 PM - 7:30 PM", change: "Main Building to Hostels" },
    { label: "Top Pickup Hotspot", value: "IITR Main Gate", change: "42% of total daily requests" },
    { label: "Avg. Driver Utilization", value: "84.2%", change: "+5.3% optimization spike" },
    { label: "Daily Active E-Rickshaws", value: "28 Drivers", change: "Sufficient network capacity" },
  ];

  const hotspots = [
    { rank: 1, location: "Main Lecture Complex (LHC)", requests: 142, status: "High Demand", bg: "rgba(255, 77, 109, 0.1)", color: "#ff4d6d" },
    { rank: 2, location: "Rajiv Bhawan / Cautley Bhawan", requests: 98, status: "Surging", bg: "rgba(255, 186, 8, 0.1)", color: "#ffba08" },
    { rank: 3, location: "Macaronis / Nescafe Junction", requests: 74, status: "Stable", bg: "rgba(0, 255, 153, 0.1)", color: "#00ff99" },
    { rank: 4, location: "Radhakrishnan Sports Complex", requests: 31, status: "Low Demand", bg: "rgba(138, 146, 168, 0.1)", color: "#8a92a8" },
  ];

  return (
    <PageLayout title="Analytics & Forecasts">
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", animation: "fadeIn .4s ease" }}>
        
        {/* Metric Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ background: "#0e1018", border: "1px solid rgba(255,255,255,0.05)", padding: "1.25rem", borderRadius: 12 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#8a92a8", fontWeight: 500 }}>{stat.label}</p>
              <p style={{ margin: "0.5rem 0 0 0", fontSize: 20, fontStyle: "normal", fontWeight: 700, color: "#00efff" }}>{stat.value}</p>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: 11, color: "#505870" }}>{stat.change}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          
          {/* Traffic Distribution List */}
          <div style={{ background: "#0e1018", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: 12 }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: 15, fontWeight: 600, color: "#e8eaf0" }}>Campus Traffic Hotspots</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {hotspots.map((place) => (
                <div key={place.rank} style={{ display: "flex", alignItems: "center", justifyContent: "between", padding: "0.75rem", background: "#08090d", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 10, gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                    <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,239,255,0.08)", color: "#00efff", fontSize: 11, fontWeight: 700, borderRadius: "50%" }}>
                      {place.rank}
                    </span>
                    <span style={{ fontSize: 13, color: "#ccc" }}>{place.location}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: 12, color: "#8a92a8", fontFamily: "monospace" }}>{place.requests} trips</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: place.bg, color: place.color }}>
                      {place.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Machine Learning Forecasting Box */}
          <div style={{ background: "#0e1018", border: "1px solid rgba(255,255,255,0.05)", padding: "1.5rem", borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "between", gap: "1rem" }}>
            <div>
              <h3 style={{ margin: "0 0 0.25rem 0", fontSize: 15, fontWeight: 600, color: "#e8eaf0" }}>Predictive Demand ML Engine</h3>
              <p style={{ margin: "0 0 1rem 0", fontSize: 12, color: "#8a92a8" }}>Run time-series modeling to compute optimal vehicle dispatching states.</p>
              
              <label style={{ display: "block", fontSize: 11, color: "#8a92a8", marginBottom: 6, fontWeight: 500 }}>Target Predictive Matrix</label>
              <select 
                value={forecastModel} 
                onChange={(e) => setForecastModel(e.target.value)}
                style={{ width: "100%", background: "#08090d", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.5rem", color: "#e8eaf0", fontSize: 13, outline: "none" }}
              >
                <option>Linear Regression Models</option>
                <option>Decision Tree Ensembles</option>
                <option>Time-Series Hotspot Engine</option>
              </select>

              <div style={{ marginTop: "1rem", padding: "0.85rem", background: "#08090d", borderRadius: 8, display: "flex", flexDirection: "column", gap: "0.5rem", border: "1px solid rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#8a92a8" }}>Framework State:</span>
                  <span style={{ color: "#00ff99", fontWeight: 700 }}>Optimized</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#8a92a8" }}>Prediction R² Score:</span>
                  <span style={{ color: "#00efff", fontFamily: "monospace" }}>0.892</span>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(0,239,255,0.04)", border: "1px solid rgba(0,239,255,0.1)", p: "0.75rem", borderRadius: 8, padding: "0.75rem", fontSize: 12, color: "#00efff", lineHeight: 1.4 }}>
              🤖 <b>ML Insight:</b> High request overhead imminent near <b>Main Lecture Complex</b> within 30 minutes due to class shift cycles.
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}
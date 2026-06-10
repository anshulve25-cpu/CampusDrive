import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./Authstore";

export default function Authpage() {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("passenger");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    vehicleType: "E-Rickshaw",
    licenseNumber: "",
  });
  const [error, setError] = useState("");

  const { login, register, loading } = useAuthStore();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }
    if (tab === "register" && !form.name) {
      setError("Name is required");
      return;
    }

    let res;
    if (tab === "login") {
      res = await login(form.email, form.password, role);
    } else {
      res = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        vehicle:
          role === "driver"
            ? { type: form.vehicleType, licenseNumber: form.licenseNumber }
            : undefined,
      });
    }

    if (res.ok) {
      navigate("/dashboard"); // ← THIS is what was missing
    } else {
      setError(res.msg || "Something went wrong");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#08090d",
        padding: "2rem",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div
        style={{
          background: "#0e1018",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "2.5rem",
          width: "100%",
          maxWidth: 440,
          color: "#e8eaf0",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
          <div
            style={{
              width: 44,height: 44,
              background: "linear-gradient(135deg,#00efff,#00ff99)",
              borderRadius: 12,display: "flex",alignItems: "center",
              justifyContent: "center",fontFamily: "Space Mono, monospace",
              fontWeight: 700,fontSize: 16,color: "#000",
            }}
          >
            CR
          </div>
          <div>
            <div style={{ fontFamily: "Space Mono, monospace", fontSize: 20, fontWeight: 700 }}>
              CampusRide
            </div>
            <div style={{ fontSize: 12, color: "#8a92a8" }}>IIT Roorkee Mobility Platform</div>
          </div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
          {tab === "login" ? "Welcome back" : "Create account"}
        </h2>
        <p style={{ fontSize: 14, color: "#8a92a8", marginBottom: "1.5rem" }}>
          {tab === "login" ? "Sign in to continue" : "Join the campus ride network"}
        </p>

        {/* Sign In / Register tabs */}
        <div
          style={{
            display: "flex",background: "#151824",borderRadius: 10,
            padding: 4,marginBottom: "1.25rem",gap: 4,
          }}
        >
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,padding: 8,borderRadius: 7,border: "none",
                background: tab === t ? "#1c2130" : "transparent",
                color: tab === t ? "#e8eaf0" : "#8a92a8",
                fontFamily: "DM Sans, sans-serif",fontSize: 13,
                cursor: "pointer",fontWeight: tab === t ? 500 : 400,transition: "all .2s",
              }}
            >
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* Passenger / Driver toggle */}
        <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
          {[
            ["passenger", "🎓", "Passenger"],
            ["driver", "🛺", "Driver"],
          ].map(([r, emoji, label]) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              style={{
                flex: 1,padding: 10,
                border: `1px solid ${role === r ? "#00efff" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 10,
                background: role === r ? "rgba(0,239,255,0.06)" : "transparent",
                color: role === r ? "#00efff" : "#8a92a8",
                fontFamily: "DM Sans, sans-serif",fontSize: 13,cursor: "pointer",
                display: "flex",flexDirection: "column",alignItems: "center",
                gap: 4,transition: "all .2s",
              }}
            >
              <span style={{ fontSize: 24 }}>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Name (register only) */}
        {tab === "register" && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: 12, color: "#8a92a8", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 500 }}>
              Full Name
            </label>
            <input
              style={{ width: "100%", padding: "10px 12px", background: "#151824", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e8eaf0", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none" }}
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: 12, color: "#8a92a8", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            style={{ width: "100%", padding: "10px 12px", background: "#151824", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e8eaf0", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none" }}
            placeholder={role === "passenger" ? "student@iitr.ac.in" : "driver@campusride.in"}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", fontSize: 12, color: "#8a92a8", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 500 }}>
            Password
          </label>
          <input
            type="password"
            style={{ width: "100%", padding: "10px 12px", background: "#151824", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e8eaf0", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none" }}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        {/* Driver-only fields */}
        {tab === "register" && role === "driver" && (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: 12, color: "#8a92a8", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 500 }}>
                Vehicle Type
              </label>
              <select
                style={{ width: "100%", padding: "10px 12px", background: "#151824", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e8eaf0", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none" }}
                value={form.vehicleType}
                onChange={(e) => set("vehicleType", e.target.value)}
              >
                {["E-Rickshaw", "Golf Cart", "Mini Bus", "Auto"].map((v) => (
                  <option key={v} value={v} style={{ background: "#151824" }}>{v}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: 12, color: "#8a92a8", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 500 }}>
                License / Vehicle ID
              </label>
              <input
                style={{ width: "100%", padding: "10px 12px", background: "#151824", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#e8eaf0", fontFamily: "DM Sans, sans-serif", fontSize: 14, outline: "none" }}
                placeholder="UP32AB1234"
                value={form.licenseNumber}
                onChange={(e) => set("licenseNumber", e.target.value)}
              />
            </div>
          </>
        )}

        {/* Error message */}
        {error && (
          <div style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#ff4d6d", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",padding: 12,fontSize: 15,borderRadius: 10,border: "none",
            background: loading ? "#007a85" : "#00efff",color: "#000",fontWeight: 700,
            fontFamily: "DM Sans, sans-serif",cursor: loading ? "not-allowed" : "pointer",
            transition: "background .2s",marginTop: ".5rem",
          }}
        >
          {loading
            ? "Please wait..."
            : `${tab === "login" ? "Sign In" : "Register"} as ${role === "passenger" ? "Passenger" : "Driver"}`}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "#8a92a8", marginTop: "1rem" }}>
          {tab === "login" ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => setTab(tab === "login" ? "register" : "login")}
            style={{ color: "#00efff", cursor: "pointer" }}
          >
            {tab === "login" ? "Register" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
}

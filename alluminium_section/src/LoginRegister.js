import React, { useState } from "react";

const API_BASE = "http://localhost:5000/api/auth"; // Update if your backend runs elsewhere

export default function LoginRegister({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { email, password }
            : { name, email, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data.message || "Authentication failed");
        setLoading(false);
        return;
      }
      // Save token/user
      localStorage.setItem("windowcalc_user", JSON.stringify(data.user));
      localStorage.setItem("windowcalc_token", data.token);
      onAuth(data.user);
    } catch (error) {
      setErr("Server error");
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{mode === "login" ? "Login" : "Register"}</h2>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          autoComplete="username"
          onChange={e => setEmail(e.target.value)}
        />
        {mode === "register" && (
          <input
            type="text"
            required
            placeholder="Name"
            value={name}
            autoComplete="name"
            onChange={e => setName(e.target.value)}
          />
        )}
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : (mode === "login" ? "Login" : "Register")}
        </button>
        <div className="switch-link">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <a href="#" onClick={e => { e.preventDefault(); setMode("register"); }}>
                Register
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a href="#" onClick={e => { e.preventDefault(); setMode("login"); }}>
                Login
              </a>
            </>
          )}
        </div>
        {err && <div className="msg error">{err}</div>}
      </form>
    </div>
  );
}
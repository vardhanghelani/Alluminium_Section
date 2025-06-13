import React, { useState } from "react";

export default function AuthForm({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("Please wait...");
    const endpoint = mode === "login"
      ? "http://localhost:5000/api/login"
      : "http://localhost:5000/api/register";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        if (mode === "login") {
          setMsg("Login successful!");
          localStorage.setItem("windowcalc_user", JSON.stringify({ email }));
          onAuthSuccess({ email });
        } else {
          setMsg("Registration successful! You can now log in.");
          setMode("login");
        }
      } else {
        setMsg(data.message || "Something went wrong");
      }
    } catch (err) {
      setMsg("Network error. Please try again.");
    }
  }

  return (
    <div className="authModal active" id="authModal">
      <div>
        <h2>{mode === "login" ? "Login" : "Register"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
        </form>
        <div className="msg error">{msg}</div>
        <div className="switch-link">
          {mode === "login" ? (
            <span>
              Don&apos;t have an account?{" "}
              <a href="#" onClick={e => {e.preventDefault(); setMode("register"); setMsg("");}}>Register</a>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <a href="#" onClick={e => {e.preventDefault(); setMode("login"); setMsg("");}}>Login</a>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
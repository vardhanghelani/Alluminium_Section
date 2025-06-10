import React, { useState, useEffect } from "react";
import "./App.css";

const defaultRates = {
  powderCoatingRate: 60,
  laborRate: 50,
  clampPrice: 20,
  clearGlassRate: 45,
  reflectiveGlassRate: 75,
  rubberRate: 8,
  lockPrice: 200,
  bearingPrice: 45,
  woolFileRate: 2,
  otherChargesRate: 5,
};

// Default initial profiles
const defaultOuterProfiles = [
  { type: "1.1mm", thickness: 1.1, weight: 0.206, rate: 325 },
  { type: "1.2mm", thickness: 1.2, weight: 0.228, rate: 335 },
];
const defaultInnerProfiles = [
  { type: "1.1mm", thickness: 1.1, weight: 0.187, rate: 325 },
  { type: "1.2mm", thickness: 1.2, weight: 0.208, rate: 335 },
];
const defaultClampProfiles = [
  { type: "1.1mm", thickness: 1.1, weight: 0.17, rate: 320 },
  { type: "1.2mm", thickness: 1.2, weight: 0.184, rate: 330 },
];

function convertToFeet(value, unit) {
  return unit === "inches" ? value / 12 : value;
}

function calculateWindowCost(
  width,
  height,
  tracks,
  glassType,
  rates,
  outerProfile,
  innerProfile,
  clampProfile
) {
  const area = width * height;
  const outerPerimeter = 2 * (width + height);
  const outerWeight = outerPerimeter * outerProfile.weight;
  const innerWeight = tracks * 3 * height * innerProfile.weight;
  const clampingWeight = height * 2 * clampProfile.weight;
  const totalWeight = outerWeight + innerWeight + clampingWeight;

  const costs = {
    outerFrame: outerWeight * outerProfile.rate,
    innerFrame: innerWeight * innerProfile.rate,
    clampingLock: clampingWeight * clampProfile.rate,
    outerClamps: 4 * rates.clampPrice,
    innerClamps: tracks * 4 * 2 * rates.clampPrice,
    powderCoating: totalWeight * rates.powderCoatingRate,
    glass:
      area *
      (glassType === "clear"
        ? rates.clearGlassRate
        : rates.reflectiveGlassRate),
    labor: area * rates.laborRate,
    rubber: tracks * 3 * height * rates.rubberRate,
    lock: rates.lockPrice,
    bearings: tracks * 2 * rates.bearingPrice,
    woolFile:
      (outerPerimeter + 2 * width + 2 * height + tracks * 2 * height) *
      rates.woolFileRate,
    otherCharges: area * rates.otherChargesRate,
  };
  const totalCost = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

  return {
    area,
    outerWeight,
    innerWeight,
    clampingWeight,
    totalWeight,
    costs,
    totalCost,
  };
}

function App() {
  // Profile state
  const [outerProfiles, setOuterProfiles] = useState([...defaultOuterProfiles]);
  const [innerProfiles, setInnerProfiles] = useState([...defaultInnerProfiles]);
  const [clampProfiles, setClampProfiles] = useState([...defaultClampProfiles]);

  // Rates (non-profile)
  const [rates, setRates] = useState(defaultRates);

  // Windows (each with selected profile indices)
  const [windows, setWindows] = useState({});
  const [windowCounter, setWindowCounter] = useState(1);

  // Auth/Modal
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authType, setAuthType] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [otp, setOtp] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [msg, setMsg] = useState("");
  const [otpMsg, setOtpMsg] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [otpEmail, setOtpEmail] = useState("");

  // Navbar mobile toggle
  const [menuOpen, setMenuOpen] = useState(false);

  // --- Auth logic ---
  useEffect(() => {
    const stored = localStorage.getItem("windowcalc_user");
    if (stored) setUser(JSON.parse(stored));
    else setShowAuth(true);
  }, []);
  useEffect(() => {
    if (Object.keys(windows).length === 0) handleAddWindow();
    // eslint-disable-next-line
  }, []);

  // --- Profile logic ---
  function handleProfileChange(type, idx, field, value) {
    const setter =
      type === "outer"
        ? setOuterProfiles
        : type === "inner"
        ? setInnerProfiles
        : setClampProfiles;
    const prev =
      type === "outer"
        ? outerProfiles
        : type === "inner"
        ? innerProfiles
        : clampProfiles;
    setter(
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  }
  function handleProfileDelete(type, idx) {
    const setter =
      type === "outer"
        ? setOuterProfiles
        : type === "inner"
        ? setInnerProfiles
        : setClampProfiles;
    const prev =
      type === "outer"
        ? outerProfiles
        : type === "inner"
        ? innerProfiles
        : clampProfiles;
    setter(prev.filter((_, i) => i !== idx));
    // Reassign windows' profile indices if needed
    setWindows((wins) => {
      const newWins = { ...wins };
      Object.keys(newWins).forEach((wid) => {
        const f =
          type === "outer"
            ? "outerProfileIdx"
            : type === "inner"
            ? "innerProfileIdx"
            : "clampProfileIdx";
        if (newWins[wid][f] === idx) newWins[wid][f] = 0;
        else if (newWins[wid][f] > idx) newWins[wid][f] -= 1;
      });
      return newWins;
    });
  }
  function handleProfileAdd(type) {
    const setter =
      type === "outer"
        ? setOuterProfiles
        : type === "inner"
        ? setInnerProfiles
        : setClampProfiles;
    setter((prev) => [
      ...prev,
      { type: "", thickness: "", weight: "", rate: "" },
    ]);
  }

  // --- Window logic ---
  function handleAddWindow() {
    setWindows((wins) => {
      const idx = Object.keys(wins).length + 1;
      const id = `window_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      return {
        ...wins,
        [id]: {
          width: 4,
          height: 4,
          unit: "feet",
          tracks: 2,
          glassType: "clear",
          idx,
          outerProfileIdx: 0,
          innerProfileIdx: 0,
          clampProfileIdx: 0,
        },
      };
    });
    setWindowCounter((c) => c + 1);
  }
  function handleRemoveWindow(id) {
    setWindows((wins) => {
      const copy = { ...wins };
      delete copy[id];
      return copy;
    });
  }
  function handleUpdateWindow(id, field, value) {
    setWindows((wins) => {
      const win = { ...wins[id], [field]: value };
      return { ...wins, [id]: win };
    });
  }
  function handleChangeProfile(id, field, idx) {
    setWindows((wins) => ({
      ...wins,
      [id]: { ...wins[id], [field]: idx },
    }));
  }

  // --- Auth Modal Handlers (unchanged) ---
  function isValidGmail(email) {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  }
  function handleShowAuth(type = "login") {
    setShowAuth(true);
    setAuthType(type);
  }
  function handleAuthSuccess() {
    const stored = localStorage.getItem("windowcalc_user");
    setUser(stored ? JSON.parse(stored) : null);
    setShowAuth(false);
  }
  function handleLogout() {
    localStorage.removeItem("windowcalc_user");
    setUser(null);
    setShowAuth(true);
    setAuthType("login");
  }
  function handleSendOtp(type) {
    let email = "",
      name = "";
    if (type === "login") {
      email = loginEmail.trim();
      if (!isValidGmail(email)) {
        setMsg("Please enter a valid Gmail address.");
        return;
      }
    } else {
      email = signupEmail.trim();
      name = signupName.trim();
      if (!isValidGmail(email)) {
        setMsg("Please enter a valid Gmail address.");
        return;
      }
      if (!name) {
        setMsg("Please enter your name.");
        return;
      }
    }
    setOtpMode(true);
    setOtpEmail(email);
    setOtpMessage("Sending OTP...");
    setTimeout(() => {
      setOtpMessage(`A 6-digit OTP has been sent to ${email}.`);
      setOtp("");
      setOtpMsg("");
    }, 700);
  }
  function handleResendOtp() {
    setOtpMessage("Resending OTP...");
    setTimeout(() => {
      setOtpMessage(`A new OTP has been sent to ${otpEmail}.`);
    }, 600);
  }
  function handleVerifyOtp() {
    if (!otp.match(/^\d{6}$/)) {
      setOtpMsg("Please enter a valid 6-digit OTP.");
      return;
    }
    setOtpMsg("Verifying...");
    setTimeout(() => {
      const userObj =
        authType === "signup"
          ? { email: otpEmail, name: signupName }
          : { email: otpEmail, name: otpEmail.split("@")[0] };
      localStorage.setItem("windowcalc_user", JSON.stringify(userObj));
      setOtpMode(false);
      setOtpMsg("");
      setOtpMessage("");
      handleAuthSuccess();
    }, 900);
  }
  function handleSwitchAuth(type) {
    setAuthType(type);
    setOtpMode(false);
    setMsg("");
    setOtp("");
    setOtpMsg("");
    setOtpMessage("");
  }

  // --- Rates recalculation on change
  useEffect(() => {
    // Just force re-render for windows (costs recalculated in render phase below)
    setWindows((wins) => ({ ...wins }));
    // eslint-disable-next-line
  }, [rates, outerProfiles, innerProfiles, clampProfiles]);

  // --- Aggregation
  let totalWindows = 0,
    totalArea = 0,
    outerFrameWeight = 0,
    innerFrameWeight = 0,
    totalWeight = 0,
    grandTotal = 0;
  const aggregatedCosts = {};
  Object.values(windows).forEach((win) => {
    const widthFt = convertToFeet(win.width, win.unit);
    const heightFt = convertToFeet(win.height, win.unit);
    const outProf = outerProfiles[win.outerProfileIdx] || outerProfiles[0];
    const inProf = innerProfiles[win.innerProfileIdx] || innerProfiles[0];
    const clampProf = clampProfiles[win.clampProfileIdx] || clampProfiles[0];
    const summary = calculateWindowCost(
      Number(widthFt),
      Number(heightFt),
      Number(win.tracks),
      win.glassType,
      rates,
      outProf,
      inProf,
      clampProf
    );
    win._summary = summary;
    totalWindows++;
    totalArea += summary.area;
    outerFrameWeight += summary.outerWeight;
    innerFrameWeight += summary.innerWeight;
    totalWeight += summary.totalWeight;
    grandTotal += summary.totalCost;
    Object.keys(summary.costs).forEach((costType) => {
      if (!aggregatedCosts[costType]) aggregatedCosts[costType] = 0;
      aggregatedCosts[costType] += summary.costs[costType];
    });
  });
  const avgCostPerSqFt =
    totalArea > 0 ? (grandTotal / totalArea).toFixed(2) : "0.00";
  const avgCostPerWindow =
    totalWindows > 0 ? (grandTotal / totalWindows).toFixed(2) : "0.00";

  // --- Render ---
  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <a href="#" className="brand">
          MultiTrackCalc
        </a>
        <div className={`nav${menuOpen ? " open" : ""}`} id="navbar-menu">
          <a href="#home" className="active" onClick={() => setMenuOpen(false)}>
            Home
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>
          <a href="#services" onClick={() => setMenuOpen(false)}>
            Services
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            Contact
          </a>
        </div>
        <span className="toggle" id="navbar-toggle" onClick={() => setMenuOpen((v) => !v)}>
          &#9776;
        </span>
      </nav>
      {/* Auth Modal */}
      {showAuth && (
        <div className={`authModal active`} id="authModal">
          <div>
            <button
              className="close-modal-btn"
              onClick={() => setShowAuth(false)}
              aria-label="Close"
            >
              &times;
            </button>
            {!otpMode && authType === "login" && (
              <div id="loginForm">
                <h2>Login</h2>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter Gmail"
                  autoComplete="username"
                />
                <button onClick={() => handleSendOtp("login")}>Send OTP</button>
                <div className="msg error">{msg}</div>
                <div className="switch-link">
                  Don't have an account?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSwitchAuth("signup");
                    }}
                  >
                    Sign Up
                  </a>
                </div>
              </div>
            )}
            {!otpMode && authType === "signup" && (
              <div id="signupForm">
                <h2>Sign Up</h2>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter Gmail"
                  autoComplete="username"
                />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Your Name"
                  autoComplete="name"
                />
                <button onClick={() => handleSendOtp("signup")}>Send OTP</button>
                <div className="msg error">{msg}</div>
                <div className="switch-link">
                  Already have an account?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSwitchAuth("login");
                    }}
                  >
                    Login
                  </a>
                </div>
              </div>
            )}
            {otpMode && (
              <div id="otpForm">
                <h2>Email Verification</h2>
                <div className="msg">{otpMessage}</div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  autoComplete="one-time-code"
                />
                <button onClick={handleVerifyOtp}>Verify</button>
                <div className="msg error">{otpMsg}</div>
                <div className="switch-link">
                  <a
                    href="#"
                    className="resend-otp-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleResendOtp();
                    }}
                  >
                    Resend OTP
                  </a>
                </div>
                <div className="switch-link">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSwitchAuth("login");
                    }}
                  >
                    ← Back to Login
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="container">
        {/* Rate Configuration */}
        <div>
          <div className="section-title">
            <span className="icon">⚙️</span>
            Rate Configuration
          </div>
          <div className="rates-grid">
            {[
              { id: "powderCoatingRate", label: "Powder Coating (₹/kg)" },
              { id: "laborRate", label: "Labor (₹/ft²)" },
              { id: "clampPrice", label: "Clamp (₹/piece)" },
              { id: "clearGlassRate", label: "Clear Glass (₹/ft²)" },
              { id: "reflectiveGlassRate", label: "Reflective Glass (₹/ft²)" },
              { id: "rubberRate", label: "Rubber (₹/ft)" },
              { id: "lockPrice", label: "Lock (₹)" },
              { id: "bearingPrice", label: "Bearing (₹/piece)" },
              { id: "woolFileRate", label: "Wool File (₹/ft)" },
              { id: "otherChargesRate", label: "Other Charges (₹/ft²)" },
            ].map((field) => (
              <div className="input-group" key={field.id}>
                <label htmlFor={field.id}>{field.label}</label>
                <input
                  type="number"
                  id={field.id}
                  value={rates[field.id]}
                  min="0"
                  step="0.01"
                  onChange={(e) =>
                    setRates({ ...rates, [field.id]: Number(e.target.value) })
                  }
                />
              </div>
            ))}
          </div>
        </div>
        {/* Profiles Section */}
        <div className="profiles-section">
          {/* OUTER */}
          <h2>Outer Frame Profiles:</h2>
          <div className="profile-table-outer profile-table-anim">
            <div className="profile-row header">
              <div>Type</div>
              <div>Thickness (mm)</div>
              <div>Weight/ft (kg)</div>
              <div>Rate/kg (₹)</div>
              <div></div>
            </div>
            {outerProfiles.map((p, idx) => (
              <div className="profile-row" key={idx}>
                <input
                  value={p.type}
                  placeholder="Type"
                  onChange={(e) =>
                    handleProfileChange("outer", idx, "type", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={p.thickness}
                  placeholder="Thickness"
                  min="0"
                  step="0.001"
                  onChange={(e) =>
                    handleProfileChange("outer", idx, "thickness", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={p.weight}
                  placeholder="Weight/ft"
                  min="0"
                  step="0.001"
                  onChange={(e) =>
                    handleProfileChange("outer", idx, "weight", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={p.rate}
                  placeholder="Rate/kg"
                  min="0"
                  step="0.01"
                  onChange={(e) =>
                    handleProfileChange("outer", idx, "rate", e.target.value)
                  }
                />
                <button
                  className="profile-delete"
                  title="Delete"
                  onClick={() => handleProfileDelete("outer", idx)}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              className="profile-add"
              onClick={() => handleProfileAdd("outer")}
            >
              + Add Outer Frame Profile
            </button>
          </div>
          {/* INNER */}
          <h2>Inner Frame Profiles:</h2>
          <div className="profile-table-inner profile-table-anim">
            <div className="profile-row header">
              <div>Type</div>
              <div>Thickness (mm)</div>
              <div>Weight/ft (kg)</div>
              <div>Rate/kg (₹)</div>
              <div></div>
            </div>
            {innerProfiles.map((p, idx) => (
              <div className="profile-row" key={idx}>
                <input
                  value={p.type}
                  placeholder="Type"
                  onChange={(e) =>
                    handleProfileChange("inner", idx, "type", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={p.thickness}
                  placeholder="Thickness"
                  min="0"
                  step="0.001"
                  onChange={(e) =>
                    handleProfileChange("inner", idx, "thickness", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={p.weight}
                  placeholder="Weight/ft"
                  min="0"
                  step="0.001"
                  onChange={(e) =>
                    handleProfileChange("inner", idx, "weight", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={p.rate}
                  placeholder="Rate/kg"
                  min="0"
                  step="0.01"
                  onChange={(e) =>
                    handleProfileChange("inner", idx, "rate", e.target.value)
                  }
                />
                <button
                  className="profile-delete"
                  title="Delete"
                  onClick={() => handleProfileDelete("inner", idx)}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              className="profile-add"
              onClick={() => handleProfileAdd("inner")}
            >
              + Add Inner Frame Profile
            </button>
          </div>
          {/* CLAMPING LOCK */}
          <h2>Clamping Lock Profiles:</h2>
          <div className="profile-table-clamp profile-table-anim">
            <div className="profile-row header">
              <div>Type</div>
              <div>Thickness (mm)</div>
              <div>Weight/ft (kg)</div>
              <div>Rate/kg (₹)</div>
              <div></div>
            </div>
            {clampProfiles.map((p, idx) => (
              <div className="profile-row" key={idx}>
                <input
                  value={p.type}
                  placeholder="Type"
                  onChange={(e) =>
                    handleProfileChange("clamp", idx, "type", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={p.thickness}
                  placeholder="Thickness"
                  min="0"
                  step="0.001"
                  onChange={(e) =>
                    handleProfileChange("clamp", idx, "thickness", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={p.weight}
                  placeholder="Weight/ft"
                  min="0"
                  step="0.001"
                  onChange={(e) =>
                    handleProfileChange("clamp", idx, "weight", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={p.rate}
                  placeholder="Rate/kg"
                  min="0"
                  step="0.01"
                  onChange={(e) =>
                    handleProfileChange("clamp", idx, "rate", e.target.value)
                  }
                />
                <button
                  className="profile-delete"
                  title="Delete"
                  onClick={() => handleProfileDelete("clamp", idx)}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              className="profile-add"
              onClick={() => handleProfileAdd("clamp")}
            >
              + Add Clamping Lock Profile
            </button>
          </div>
          </div>
          <div className="main-content">
            <div className="input-section">
              <div className="section-title">
                <span className="icon">🪟</span>
                Windows Configuration
              </div>
              <button className="add-window-btn" onClick={handleAddWindow}>
                ➕ Add New Window
              </button>
              <div id="windowsContainer">
                {Object.entries(windows).map(([id, win]) => {
                const outProf = outerProfiles[win.outerProfileIdx] || outerProfiles[0];
                const inProf = innerProfiles[win.innerProfileIdx] || innerProfiles[0];
                const clampProf = clampProfiles[win.clampProfileIdx] || clampProfiles[0];
                return (
                  <div className="window-item animated-window" key={id}>
                    <div className="window-header">
                      <div className="window-title">Window {win.idx}</div>
                      <button className="remove-window" onClick={() => handleRemoveWindow(id)}>
                        Remove
                      </button>
                    </div>
                    <div className="input-group">
                      <label>Dimensions Unit</label>
                      <div className="unit-toggle">
                        <div
                          className={`unit-option${win.unit === "feet" ? " active" : ""}`}
                          onClick={() => handleUpdateWindow(id, "unit", "feet")}
                        >
                          Feet
                        </div>
                        <div
                          className={`unit-option${win.unit === "inches" ? " active" : ""}`}
                          onClick={() => handleUpdateWindow(id, "unit", "inches")}
                        >
                          Inches
                        </div>
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Width</label>
                      <div className="dimension-input">
                        <input
                          type="number"
                          className="width-input"
                          value={win.width}
                          min="0.1"
                          step="0.1"
                          onChange={(e) =>
                            handleUpdateWindow(id, "width", Number(e.target.value))
                          }
                        />
                        <div className="conversion-info">
                          {win.unit === "inches"
                            ? `= ${(win.width / 12).toFixed(2)} ft`
                            : ""}
                        </div>
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Height</label>
                      <div className="dimension-input">
                        <input
                          type="number"
                          className="height-input"
                          value={win.height}
                          min="0.1"
                          step="0.1"
                          onChange={(e) =>
                            handleUpdateWindow(id, "height", Number(e.target.value))
                          }
                        />
                        <div className="conversion-info">
                          {win.unit === "inches"
                            ? `= ${(win.height / 12).toFixed(2)} ft`
                            : ""}
                        </div>
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Number of Tracks</label>
                      <div className="track-selector">
                        {[2, 3, 4].map((track) => (
                          <div
                            key={track}
                            className={`track-option${win.tracks === track ? " active" : ""}`}
                            onClick={() => handleUpdateWindow(id, "tracks", track)}
                          >
                            {track} Track
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="input-group">
                      <label>Glass Type</label>
                      <div className="glass-toggle">
                        <div
                          className={`glass-option${win.glassType === "clear" ? " active" : ""}`}
                          onClick={() => handleUpdateWindow(id, "glassType", "clear")}
                        >
                          Clear Glass
                          <br />
                          <small>₹{rates.clearGlassRate}/ft²</small>
                        </div>
                        <div
                          className={`glass-option${win.glassType === "reflective" ? " active" : ""}`}
                          onClick={() => handleUpdateWindow(id, "glassType", "reflective")}
                        >
                          Reflective Glass
                          <br />
                          <small>₹{rates.reflectiveGlassRate}/ft²</small>
                        </div>
                      </div>
                    </div>
                    {/* Profile selectors */}
                    <div className="input-group">
                      <label>Outer Frame Profile</label>
                      <select
                        value={win.outerProfileIdx}
                        onChange={(e) =>
                          handleChangeProfile(id, "outerProfileIdx", Number(e.target.value))
                        }
                      >
                        {outerProfiles.map((p, i) => (
                          <option key={i} value={i}>
                            {p.type
                              ? `${p.type} | ${p.thickness}mm | ${p.weight}kg/ft | ₹${p.rate}/kg`
                              : `Profile ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Inner Frame Profile</label>
                      <select
                        value={win.innerProfileIdx}
                        onChange={(e) =>
                          handleChangeProfile(id, "innerProfileIdx", Number(e.target.value))
                        }
                      >
                        {innerProfiles.map((p, i) => (
                          <option key={i} value={i}>
                            {p.type
                              ? `${p.type} | ${p.thickness}mm | ${p.weight}kg/ft | ₹${p.rate}/kg`
                              : `Profile ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Clamping Lock Profile</label>
                      <select
                        value={win.clampProfileIdx}
                        onChange={(e) =>
                          handleChangeProfile(id, "clampProfileIdx", Number(e.target.value))
                        }
                      >
                        {clampProfiles.map((p, i) => (
                          <option key={i} value={i}>
                            {p.type
                              ? `${p.type} | ${p.thickness}mm | ${p.weight}kg/ft | ₹${p.rate}/kg`
                              : `Profile ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="weight-summary">
                      <div className="summary-item">
                        <span>Area:</span>
                        <span className="window-area">
                          {win._summary.area.toFixed(2)} ft²
                        </span>
                      </div>
                      <div className="summary-item">
                        <span>Total Weight:</span>
                        <span className="window-weight">
                          {win._summary.totalWeight.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="summary-item">
                        <span>Window Cost:</span>
                        <span className="window-cost">
                          ₹{win._summary.totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Results */}
          <div className="results-section">
            <div className="section-title">
              <span className="icon">📊</span>
              Project Summary
            </div>
            <div className="analytics-summary">
              <div className="summary-item">
                <span>Total Windows:</span> <span>{totalWindows}</span>
              </div>
              <div className="summary-item">
                <span>Total Area:</span> <span>{totalArea.toFixed(2)} ft²</span>
              </div>
              <div className="summary-item">
                <span>Outer Frame Weight:</span>
                <span>{outerFrameWeight.toFixed(2)} kg</span>
              </div>
              <div className="summary-item">
                <span>Inner Frame Weight:</span>
                <span>{innerFrameWeight.toFixed(2)} kg</span>
              </div>
              <div className="summary-item">
                <span>Total Weight:</span> <span>{totalWeight.toFixed(2)} kg</span>
              </div>
              <div className="summary-item">
                <span>Avg Cost per ft²:</span> <span>₹{avgCostPerSqFt}</span>
              </div>
            </div>
            <div className="section-title">
              <span className="icon">💰</span>
              Total Cost Breakdown
            </div>
            <div className="cost-breakdown" id="totalCostBreakdown">
              {Object.keys(aggregatedCosts).map((costType) => (
                <div className="cost-item" key={costType}>
                  <span className="cost-label">
                    {costType
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </span>
                  <span className="cost-value">
                    ₹{aggregatedCosts[costType].toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="cost-item">
                <span className="cost-label">Grand Total</span>
                <span className="cost-value">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="total-cost">
              <h3>Total Project Cost</h3>
              <div className="amount" id="grandTotal">
                ₹{grandTotal.toFixed(2)}
              </div>
            </div>
            <div className="analytics-summary" style={{ marginTop: "0.7rem" }}>
              <div className="summary-item">
                <span>Average Cost per Window:</span>
                <span id="avgCostPerWindow">₹{avgCostPerWindow}</span>
              </div>
            </div>
          </div>
        </div>
        <footer/>
      </div>
    </div>
  );
}

export default App;
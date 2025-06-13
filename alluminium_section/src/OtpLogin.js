import React, { useState } from "react";
import axios from "axios";

function OtpLogin({ onOtpSent }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    try {
      const res = await axios.post("https://your-backend.com/send-otp", { email });
      if (res.data.success) {
        onOtpSent(email);
      } else {
        setError("Failed to send OTP.");
      }
    } catch (err) {
      setError("Server error while sending OTP.");
    }
  };

  return (
    <div className="otp-login">
      <h2>Login via OTP</h2>
      <input
        type="email"
        placeholder="Enter your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSendOtp}>Send OTP</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default OtpLogin;

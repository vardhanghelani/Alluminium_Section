import axios from "axios";
import React, { useState } from "react";

const OtpLogin = ({ onOtpSent }) => {
  const [email, setEmail] = useState("");

  const handleSendOtp = async () => {
    if (!email) return alert("Please enter your email");

    try {
      const res = await axios.post("http://localhost:5000/api/request-otp", { email });

      if (res.status === 200 && res.data.message?.toLowerCase().includes("otp sent")) {
        alert("OTP sent successfully to your email.");
        onOtpSent(email); // or redirect to VerifyOtp
      } else {
        alert(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  return (
    <div>
      <h2>OTP Login</h2>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSendOtp}>Send OTP</button>
    </div>
  );
};

export default OtpLogin;

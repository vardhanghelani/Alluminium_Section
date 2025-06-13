import React, { useState } from "react";
import axios from "axios";

function VerifyOtp({ email, onSuccess }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleVerify = async () => {
    try {
      const res = await axios.post("https://your-backend.com/verify-otp", { email, otp });
      if (res.data.success) {
        onSuccess(res.data.user);
      } else {
        setError("Invalid OTP.");
      }
    } catch (err) {
      setError("Verification failed.");
    }
  };

  return (
    <div className="verify-otp">
      <h2>Enter OTP</h2>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <button onClick={handleVerify}>Verify</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default VerifyOtp;

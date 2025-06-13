import React, { useState } from "react";
import axios from "axios";

function VerifyOtp({ email, onSuccess, onBack }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError("");
    
    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    if (otp.trim().length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Sending verification request...");
      console.log("Request data:", { email, otp: otp.trim() });
      
      const response = await axios.post("http://localhost:5000/api/verify-otp", {
        email,
        otp: otp.trim(),
      });

      console.log("📡 Full response object:", response);
      console.log("📦 Response data:", response.data);
      console.log("✅ Response status:", response.status);
      console.log("🎯 Success property:", response.data.success);
      console.log("💬 Message property:", response.data.message);

      // Check if response exists and has success property
      if (response && response.data) {
        if (response.data.success === true) {
          console.log("🎉 SUCCESS: Calling onSuccess callback");
          onSuccess(response.data.user);
        } else {
          console.log("❌ FAILURE: success is false or missing");
          const errorMessage = response.data.message || "Verification failed";
          setError(errorMessage);
        }
      } else {
        console.log("❌ ERROR: Invalid response structure");
        setError("Invalid response from server");
      }

    } catch (err) {
      console.error("🚨 CATCH BLOCK TRIGGERED:");
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      console.error("Error request:", err.request);
      
      if (err.response) {
        console.log("📡 Server error response:", err.response.data);
        console.log("📡 Server error status:", err.response.status);
        const errorMessage = err.response.data?.message || "Server error occurred";
        setError(errorMessage);
      } else if (err.request) {
        console.log("🌐 Network error - no response received");
        setError("Network error. Please check your connection.");
      } else {
        console.log("🤷 Unexpected error:", err.message);
        setError("An unexpected error occurred: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-otp">
      <h2>Enter OTP sent to {email}</h2>
      <input
        type="text"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
          setOtp(value);
          if (error) setError("");
        }}
        maxLength={6}
        disabled={loading}
      />
      <button 
        onClick={handleVerify} 
        disabled={loading || !otp.trim()}
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
      <button 
        onClick={onBack} 
        style={{ marginLeft: "1rem" }}
        disabled={loading}
      >
        Back
      </button>
      {error && <p className="error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      
      {/* Debug info */}
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', fontSize: '12px' }}>
        <strong>Debug Info:</strong><br/>
        Email: {email}<br/>
        OTP: {otp}<br/>
        Loading: {loading.toString()}<br/>
        Error: {error || 'None'}
      </div>
    </div>
  );
}

export default VerifyOtp;
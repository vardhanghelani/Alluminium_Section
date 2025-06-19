import React, { useState } from 'react';
import axios from 'axios';

const VerifyOtp = ({ email, onSuccess, onBack }) => {
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = numericValue;
      setOtp(newOtp);
      
      if (error) setError("");
      
      // Auto-focus next input
      if (numericValue && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = Array(6).fill('');
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    if (error) setError("");
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    
    if (!otpString.trim()) {
      setError("Please enter the OTP");
      return;
    }

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      console.log("🔄 Sending verification request...");
      console.log("Request data:", { email, otp: otpString });
      
      const response = await axios.post("https://alluminium-section-1.onrender.com/api/verify-otp", {
        email,
        otp: otpString,
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

  const otpString = otp.join('');

  return (
    <div className="auth-page">
      <div className="auth-container-inner">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
              <rect width="20" height="20" x="4" y="4" fill="#fff" stroke="#0ac" strokeWidth="2.5" rx="4" />
              <rect width="20" height="20" x="24" y="4" fill="#fff" stroke="#0ac" strokeWidth="2.5" rx="4" />
              <rect width="20" height="20" x="4" y="24" fill="#fff" stroke="#0ac" strokeWidth="2.5" rx="4" />
              <rect width="20" height="20" x="24" y="24" fill="#fff" stroke="#0ac" strokeWidth="2.5" rx="4" />
            </svg>
          </div>
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle">
            We've sent a 6-digit code to<br />
            <strong>{email}</strong>
          </p>
        </div>

        {/* Main Card */}
        <div className="auth-card">
          <div className="auth-form">
            {/* OTP Input */}
            <div className="otp-section">
              <label className="input-label">
                🔐 Enter Verification Code
              </label>
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`otp-input ${error ? 'error' : ''} ${digit ? 'filled' : ''}`}
                    disabled={loading}
                  />
                ))}
              </div>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              <button
                onClick={handleVerify}
                disabled={loading || otpString.length !== 6}
                className="auth-button primary"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  "Verify Code"
                )}
              </button>

              <button
                onClick={onBack}
                disabled={loading}
                className="auth-button secondary"
              >
                ← Back to Email
              </button>
            </div>
          </div>
        </div>

        {/* Debug Toggle */}
        <div className="debug-toggle">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="debug-button"
          >
            {showDebug ? '👁️‍🗨️ Hide' : '👁️ Show'} Debug Info
          </button>
        </div>

        {/* Debug Info */}
        {showDebug && (
          <div className="debug-info">
            <h4>Debug Information:</h4>
            <div><strong>Email:</strong> {email}</div>
            <div><strong>OTP:</strong> {otpString || 'None'}</div>
            <div><strong>Loading:</strong> {loading.toString()}</div>
            <div><strong>Error:</strong> {error || 'None'}</div>
          </div>
        )}

        {/* Footer */}
        <div className="auth-footer">
          <p>Didn't receive the code? Check your spam folder or try again</p>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .auth-container-inner {
          width: 100%;
          max-width: 420px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .auth-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0 0 10px 0;
        }

        .auth-subtitle {
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 40px 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .otp-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: center;
        }

        .input-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
          text-align: center;
        }

        .otp-inputs {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .otp-input {
          width: 48px;
          height: 48px;
          text-align: center;
          font-size: 1.25rem;
          font-weight: 700;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          transition: all 0.2s ease;
          background: white;
        }

        .otp-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .otp-input.filled {
          background: #f0fdf4;
          border-color: #10b981;
        }

        .otp-input.error {
          border-color: #ef4444;
        }

        .otp-input:disabled {
          background-color: #f9fafb;
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          text-align: center;
          animation: shake 0.3s ease-in-out;
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .auth-button {
          width: 100%;
          padding: 15px 20px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .auth-button.primary {
          background: linear-gradient(135deg, #10b981, #3b82f6);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .auth-button.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
        }

        .auth-button.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .auth-button.secondary:hover:not(:disabled) {
          background: #e5e7eb;
        }

        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .debug-toggle {
          text-align: center;
          margin-top: 20px;
        }

        .debug-button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .debug-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }

        .debug-info {
          margin-top: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 0.8rem;
          line-height: 1.5;
        }

        .debug-info h4 {
          margin: 0 0 10px 0;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .debug-info div {
          margin: 5px 0;
        }

        .auth-footer {
          text-align: center;
          margin-top: 25px;
        }

        .auth-footer p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.4;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 30px 20px;
          }
          
          .auth-title {
            font-size: 1.75rem;
          }
          
          .otp-inputs {
            gap: 8px;
          }
          
          .otp-input {
            width: 40px;
            height: 40px;
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VerifyOtp;
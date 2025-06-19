import React, { useState } from 'react';
import axios from 'axios';

const OtpLogin = ({ onOtpSent }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.post("https://alluminium-section-1.onrender.com/api/request-otp", { email });

      if (res.status === 200 && res.data.message?.toLowerCase().includes("otp sent")) {
        onOtpSent(email);
      } else {
        setError(res.data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendOtp();
    }
  };

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
          <h1 className="auth-title">Secure Login</h1>
          <p className="auth-subtitle">Enter your email to receive a one-time password</p>
        </div>

        {/* Main Card */}
        <div className="auth-card">
          <div className="auth-form">
            {/* Email Input */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                📧 Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                onKeyPress={handleKeyPress}
                className={`auth-input ${error ? 'error' : ''}`}
                disabled={loading}
              />
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
            </div>

            {/* Send OTP Button */}
            <button
              onClick={handleSendOtp}
              disabled={loading || !email}
              className="auth-button primary"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  Send OTP →
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>We'll send a 6-digit code to your email for secure authentication</p>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .auth-container-inner {
          width: 100%;
          max-width: 400px;
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
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-size: 0.95rem;
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
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }

        .auth-input {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: white;
          box-sizing: border-box;
        }

        .auth-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .auth-input.error {
          border-color: #ef4444;
        }

        .auth-input:disabled {
          background-color: #f9fafb;
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 5px;
          animation: shake 0.3s ease-in-out;
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
          position: relative;
        }

        .auth-button.primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .auth-button.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
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

        .auth-footer {
          text-align: center;
          margin-top: 25px;
        }

        .auth-footer p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
          margin: 0;
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
        }
      `}</style>
    </div>
  );
};

export default OtpLogin;
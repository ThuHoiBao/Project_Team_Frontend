// components/Auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPasswordComponent.css';  // Import CSS cho trang ForgotPassword

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpVerified) {
      console.log('Email:', email, 'OTP:', otp);
      navigate('/login');  // Chuyển hướng đến trang đăng nhập
    } else {
      alert('Please verify OTP first');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const result = await response.json();
      if (response.ok) {
        setOtpVerified(true);
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('Error verifying OTP');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card shadow-lg p-4 rounded">
        <h2 className="text-center">Forgot Password</h2>
        {!otpVerified ? (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Verify OTP</button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <div className="mb-3">
              <label htmlFor="otp" className="form-label">OTP</label>
              <input
                type="text"
                className="form-control"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Change Password</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPasswordComponent.css"; 
import { useLocation } from "react-router-dom";
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const HandleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8088/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Password changed successfully");
        navigate("/login");
      } else {
        alert(result.message || "Failed to reset password");
      }
    } catch (error) {
      alert("Error resetting password");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card shadow-lg p-4 rounded">
        <h2 className="text-center">Reset Password</h2>
        <form onSubmit={HandleResetPassword}>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              New Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

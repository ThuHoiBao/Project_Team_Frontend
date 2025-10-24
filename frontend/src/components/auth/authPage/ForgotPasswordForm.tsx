// components/Auth/ForgotPasswordForm.tsx
import React, { useState } from "react";
import styles from "./AuthPage.module.scss";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
  onEmailSubmitted: (email: string) => void; // nhận email
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin, onEmailSubmitted }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  // Gửi OTP về email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8088/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (response.ok) {
        alert(result.message || "OTP đã được gửi đến email của bạn.");
        setStep("otp");
      } else {
        alert(result.message || "Không thể gửi OTP, vui lòng thử lại.");
      }
    } catch {
      alert("Lỗi khi gửi OTP.");
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8088/api/auth/verify-otp-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Xác thực OTP thành công.");
        onEmailSubmitted(email); 
      } else {
        alert(result.message || "OTP không hợp lệ.");
      }
    } catch {
      alert("Lỗi khi xác thực OTP.");
    }
  };

  return (
    <div className={styles.form}>
        {step === "email" ? (
        <form className={styles.form} onSubmit={handleSendOtp}>
            <div className={styles.inputGroup}>
            <label>Nhập địa chỉ email <span>*</span></label>
            <input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            </div>

            <button type="submit" className={styles.loginBtn}>
                Gửi OTP
            </button>

        <p className={styles.backText} onClick={onBackToLogin}>
            ← Quay lại đăng nhập
        </p>
        </form>
        ) : (
            <form className={styles.form} onSubmit={handleVerifyOtp}>
            <div className={styles.inputGroup}>
                <label>Mã OTP <span>*</span></label>
                <input
                type="text"
                placeholder="Nhập mã OTP bạn nhận được"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                />
            </div>

            <button type="submit" className={styles.loginBtn}>
                Xác nhận OTP
            </button>

            <button
              type="submit"
              onClick={() => setStep("email")}
              className={styles.loginBtn}
            >
              Gửi lại OTP
            </button>

            <p className={styles.backText} onClick={onBackToLogin}>
                ← Quay lại đăng nhập
            </p>
          
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordForm;

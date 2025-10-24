import React, { useState } from "react";
import styles from "./AuthPage.module.scss";

interface ResetPasswordFormProps {
  onBackToLogin: () => void;
  email: string; // nhận email
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToLogin, email }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Mật khẩu không trùng khớp.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8088/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Đổi mật khẩu thành công!");
        onBackToLogin(); // quay lại form login
      } else {
        alert(result.message || "Không thể đổi mật khẩu.");
      }
    } catch (error) {
      alert("Lỗi khi đổi mật khẩu.");
    }
  };

  return (
    <div className={styles.form}>
      <form className={styles.form} onSubmit={handleResetPassword}>
        <div className={styles.inputGroup}>
          <label>
                Mật khẩu mới <span>*</span>
          </label>
          <input
            type="password"
            placeholder="Nhập mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>
                Xác nhận mật khẩu <span>*</span>
          </label>
          <input
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.loginBtn}>
          Đổi mật khẩu
        </button>

         <p className={styles.backText} onClick={onBackToLogin}>
            ← Quay lại đăng nhập
        </p>
      </form>
    </div>
  );
};

export default ResetPasswordForm;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AuthPage.module.scss";
import { googleLogin, loginUser } from "../../../services/auth/authApi";
import { AxiosError } from "axios";
import { useAuth } from "../../../context/AuthContext";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";


const LoginForm: React.FC<{ onForgot: () => void }> = ({ onForgot }) => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Gửi request login
      const response = await loginUser({ email: emailOrUsername, password });

      // Lưu token vào localStorage
      localStorage.setItem("token", response.data.token);
      const token = response.data.token;
      console.log("Token:", token);

      // Cập nhật trạng thái auth
      login(token);

      // Hiển thị thành công và điều hướng
      setSuccessMessage("Đăng nhập thành công!");
      setErrorMessage("");
      setTimeout(() => {
        navigate("/home");
      }, 700);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        setErrorMessage(error.response.data.message || "Tài khoản hoặc mật khẩu không đúng!");
      } else {
        setErrorMessage("Đã xảy ra lỗi, vui lòng thử lại sau.");
      }
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) return;
      const data = await googleLogin(credentialResponse.credential);
      // console.log("Google token:", data.token);
      localStorage.setItem("token", data.token);
      // console.log("After setItem:", localStorage.getItem("token"));
      login(data.token);
      setSuccessMessage("Login successful!");
      setErrorMessage("");
      setTimeout(() => {
        navigate("/home");
      }, 700);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleLogin}>
      <label>
        Tên tài khoản hoặc địa chỉ email <span>*</span>
      </label>
      <input
        type="text"
        placeholder="Nhập tài khoản hoặc email"
        value={emailOrUsername}
        onChange={(e) => setEmailOrUsername(e.target.value)}
        required
      />

      <label>
        Mật khẩu <span>*</span>
      </label>
      <input
        type="password"
        placeholder="Nhập mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* Hiển thị lỗi hoặc thành công */}
      {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      <button type="submit" className={styles.loginBtn}>
        LOG IN
      </button>

      <div className={styles.divider}>
        <span>Hoặc</span>
      </div>

       {/* Nút Google Login */}
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setErrorMessage("Google login failed")}
        />

      <div className={styles.forgotPassword}>
        <span onClick={onForgot} className={styles.link}>
          Quên mật khẩu?
        </span>
      </div>
    </form>
  );
};

export default LoginForm;

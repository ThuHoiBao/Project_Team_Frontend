// src/components/Login/Login.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.scss";
import { googleLogin, loginUser } from "../../../services/auth/authApi";
import { AxiosError } from "axios";
import { useLoginModal } from "../../../context/LoginContext";
import { useAuth } from "../../../context/AuthContext";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { setError } from "../../../redux/auth/authSlice";


const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { isLoginOpen, closeLogin } = useLoginModal();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    document.body.style.overflow = isLoginOpen ? "hidden" : "auto";
  }, [isLoginOpen]);

  if (!isLoginOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password });
      localStorage.setItem("token", response.data.token);
      const token = response.data.token;  
      login(token);
      setError("")
      setSuccessMessage("Login successful!");
      setErrorMessage("");
      setTimeout(() => {
        closeLogin();
        navigate("/home");
        setSuccessMessage("");
      }, 700);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        setSuccessMessage("");
        setErrorMessage(error.response?.data.message || "Invalid credentials");
      } else {
        setSuccessMessage("");
        setErrorMessage("An error occurred during login.");
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
      closeLogin();
      navigate("/home");
    }, 700);
  } catch (error) {
    console.error(error);
  }
  } ;

  const handleCloseLogin = () =>{
    closeLogin();
    setSuccessMessage("");
    setErrorMessage("");
    setEmail("");
    setPassword("");
  }


  return (
    <div className={styles.overlay}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2>Sign In</h2>
          <button className={styles.closeBtn} onClick={handleCloseLogin}>
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <label>Email address <span>*</span></label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password <span>*</span></label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMessage && <div className={styles.error}>{errorMessage}</div>}
          {successMessage && <div className={styles.success}>{successMessage}</div>}

          <button type="submit" className={styles.loginBtn}>
            LOG IN
          </button>

          <div className={styles.options}>
            <div>
            </div>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => {
                closeLogin();
                navigate("/register", { state: { openForgot: true } }); // truyền state
              }}
            >
              Lost your password?
            </button>
          </div>
        </form>

        <div className={styles.divider}>OR</div>

        {/* Nút Google Login */}
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setErrorMessage("Google login failed")}
        />

        <div className={styles.createAccount}>
          <p>No account yet?</p>
          <button
            type="button"
            className={styles.createBtn}
            onClick={() => {
              closeLogin();
              navigate("/register");
            }}
          >
            CREATE AN ACCOUNT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

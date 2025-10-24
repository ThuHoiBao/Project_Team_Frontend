import React, { useEffect, useState } from "react";
import styles from "./AuthPage.module.scss";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import OTPForm from "./OTPForm";
import Header from "../../commonComponent/Header";
import Footer from "../../commonComponent/Footer";
import { Link, useLocation } from "react-router-dom";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ResetPasswordForm from "./ResetPasswordForm";

const AuthPage: React.FC = () => {
  // Thêm "forgot" vào formState
  const [formState, setFormState] = useState<"login" | "register" | "otp" | "forgot" | "reset">("register");
  const [emailForReset, setEmailForReset] = useState<string>("");

  const location = useLocation();
  useEffect(() => {
    if (location.state?.openForgot) {
      setFormState("forgot");
    }
  }, [location.state]);

  // Chuyển giữa login / register
  const toggleForm = () => {
    if (formState === "login") setFormState("register");
    else if (formState === "register") setFormState("login");
  };

  // Khi đăng ký xong → chuyển qua OTP
  const handleShowOtp = () => setFormState("otp");

  // Khi xác minh xong hoặc quay lại
  const backToLogin = () => setFormState("login");

  // Khi nhấn Quên mật khẩu? trong LoginForm
  const handleForgotPassword = () => setFormState("forgot");

  // Sau khi verify OTP xong → điều hướng đến reset form
  const handleOtpVerified = (email: string) => {
    setEmailForReset(email);
    setFormState("reset");
  } ;

  // Lắng nghe sự kiện “switchToLogin” từ Header
  useEffect(() => {
    const handleSwitchToLogin = () => {
      setFormState("login");
    };

    const handleOpenForgotPassword = () => {
      setFormState("forgot");
    };

    window.addEventListener("switchToLogin", handleSwitchToLogin);
    window.addEventListener("openAuthForgotPassword", handleOpenForgotPassword);
    return () => {
      window.removeEventListener("switchToLogin", handleSwitchToLogin);
      window.removeEventListener("openAuthForgotPassword", handleOpenForgotPassword);
    };
  }, []);

  return (
  <>
    <Header />
    <div className={styles.container}>
      <h1 className={styles.title}>Tài Khoản</h1>
      <p className={styles.breadcrumb}>
        <Link to="/home" className={styles.homeLink}>
          Home
        </Link>{" "}
        / <span>Tài khoản</span>
      </p>

      <div
        className={`${styles.formWrapper} ${
          formState === "otp"
            ? styles.otpMode
            : formState === "forgot"
            ? styles.forgotMode
            : formState === "reset"
            ? styles.resetMode
            : ""
        }`}
      >
        {/* ====== Bên trái ====== */}
        <div className={styles.leftSection}>
          <h2>
            {formState === "login"
              ? "ĐĂNG NHẬP"
              : formState === "register"
              ? "ĐĂNG KÝ"
              : formState === "otp"
              ? "XÁC NHẬN OTP"
              : formState === "forgot"
              ? "QUÊN MẬT KHẨU"
              : "ĐẶT LẠI MẬT KHẨU"}
          </h2>

          {formState === "login" && (
            <LoginForm onForgot={handleForgotPassword} />
          )}
          {formState === "register" && (
            <RegisterForm onOtpSent={handleShowOtp} />
          )}
          {formState === "otp" && <OTPForm onBackToLogin={backToLogin} />}
          {formState === "forgot" && (
          <ForgotPasswordForm 
            onBackToLogin={backToLogin} 
            onEmailSubmitted={handleOtpVerified} 
          />
          )}
          {formState === "reset" && (
            <ResetPasswordForm 
              onBackToLogin={backToLogin} 
              email={emailForReset} 
            />
          )}
        </div>

        {/* ====== Bên phải ====== */}
        {formState !== "otp" && formState !== "forgot" && formState !== "reset" && (
          <div className={styles.rightSection}>
            <h2>{formState === "register" ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}</h2>
            <p>
              {formState === "register"
                ? "Đã có tài khoản? Hãy đăng nhập để theo dõi đơn hàng và lịch sử mua hàng."
                : "Đăng ký để truy cập tình trạng đơn hàng và lịch sử mua hàng của bạn. Chỉ cần điền vào các trường bên dưới!"}
            </p>
            <button onClick={toggleForm} className={styles.registerBtn}>
              {formState === "register" ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}
            </button>
          </div>
        )}
      </div>
    </div>
    <Footer />
  </>
  );

};


export default AuthPage;

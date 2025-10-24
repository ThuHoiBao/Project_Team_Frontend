import React, { useState } from "react";
import styles from "./AuthPage.module.scss";
import { verifyOtp } from "../../../services/auth/authApi";
import { AxiosError } from "axios";
import { RegisterUserResponseDTO } from "../../../dto/responseDTO/RegisterUserResponseDTO";

interface OTPFormProps {
  onBackToLogin: () => void;
}

const OTPForm: React.FC<OTPFormProps> = ({ onBackToLogin }) => {
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const { email, password, firstName, lastName } = user;

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !email) {
      setErrorMessage("Vui lòng nhập OTP hợp lệ!");
      return;
    }

    try {
      const userDTO = new RegisterUserResponseDTO();
      userDTO.email = email;
      userDTO.password = password;
      userDTO.firstName = firstName;
      userDTO.lastName = lastName;
      userDTO.otp = otp;

      const response = await verifyOtp(userDTO);

      if (response.status === 200) {
        setSuccessMessage("Xác minh OTP thành công!");
        setErrorMessage("");
        setTimeout(() => {
          onBackToLogin(); // Quay lại form login
        }, 1500);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        setErrorMessage(error.response?.data.message || "OTP không hợp lệ");
      } else {
        setErrorMessage("Có lỗi xảy ra, vui lòng thử lại sau.");
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleVerifyOtp}>
      <label>
        Nhập mã OTP <span>*</span>
      </label>
      <input
        type="text"
        placeholder="Nhập mã OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}

      <button type="submit" className={styles.loginBtn}>
        XÁC NHẬN OTP
      </button>

      <p className={styles.backText} onClick={onBackToLogin}>
        ← Quay lại đăng nhập
      </p>
    </form>
  );
};

export default OTPForm;

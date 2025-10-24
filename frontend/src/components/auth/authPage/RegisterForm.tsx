import React, { useState } from "react";
import styles from "./AuthPage.module.scss";
import { AxiosError } from "axios";
import { registerUser } from "../../../services/auth/authApi";
import { RegisterUserResponseDTO } from "../../../dto/responseDTO/RegisterUserResponseDTO";

interface RegisterFormProps {
  onOtpSent: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onOtpSent }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userDto = new RegisterUserResponseDTO();
      userDto.email = email;
      userDto.password = password;
      userDto.firstName = firstName;
      userDto.lastName = lastName;

      const response = await registerUser(userDto);

      localStorage.setItem("user", JSON.stringify(userDto.toPlain()));

      if (response.status === 200) {
        onOtpSent(); // ✅ Hiển thị OTP form
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        setErrorMessage(error.response?.data.message || "Đăng ký thất bại");
      } else {
        setErrorMessage("Đã xảy ra lỗi, vui lòng thử lại sau.");
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleRegister}>
      <label>
        Họ <span>*</span>
      </label>
      <input
        type="text"
        placeholder="Nhập họ"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />

      <label>
        Tên <span>*</span>
      </label>
      <input
        type="text"
        placeholder="Nhập tên"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />

      <label>
        Email <span>*</span>
      </label>
      <input
        type="email"
        placeholder="Nhập email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <button type="submit" className={styles.loginBtn}>
        ĐĂNG KÝ
      </button>
    </form>
  );
};

export default RegisterForm;

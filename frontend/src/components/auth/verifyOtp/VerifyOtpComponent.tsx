// components/Auth/VerifyOtp.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp } from '../../../services/auth/authApi';  // Import API từ api.ts
import { AxiosError } from 'axios';  // Import AxiosError để kiểm tra loại lỗi
import './VerifyOtpComponent.css';
import { RegisterUserResponseDTO } from '../../../dto/responseDTO/RegisterUserResponseDTO';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');  // Thêm state để chứa thông báo lỗi
  const [successMessage, setSuccessMessage] = useState('');  // Thêm state để chứa thông báo thành công
  const navigate = useNavigate();

  // Lấy thông tin người dùng từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { email, password, firstName, lastName } = user;

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra nếu OTP hoặc email không hợp lệ
    if (!otp || !email) {
      setErrorMessage('Please enter a valid OTP and email');
      return;
    }

    try {
      // Gửi OTP và thông tin người dùng lên backend để xác minh
      const userDTO = new RegisterUserResponseDTO();
      userDTO.email=email;
      userDTO.password=password;
      userDTO.firstName=firstName;
      userDTO.lastName=lastName;
      userDTO.otp=otp;
      const response =await verifyOtp(userDTO);
      if (response.status === 200) {
        setSuccessMessage(response.data.message);  // Hiển thị thông báo thành công
        setErrorMessage('');  // Xóa thông báo lỗi nếu có
        navigate('/login');  // Chuyển hướng đến trang đăng nhập sau khi xác minh OTP thành công
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        setErrorMessage(error.response?.data.message || 'Invalid OTP');
      } else {
        setErrorMessage('An error occurred during OTP verification. Please try again later.');
      }
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card shadow-lg p-4 rounded">
        <h2 className="text-center">Verify OTP</h2>
        <form onSubmit={handleVerifyOtp}>
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

          {/* Hiển thị thông báo lỗi nếu có */}
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          {/* Hiển thị thông báo thành công nếu có */}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <button type="submit" className="btn btn-primary w-100">Verify OTP</button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../../services/auth/authApi';  // Import API từ api.ts
import { AxiosError } from 'axios';
import {RegisterUserResponseDTO} from '../../../dto/responseDTO/RegisterUserResponseDTO';  // Import DTO
import './RegisterComponent.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Tạo đối tượng DTO
      const userDto = new RegisterUserResponseDTO();
      userDto.email = email;
      userDto.password = password;
      userDto.firstName = firstName;
      userDto.lastName = lastName;

      // Gửi yêu cầu đăng ký với DTO
      const response = await registerUser(userDto);  // Truyền DTO vào API
      console.log(response.data);

      // Lưu thông tin người dùng vào localStorage
      localStorage.setItem('user', JSON.stringify(userDto.toPlain()));

      setSuccessMessage('OTP sent to your email. Please verify OTP.');
      setErrorMessage('');
      navigate('/verify-otp');  // Chuyển hướng đến trang Verify OTP
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        setErrorMessage(error.response?.data.message || 'An error occurred during registration');
      } else {
        setErrorMessage('An error occurred during registration. Please try again later.');
      }
    }
  };

  return (
    <div className="container-regis">
      <div className="register-card">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
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

          <div className="mb-3">
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <button type="submit" className="btn btn-primary w-100">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;

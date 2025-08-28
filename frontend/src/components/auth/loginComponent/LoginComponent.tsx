// components/Auth/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginComponent.css';  // Import CSS cho trang Login
import { loginUser } from '../../../services/auth/authApi'; // Giả sử bạn đã tạo hàm loginUser trong services/api.ts
import { AxiosError } from 'axios';  // Import AxiosError để kiểm tra lỗi

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');  // Thêm state để chứa thông báo lỗi
  const [successMessage, setSuccessMessage] = useState('');  // Thêm state để chứa thông báo thành công
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email, password });  // Gọi API đăng nhập
      // Lưu vào localStorage
      localStorage.setItem("token", response.data.token);
      console.log(response.data);  // In ra dữ liệu từ backend

      // Hiển thị thông báo thành công và chuyển hướng đến trang Home
      setSuccessMessage('Login successful! Redirecting to home...');
      setErrorMessage('');
      
      setTimeout(() => {
        navigate('/home');  // Chuyển hướng tới trang chủ sau khi đăng nhập thành công
      }, 1500);  // Sau 1.5 giây chuyển hướng

    } catch (error) {
      // Xử lý lỗi đăng nhập
      if (error instanceof AxiosError && error.response) {
        setErrorMessage(error.response?.data.message || 'Invalid credentials');  // Hiển thị lỗi từ backend
      } else {
        setErrorMessage('An error occurred during login. Please try again later.');  // Lỗi không xác định
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card shadow-lg p-4 rounded">
        <h2 className="text-center">Sign In</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Username or email address</label>
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

          {/* Hiển thị thông báo lỗi nếu có */}
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          {/* Hiển thị thông báo thành công nếu có */}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <button type="submit" className="btn btn-primary w-100">Sign in</button>
        </form>

        <div className="mt-3 d-flex justify-content-between">
          <button
            className="btn btn-link"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </button>
          <button
            className="btn btn-link"
            onClick={() => navigate('/register')}
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

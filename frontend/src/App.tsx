// App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';  // Import Routes và Route từ react-router-dom
import Login from './components/auth/loginComponent/LoginComponent';
import ForgotPassword from './components/auth/forgotPasswordComponent/ForgotPasswordComponent'; // Giả sử bạn có ForgotPassword component
import VerifyOtp from './components/auth/verifyOtp/VerifyOtpComponent';  // Import VerifyOtp component
import Register from './components/auth/registerComponent/RegisterComponent';
import HomePage from './components/homePageComponent/HomePage';
import ResetPassword from './components/auth/forgotPasswordComponent/ResetPassword'; // Import ResetPassword component
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />  {/* Đăng nhập */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} /> 
        {/* <Route path="/verify-otp-reset" element={<VerifyOtp />} /> */}
        <Route path="/register" element={<Register />} /> 
        <Route path="/verify-otp" element={<VerifyOtp />} /> 
        <Route path="/home" element={<HomePage />} />{/* Thêm route cho trang Verify OTP */}
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;

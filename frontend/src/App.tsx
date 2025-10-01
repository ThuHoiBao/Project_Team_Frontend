// App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';  // Import Routes và Route từ react-router-dom
import Login from './components/auth/loginComponent/LoginComponent';
import ForgotPassword from './components/auth/forgotPasswordComponent/ForgotPasswordComponent'; // Giả sử bạn có ForgotPassword component
import VerifyOtp from './components/auth/verifyOtp/VerifyOtpComponent';  // Import VerifyOtp component
import Register from './components/auth/registerComponent/RegisterComponent';
// import HomePage from './components/homePageComponent/HomePage';
import HomePage from './components/homePage/HomePage';
import ResetPassword from './components/auth/forgotPasswordComponent/ResetPassword'; // Import ResetPassword component
import ProfilePage from './components/profilePageComponent/ProfilePage';
import CartPage from './components/cartPage';
import ProductDetailPage from './components/productDetail/productDetailComponent/ProductDetailPage';
import CasualPage from './components/categoryComponent/casualPage/CasualPage';

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
        <Route path="/myinfo" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/casual" element={<CasualPage/>}/>
      </Routes>
    </div>
  );
}

export default App;

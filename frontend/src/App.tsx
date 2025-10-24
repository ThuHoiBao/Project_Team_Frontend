// App.tsx
import React from 'react';

import { Routes, Route} from 'react-router-dom';  
import Login from './components/auth/login2/Login';
import ForgotPassword from './components/auth/forgotPasswordComponent/ForgotPasswordComponent'; 
import VerifyOtp from './components/auth/verifyOtp/VerifyOtpComponent'; 
import Register from './components/auth/registerComponent/RegisterComponent';
import HomePage from './components/homePage/HomePage';
import ResetPassword from './components/auth/forgotPasswordComponent/ResetPassword';
import ProfilePage from './components/profilePageComponent/ProfilePage';
import CartPage from './components/cartPage';
import ProductDetailPage from './components/productDetail/productDetailComponent/ProductDetailPage';
import OrderHome from './components/OrderHomeComponent/OrderHome';
import OrderDetail from './components/OrderDetailComponent/OrderDetail';
import CasualPage from './components/categoryComponent/casualPage/CasualPage';
import WishlistPage from './components/listFavoriteComponent/listFavoriteComponent';
import ScrollToTop from './components/ScrollToTop';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import AuthPage from './components/auth/authPage/AuthPage';
import CheckoutPage from './components/checkoutPage/CheckoutPage';
import { CartProvider } from './context/CartContext'; 
function App() {
  return (
     <CartProvider>
    <div className="App">
      <ScrollToTop />
      <Routes>
        {/* <Route path="/login" element={<Login />} />  Đăng nhập */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<AuthPage />} />
        {/* <Route path="/verify-otp-reset" element={<VerifyOtp />} /> */}
        <Route path="/register" element={<Register />} /> 
        <Route path="/verify-otp" element={<VerifyOtp />} /> 
        <Route path="/home" element={<HomePage />} />{/* Thêm route cho trang Verify OTP */}
        <Route path="/" element={<HomePage />} />
        <Route path="/myinfo" element={<ProfilePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/product-detail" element={<ProductDetailPage />} />
        <Route path="/order" element={<OrderHome/>} />
        <Route path="/order-detail" element={<OrderDetail/>}/>
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/casual" element={<CasualPage/>}/>
        <Route path="/product/wishlist" element={<WishlistPage />} />
        <Route  path="/checkout" element={<CheckoutPage />}   />
      </Routes>
      <Login />
      <ToastContainer position="bottom-right" />
    </div>
       </CartProvider>
  )
}

export default App;
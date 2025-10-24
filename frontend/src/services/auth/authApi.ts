
import axios from 'axios';
import {RegisterUserResponseDTO} from '../../dto/responseDTO/RegisterUserResponseDTO';  // Import DTO
import { GoogleLoginDTO } from '../../dto/requestDTO/GoogleLoginDTO';
const API_URL = 'http://localhost:8088/api/auth';

// Lấy token từ localStorage (nếu có)
const token = localStorage.getItem('token');

// Cấu hình axios để thêm Authorization header nếu token tồn tại
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export const registerUser = async (userDto: RegisterUserResponseDTO) => {
  console.log(userDto.toPlain());
  return await axios.post(`${API_URL}/register`, userDto.toPlain());  // Gửi dữ liệu đăng ký đã chuyển thành plain object
};
export const loginUser = async (loginData: { email: string; password: string }) => {
  return await axios.post(`${API_URL}/login`, loginData);  // Gửi dữ liệu đăng nhập
};

export const forgotPassword = async (email: string) => {
  return await axios.post(`${API_URL}/forgot-password`, { email });  // Gửi yêu cầu quên mật khẩu
};
// Xác minh OTP khi người dùng nhập OTP
export const verifyOtp = async (otpData: RegisterUserResponseDTO) => {
  return await axios.post(`${API_URL}/verify-otp`, otpData.toPlain());  // Gửi OTP để xác minh
};


export const googleLogin = async (googleCredential: string) => {
  const dto = new GoogleLoginDTO(googleCredential);
  const response = await axios.post(`${API_URL}/google`, dto.toPlain());
  return response.data;  // { token, user }
};
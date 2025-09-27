import axios from "axios";

// Tạo instance riêng
const api = axios.create({
  baseURL: "http://localhost:8088/api",
});

// Middleware: tự động thêm token vào headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface UpdateMyInfoRequest {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  phoneNumber: string;
}


export const getMyInfo = async () => {
  const response = await api.get("/myinfo");
  return response.data;
};

export const updateMyInfo = async (userInfo: UpdateMyInfoRequest) => {
  const response = await api.put("/myinfo", userInfo);
  return response.data;
};

export const updateMyAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file); // "image" phải trùng với multer.single('image')

  const response = await api.post("/myinfo/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/logout"); 
  return response.data; 
};
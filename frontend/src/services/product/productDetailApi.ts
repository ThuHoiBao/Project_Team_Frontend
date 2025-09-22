import axios from "axios";

// Tạo instance riêng
const api = axios.create({
    baseURL: "http://localhost:8088/api",
});

export const getProductDetail = async (id: string) => {
    const response = await api.get(`product/${id}`);
    return response.data
};
export const getSizes = async (id: string) => {
  const response = await api.get(`/product/size/${id}`);
  return response.data;
};

export const getProductByCategory = async (id: string) => {
  const response = await api.get(`/product/category/${id}`);
  return response.data;
};

export const getFullnameUserFeedback = async (id: string) => {
  const response = await api.get(`/product/feedback/user/${id}`);
  return response.data;
};
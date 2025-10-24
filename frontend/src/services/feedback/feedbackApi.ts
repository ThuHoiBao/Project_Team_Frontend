
// feedbackApi.ts
import axios from "axios";

export const submitBulkFeedback = async (formData: FormData) => {
  // Gửi request trực tiếp formData
  const res = await axios.post(
    "http://localhost:8088/api/feedback/bulk",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data;
};
export const getFeedbacksByOrder = async (orderId: string) => {
  const res = await axios.get(`http://localhost:8088/api/feedback/order/${orderId}`);
  return res.data;
}
// Tạo instance riêng
const api = axios.create({
    baseURL: "http://localhost:8088/api",
});

export const getBestFeedback = async () => {
    const response = await api.get("feedback/best");
    return response.data.data
}
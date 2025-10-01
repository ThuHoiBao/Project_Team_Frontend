import axios from "axios";

// Tạo instance riêng
const api = axios.create({
    baseURL: "http://localhost:8088/api",
});

export const getBestFeedback = async () => {
    const response = await api.get("feedback/best");
    return response.data.data
};
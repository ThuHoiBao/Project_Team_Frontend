import axios from "axios";

const API_URL = "http://localhost:8088/api/myinfo";


export const getMyInfo = async () => {
  try {
    const token = localStorage.getItem("token");  // lấy token
    if (!token) throw new Error("No token found");

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error fetching my info:", error.response?.data || error.message);
    throw error;
  }
};


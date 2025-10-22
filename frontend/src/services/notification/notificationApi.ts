// src/api/notificationApi.ts
import axios from "axios";

const API_URL = "http://localhost:8088/api/notifications";

export const getNotifications = async (userId: string) => {
  const res = await axios.get(`${API_URL}/${userId}`);
  return res.data;
};

export const markAsRead = async (id: string) => {
  const res = await axios.patch(`${API_URL}/${id}/read`);
  return res.data;
};

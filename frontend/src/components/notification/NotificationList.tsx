import React, { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "../../services/notification/notificationApi";
import { initSocket, getSocket } from "../../socket/socket";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationListProps {
  userId: string; 
}

const NotificationList: React.FC<NotificationListProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotis = async () => {
      try {
        const data = await getNotifications(userId);
        setNotifications(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách thông báo:", err);
      }
    };

    if (userId) fetchNotis();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const socket = initSocket(userId);
    socket.emit("register", userId);

    socket.on("notification", (noti: Notification) => {
      console.log("📩 Nhận thông báo mới:", noti);
      setNotifications((prev) => [noti, ...prev]);
    });

    return () => {
      socket.off("notification");
      socket.disconnect();
    };
  }, [userId]);

  // 🟣 Đánh dấu đã đọc
  const handleRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Lỗi markAsRead:", err);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md p-3 max-h-96 overflow-y-auto z-50">
      <h3 className="font-semibold mb-2">Thông báo</h3>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">Không có thông báo nào</p>
      ) : (
        notifications.map((noti) => (
          <div
            key={noti._id}
            className={`p-2 rounded-md mb-2 cursor-pointer transition ${
              noti.isRead ? "bg-gray-100" : "bg-blue-100"
            }`}
            onClick={() => handleRead(noti._id)}
          >
            <p className="font-lg">{noti.title}</p>
            <p className="text-sm text-gray-600">{noti.message}</p>
            <p className="text-xs text-gray-400">
              {new Date(noti.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList;

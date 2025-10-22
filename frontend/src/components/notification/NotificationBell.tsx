import React, { useEffect, useState } from "react";
import { getNotifications } from "../../services/notification/notificationApi";
import { getSocket, initSocket } from "../../socket/socket";
import { toast } from "react-toastify";

interface Notification {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  userId: string;
  onClick?: () => void;
}

const NotificationBell: React.FC<Props> = ({ userId, onClick }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
        
      const data = await getNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    };
    fetchData();

    const socket = initSocket(userId);

    socket?.on("notification", (noti: Notification) => {
      toast.info(`${noti.title}: ${noti.message}`);
      setNotifications((prev) => [noti, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket?.off("notification");
    };
  }, [userId]);

  return (
    <div className="relative">
      <button onClick={onClick} className="relative">
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationBell;

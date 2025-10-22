import React from "react";
import NotificationList from "./NotificationList";

interface Props {
  userId: string;
}

const NotificationPage: React.FC<Props> = ({ userId }) => {
  return (
    <div className="p-6">
      <NotificationList userId={userId} />
    </div>
  );
};

export default NotificationPage;

import React, { useState } from "react";
import "./ProfilePage.css";
import images from "../../assets/images";

function Profile() {
  const [avatar, setAvatar] = useState(images.noImage);
  const [name, setName] = useState("Phạm Nguyễn Tiến Mạnh");
  const [email] = useState("22110376@student.hcmute.edu.vn"); // email không đổi
  const [phone, setPhone] = useState("012345678");
  const [address, setAddress] = useState("123 Đường ABC, Quận XYZ");
  const [isEditing, setIsEditing] = useState(false); // trạng thái chỉnh sửa

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        if (ev.target?.result) {
          setAvatar(ev.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="profile-container">
      <div className="profile-card shadow-lg p-4 rounded">
        <div className="avatar-wrapper">
          <img src={avatar} alt="avatar" className="profile-avatar" />
            <label htmlFor="avatar-upload" className="avatar-upload-btn">
                <span className="btn-add-img">+</span>
            </label>
            <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
            />
        </div>

        <div className="profile-info">
            <div className="info-item">
                <label>Email:</label>
                <input type="email" value={email} readOnly />
            </div>
            <div className="info-item">
                <label>Tên:</label>
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readOnly={!isEditing}
                />
            </div>
            <div className="info-item">
                <label>SĐT:</label>
                <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                readOnly={!isEditing}
            />
            </div>
            <div className="info-item">
                <label>Địa chỉ:</label>
                <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                readOnly={!isEditing}
                />
          </div>
        </div>

        <button className="btn-primary mt-3" onClick={toggleEdit}>
          {isEditing ? "Lưu thông tin" : "Cập nhật thông tin"}
        </button>
      </div>
    </div>
  );
}

export default Profile;

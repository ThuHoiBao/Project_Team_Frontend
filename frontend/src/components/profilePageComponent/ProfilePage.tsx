import React, { useEffect, useState } from "react";
import "./ProfilePage.css";
import images from "../../assets/images";
import { getMyInfo } from "../../services/user/getMyInfoApi";
import { AxiosError } from "axios";

function Profile() {
  const [avatar, setAvatar] = useState(images.noImage);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(""); // email không đổi
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false); // trạng thái chỉnh sửa

  useEffect(()=>{
    const getInfoResponse = async()=>{
      try{
        const data = await getMyInfo();
        setLastName(data.lastName);
        setFirstName(data.firstName);
        setEmail(data.email || "");
        setAddress(data.address || "");
        setPhone(data.phone || "");
      }
      catch(error){
        if (error instanceof AxiosError) {
          console.error("API error:", error.response?.data);
        } else {
        console.error("Unexpected error:", error);
        } 
      }
    }

    getInfoResponse()
  }, [])

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
                <label>Họ:</label>
                <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                readOnly={!isEditing}
                />
            </div>
            <div className="info-item">
                <label>Tên:</label>
                <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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

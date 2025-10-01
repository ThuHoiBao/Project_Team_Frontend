import React, { useEffect, useState } from "react";
import images from "../../assets/images";
import { getMyInfo, updateMyAvatar, updateMyInfo } from "../../services/user/myInfoApi";
import { AxiosError } from "axios";
import classNames from 'classnames/bind';
import styles from './ProfilePage.module.scss'; // Sửa từ .css thành .module.scss

const cx = classNames.bind(styles);

function Profile() {
  const [avatar, setAvatar] = useState<string>(images.noImage);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const getInfoResponse = async () => {
      try {
        const data = await getMyInfo();
        setAvatar(data.image);
        setLastName(data.lastName);
        setFirstName(data.firstName);
        setEmail(data.email || "");
        setAddress(data.address || "");
        setPhone(data.phoneNumber || "");
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error("API error:", error.response?.data);
        } else {
          console.error("Unexpected error:", error);
        }
      }
    };
    getInfoResponse();
  }, []);

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);
      const updatedUser = await updateMyInfo({
        email,
        firstName,
        lastName,
        address,
        phoneNumber: phone,
      });
      setSuccess("Cập nhật thành công!");
      setIsEditing(false);
      setFirstName(updatedUser.firstName || firstName);
      setLastName(updatedUser.lastName || lastName);
      setAddress(updatedUser.address || address);
      setPhone(updatedUser.phoneNumber || phone);
      console.log("Updated:", updatedUser);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi cập nhật!";
      setError(msg);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);

    try {
      const res = await updateMyAvatar(file);
      setSuccess("Cập nhật avatar thành công!");
      console.log("Updated user:", res.user);
    } catch (err: any) {
      setError(err.message || "Upload avatar thất bại!");
    }
  };

  return (
    <div className={cx("profile-container")}>
      {error && (
        <div className={cx("alert", "alert-danger", "alert-dismissible")}>
          <strong>Error!</strong>{error}
          <button
            type="button"
            className={cx("btn-close")}
            data-bs-dismiss="alert"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {success && (
        <div className={cx("alert", "alert-success", "alert-dismissible")}>
          <strong>Success!</strong>{success}
          <button
            type="button"
            className={cx("btn-close")}
            data-bs-dismiss="alert"
            onClick={() => setSuccess(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <div className={cx("profile-card", "shadow-lg", "p-4", "rounded")}>
        <div className={cx("avatar-wrapper")}>
          <img src={avatar || images.noImage} alt="avatar" className={cx("profile-avatar")} />
          <label htmlFor="avatar-upload" className={cx("avatar-upload-btn")}>
            <span className={cx("btn-add-img")}>+</span>
          </label>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>

        <div className={cx("profile-info")}>
          <div className={cx("info-item")}>
            <label>Email:</label>
            <input type="email" value={email} readOnly />
          </div>
          <div className={cx("info-item")}>
            <label>Họ:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className={cx("info-item")}>
            <label>Tên:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className={cx("info-item")}>
            <label>SĐT:</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              readOnly={!isEditing}
            />
          </div>
          <div className={cx("info-item")}>
            <label>Địa chỉ:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              readOnly={!isEditing}
            />
          </div>
        </div>

        {isEditing ? (
          <div className={cx("button-group")}>
            <button className={cx("btn", "btn-primary", "me-2")} onClick={handleSave}>
              Lưu thông tin
            </button>
            <button className={cx("btn", "btn-secondary")} onClick={() => setIsEditing(false)}>
              Hủy
            </button>
          </div>
        ) : (
          <button className={cx("btn", "btn-primary", "mt-3")} onClick={() => setIsEditing(true)}>
            Cập nhật thông tin
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;
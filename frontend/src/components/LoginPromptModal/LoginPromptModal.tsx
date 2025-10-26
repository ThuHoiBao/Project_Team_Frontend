import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPromptModal.css";

interface LoginPromptModalProps {
  show: boolean;
  onClose: () => void;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ show, onClose }) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Bạn chưa đăng nhập</h2>
        <p>Vui lòng đăng nhập để thêm sản phẩm vào Wishlist.</p>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>
            Hủy
          </button>
          <button
            className="login-btn"
            onClick={() => {
              onClose();
              navigate("/register");
            }}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;

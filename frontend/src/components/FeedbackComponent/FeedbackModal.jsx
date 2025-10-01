import React, { useState } from "react";
import FeedbackItem from "./FeedbackItem";
import "./feedback.css";

const FeedbackModal = ({ orderItems, onClose, onSubmit }) => {
  const [feedbacks, setFeedbacks] = useState({});
  const [showGuide, setShowGuide] = useState(false);


  const handleItemChange = (orderItemId, data) => {
    setFeedbacks((prev) => ({ ...prev, [orderItemId]: { ...data, orderItemId } }));
  };

  const handleSubmit = () => {
    const list = Object.values(feedbacks);
    console.log(list)
    onSubmit(list);
  };

  return (
<div className="app-modal-overlay">
  <div className="app-modal feedback-modal">
    {/* header */}
    <div className="feedback-header">
      <h3>Đánh giá sản phẩm</h3>
    </div>

    <div className="feedback-guide" onClick={() => setShowGuide(true)}>
      <span className="icon">💰</span>
      <span>
        Xem Hướng dẫn đánh giá chuẩn để nhận đến 
        <span className="highlight"> 200 xu!</span>
      </span>
      <span className="arrow">▼</span>
    </div>

    {/* body */}
    <div className="feedback-body">
      <div className="feedback-list">
        {orderItems.map((item) => (
          <FeedbackItem key={item.id} item={item} onChange={handleItemChange} />
        ))}
      </div>
    </div>

    {/* footer */}
    <div className="modal-buttons">
      <button onClick={onClose}>Trở lại</button>
      <button className="btn-feedback" onClick={handleSubmit}>Hoàn thành</button>
    </div>
  </div>
  {showGuide && (
  <div className="guide-modal-overlay">
    <div className="guide-modal">
      <h4>Điều kiện nhận Xu</h4>
      <p>Viết nhận xét với ít nhất 50 ký tự, kèm hình ảnh để nhận Xu bạn nhé !</p>

      <h4>Xu thưởng cho đánh giá hợp lệ</h4>
      <ul>
        <li>Nhập ít nhất 50 ký tự kèm 1 hình ảnh.<b>100 Xu</b></li>
        <li>Nhập ít nhất 50 ký tự kèm nhiều hơn 1 hình ảnh.<b>200 Xu</b></li>
      </ul>

      <div className="guide-note">
        <p>* Trong 1 đơn hàng có nhiều sản phẩm, bạn chỉ được nhận Xu cho từng sản phẩm nếu thỏa điều kiện.</p>
        
      </div>

      <div className="guide-footer">
        <button onClick={() => setShowGuide(false)}>Đóng</button>
      </div>
    </div>
  </div>
)}

</div>
  
  );
};

export default FeedbackModal;

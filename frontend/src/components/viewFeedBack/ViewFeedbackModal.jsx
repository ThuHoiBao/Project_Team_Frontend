import React from "react";
import ViewFeedbackItem from "./ViewFeedbackItem";
import "./viewFeedback.css";

const ViewFeedbackModal = ({ feedbacks, onClose }) => {
  return (
    <div className="app-modal-overlay-viewFeedback">
      <div className="app-modal-viewFeedback feedback-view-modal-viewFeedback">
        <div className="feedback-header-viewFeedback">
          <h3 >Đánh Giá Shop</h3>
        </div>

        <div className="feedback-list-viewFeedback">
          {feedbacks.map((fb, idx) => (
            <ViewFeedbackItem key={idx} feedback={fb} />
          ))}
        </div>

        <div className="modal-buttons-viewFeedback">
          <button onClick={onClose}>Trở lại</button>
        </div>
      </div>
    </div>
  );
};

export default ViewFeedbackModal;

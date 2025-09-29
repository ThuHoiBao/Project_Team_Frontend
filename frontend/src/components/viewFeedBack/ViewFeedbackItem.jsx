import React from "react";
import "./viewFeedback.css";

const ViewFeedbackItem = ({ feedback }) => {
  return (
    <div className="feedback-item-view-viewFeedback">
      {/* product info */}
      <div className="product-info-viewFeedback">
        <img
          src={feedback.imageProduct}
          alt={feedback.productName}
          className="product-img-viewFeedback"
        />
        <div className="product-text-viewFeedback">
          <p className="product-name-viewFeedback">{feedback.productName}</p>
          {feedback.productOption && (
            <p className="product-option-viewFeedback">Phân loại hàng: {feedback.productOption}</p>
          )}
        </div>
      </div>

      <div className="feedback-body-viewFeedback">
        {/* user info */}
        <div className="user-info-viewFeedback">
          <img
            src={feedback.imageUser || "/default-avatar.png"}
            alt="user"
            className="user-avatar-viewFeedback"
          />
          <div>
            <p className="username-viewFeedback">{feedback.userName}</p>
            <div className="rating-viewFeedback">
              {"★".repeat(Number(feedback.rating))}
              {"☆".repeat(5 - Number(feedback.rating))}
            </div>
          </div>
        </div>

        {feedback.comment && (
          <p className="comment-viewFeedback">
            <span className="comment-label-viewFeedback">Chất lượng sản phẩm:</span>{" "}
            <span className="comment-text-viewFeedback">{feedback.comment}</span>
          </p>
        )}


        {/* feedback images */}
        {feedback.imageFeedbacks?.length > 0 && (
          <div className="feedback-images-viewFeedback">
            {feedback.imageFeedbacks.map((img, i) => (
              <img key={i} src={img} alt="feedback-viewFeedback" className="feedback-img-viewFeedback" />
            ))}
          </div>
        )}

        {/* date */}
        <span className="date-feedback-viewFeedback">
          {new Date(feedback.date).toLocaleString("vi-VN")}
        </span>
      </div>
    </div>
  );
};

export default ViewFeedbackItem;

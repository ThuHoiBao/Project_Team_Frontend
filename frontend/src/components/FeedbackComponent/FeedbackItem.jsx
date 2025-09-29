import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const FeedbackItem = ({ item, onChange }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [showUsername, setShowUsername] = useState(true); // ✅ mặc định check
  

  const ratingText = ["Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files];
    setImages(newImages);
    onChange(item.id, { rating, comment, images: newImages, showUsername });
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onChange(item.id, { rating, comment, images: newImages, showUsername });
  };

  const handleRating = (r) => {
    setRating(r);
    onChange(item.id, { rating: r, comment, images, showUsername });
  };

  const handleComment = (e) => {
    const val = e.target.value;
    setComment(val);
    onChange(item.id, { rating, comment: val, images, showUsername });
  };

  const handleShowUsername = (e) => {
    const checked = e.target.checked;
    setShowUsername(checked);
    onChange(item.id, { rating, comment, images, showUsername: checked });
  };

  return (
    <div className="feedback-item">
      {/* product info */}
      <div className="product-info">
        <img src={item.image} alt={item.productName} className="product-img" />
        <h4 className="product-name">{item.productName}</h4>  
      </div>
      

      {/* rating */}
      <div className="rating-row">
        <span className="label">Chất lượng sản phẩm</span>
        <div className="rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRating(star)}
              className={star <= rating ? "star active" : "star"}
            >
              ★
            </span>
          ))}
          <span className="rating-text">
            {rating > 0 ? ratingText[rating - 1] : ""}
          </span>
        </div>
      </div>

      {/* comment */}
      <textarea
        placeholder="Hãy chia sẻ cảm nhận về sản phẩm"
        value={comment}
        onChange={handleComment}
      />

      {/* upload */}
      <label className="upload-btn">
        + Thêm hình ảnh
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          hidden
        />
      </label>

      {/* preview images */}
      <div className="preview">
        {images.map((file, idx) => (
          <div className="preview-wrapper" key={idx}>
            <img src={URL.createObjectURL(file)} alt="preview" />
            <button
              className="remove-btn"
              onClick={() => handleRemoveImage(idx)}
            >
              <FaTimes size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* show username option */}
      <div className="show-username">
        <label>
          <input
            type="checkbox"
            checked={true}
          />
          Hiển thị tên đăng nhập trên đánh giá này
        </label>
        <p className="sub-text">
          Tên tài khoản sẽ được hiển thị khi đánh giá<b>{item.username}</b>
        </p>
      </div>
    </div>
  );
};

export default FeedbackItem;

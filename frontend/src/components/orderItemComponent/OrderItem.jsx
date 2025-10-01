import React from 'react';
import './OrderItem.css';

const OrderItem = ({ item }) => {
  // Định dạng giá theo định dạng VNĐ
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(item.price);

  return (
    <div className="order-item">
      <img src={item.image} alt={item.productName} className="order-item-img" />
      <div className="order-item-info">
        <h4>{item.productName}</h4>
        <p>x{item.quantity}</p>
        <p>Size: {item.size}</p>
        <p>Giá: <span className="price">{formattedPrice} VNĐ</span></p>
      </div>
    </div>
  );
};

export default OrderItem;

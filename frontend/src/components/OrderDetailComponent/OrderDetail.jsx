import React from 'react';
import './OrderDetail.css';
import { OrderRequestDTO } from '../../dto/requestDTO/OrderRequestDTO';  // Import DTO
import { OrderItemRequestDTO } from '../../dto/requestDTO/OrderItemRequestDTO';  // Import DTO
import Footer from '../commonComponent/Footer';
import AdBanner from '../AddBannerComponent/AddBanner';
import { useLocation } from 'react-router-dom';
const OrderDetail = () => {
    const location = useLocation();
  const { order, orderItems } = location.state;
 
  console.log(order)
  console.log(orderItems)
  
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(order.totalPrice);

  const getOrderStatusMessage = (status) => {
    switch (status) {
      case 'ORDERED':
        return 'Đơn hàng của bạn đã được đặt thành công';
      case 'CONFIRMED':
        return 'Đơn hàng của bạn đã được xác nhận';
      case 'SHIPPED':
        return 'Đơn hàng của bạn đang được vận chuyển';
      case 'COMPLETED':
        return 'Đơn hàng của bạn đã được nhận thành công';
      case 'FEEDBACKED':
        return 'Đơn hàng đã được đánh giá';
      default:
        return 'Trạng thái không xác định';
    }
  };
  const getMethodPayment = (methodPayment)=>{
    switch(methodPayment){
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'VNPAY':
        return 'Thanh toán qua VNPAY';
      case 'COIN' :
        return 'Thanh toán bằng Coin tích trữ';
    }
  }
  console.log(order.methodPayment);
  return (
    <div>
      <AdBanner></AdBanner>
      
      <div className="order-detail">
        <div className="status-line-divider"></div>
        <div className="order-header">
          <h3>Mã đơn hàng: {order.id}</h3>
        </div>
        <div className='date-order' >  Ngày đặt hàng: <span className='date'>{new Intl.DateTimeFormat('vi-VN').format(new Date(order.orderDate))}</span></div>
  {/* Đường line giữa header và order status */}
        <div className="status-line-divider"></div>
        <div className="order-status-container">
          {['ORDERED', 'CONFIRMED', 'SHIPPED', 'COMPLETED','FEEDBACKED'].map((status, index) => {
            // Kiểm tra trạng thái hiện tại và xem trạng thái trước đó có được hoàn thành chưa
            const isActive = order.orderStatus === status || index < ['ORDERED', 'CONFIRMED', 'SHIPPED','COMPLETED','FEEDBACKED'].indexOf(order.orderStatus) + 1;

            return (
              <div key={status} className="status-item">
                <div
                  className={`status-dot ${isActive ? 'active' : ''}`}
                />
                {/* Tạo line nối chỉ từ trạng thái trước đó và giảm số line đi 1 */}
                {index > 0 && (
                  <div
                    className={`status-line ${isActive ? 'active' : ''}`}
                  />
                )}
                <span className={`status-text ${isActive ? 'active' : ''}`}>
                  {getOrderStatusMessage(status)}
                </span>
                {/* <span className="order-date">Expected by Mon, 16th</span> */}
              </div>
            );
          })}
        </div>
  
        {/* Danh sách các sản phẩm */}
        <div className="order-items">
          {orderItems.map(item => (
            <div key={item.id} className="order-item">
              <img src={item.image} alt={item.productName} className="order-item-img" />
              <div className="order-item-info">
                <h4>{item.productName}</h4>
                <p>x{item.quantity}</p>
                <p>Size: {item.size}</p>
                <p>Giá: <span className="price">{new Intl.NumberFormat('vi-VN').format(item.price)} VNĐ</span></p>
              </div>
            </div>
          ))}
        </div>

        {/* Thông tin tổng quan đơn hàng */}
        {/* Đường line giữa header và order status */}
      <div className="status-line-divider"></div>
      <div className="order-summary-container">
        <div className="order-summary-row">
          <div className="summary-item">
            <h4>Phương thức thanh toán</h4>
            <ul>
              <li>{getMethodPayment(order.paymentMethod)}</li>
            </ul>
            
          </div>
          <div className="summary-item">
            <h4>Thông tin vận chuyển</h4>
            <ul>
              <li><span className='title'>Địa chỉ:</span> {order.address}</li>
              <li><span className='title'>Khách hàng: </span>{order.nameUser}</li>
              <li><span className='title'>Số điện thoại: </span>{order.phoneNumber}</li>
            </ul>
          </div>
        </div>
      <div className="status-line-divider"></div>

        <div className="order-summary-row">
          <div className="summary-item">
            <h4>Hỗ trợ</h4>
            <ul>
              <li>Order Issues</li>
              <li>Delivery Info</li>
              <li>Returns</li>
            </ul>
          </div>
          <div className="summary-item">
            <h4>Đơn hàng</h4>
            <ul>
              <li> <span className='title'>Tổng tiền hàng : </span><span className="price">{new Intl.NumberFormat('vi-VN').format(order.totalPrice)} VNĐ</span></li>
              <li><span className='title'>Discount:</span> <span className="price">{new Intl.NumberFormat('vi-VN').format(order.discount)} VNĐ</span></li>
              <div className="status-line-total"></div>
              <li><span className='title'>Thành tiền:</span> <span className="price">{new Intl.NumberFormat('vi-VN').format(order.amount)} VNĐ</span></li>
            </ul>
          </div>
        </div>
      </div>

      </div>
      <Footer></Footer>
  </div>
  );
};

export default OrderDetail;

import React, { useState } from 'react';
import OrderItem from '../orderItemComponent/OrderItem';
import './Order.css';
import imageOrder from '../../images/order.png';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { cancelOrderApi } from '../../services/order/order';  // Thêm useNavigate
import imageCanceled from '../../images/cancelled.png'
import FeedbackModal  from "../FeedbackComponent/FeedbackModal";
import { submitBulkFeedback ,getFeedbacksByOrder } from "../../services/feedback/feedbackApi";
import ViewFeedbackModal from "../viewFeedBack/ViewFeedbackModal";



// Modal Component với fade-in
const AppModal = ({ message, onClose }) => (
  <div className="app-modal-overlay">
    <div className="app-modal">
      <p>{message}</p>
        <button onClick={onClose} className='btn-feedback'>Đóng</button>
    </div>
  </div>
);
// Modal xác nhận
const ConfirmModal = ({ message, onConfirm, onClose }) => (
  <div className="app-modal-overlay">
    <div className="app-modal">
      <p>{message}</p>

      {/* Icon hiển thị dưới message */}
      <img 
        src={imageCanceled}  // thay link icon bạn lấy trên mạng
        alt="Cancel Icon" 
        className="modal-icon"
      />
      <div className="modal-buttons">
        <button onClick={onClose}>Hủy</button>
        <button onClick={onConfirm} className="btn-feedback">Xác nhận</button>
      </div>
    </div>
  </div>
);

const Order = ({ order, orderItems, userId ,onOrderUpdate  }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState(null);
  console.log(userId);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [showViewFeedbackModal, setShowViewFeedbackModal] = useState(false);
const handleSubmitFeedback = async (feedbackList) => {
  try {
    const formData = new FormData();

    feedbackList.forEach((fb, index) => {
      formData.append(`feedbacks[${index}].comment`, fb.comment);
      formData.append(`feedbacks[${index}].rating`, fb.rating.toString());
      formData.append(`feedbacks[${index}].orderItemId`, fb.orderItemId);
      formData.append(`feedbacks[${index}].userId`, userId);
      formData.append(`feedbacks[${index}].orderId`, order.id);

      fb.images.forEach((img) => {
        formData.append(`feedbacks[${index}].images`, img);
      });
    });

    const result = await submitBulkFeedback(formData); // chỉ truyền formData
    console.log("Server response:", result);

    openModal("Cảm ơn bạn đã đánh giá");
    setShowFeedbackModal(false);
    // 🔥 gọi lại API từ cha để reload danh sách
    if (typeof onOrderUpdate === "function") {
      onOrderUpdate();
    }
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || "Có lỗi xảy ra";
    openModal(errorMessage);
  }
};
  const handleViewFeedback = async () => {
    try {
      const res = await getFeedbacksByOrder(order.id);
      setFeedbacks(res); // BE trả về array DTO
      setShowViewFeedbackModal(true);
    } catch (err) {
      console.error("Lỗi khi load feedback:", err);
    }
  };
const navigate = useNavigate();  // Khai báo navigate
  // Lấy thông báo trạng thái đơn hàng
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
      case 'CANCELLED':
        return 'Đơn hàng của bạn đã được hủy';
      case 'FEEDBACKED':
        return 'Đơn hàng đã được đánh giá';
      default:
        return 'Trạng thái không xác định';
    }
  };

  const formattedPrice = new Intl.NumberFormat('vi-VN').format(order.amount);

  // Mở modal với thông điệp
  const openModal = (message) => {
    console.log(message);  // Log message
    setModalMessage(message);
    setShowModal(true);
  };
  // Hàm chuyển hướng khi click vào đơn hàng
const handleItemClick = () => {
  navigate('/order-detail', {
    state: { 
      order: { ...order }, 
      orderItems: orderItems.map(item => ({ ...item })) 
    }
  });
};

  // Render các button theo trạng thái đơn hàng
  const renderButtons = (status) => {
    switch (status) {
      case 'ORDERED':
      return (
          <button className="btn-cancel" onClick={() => setCancelOrderId(order.id)}>
            Hủy đơn
          </button>
        );
      case 'COMPLETED':
        return (
          <>
          <button className="btn-buy-again" onClick={() => openModal("Bạn đã mua lại thành công")}>
            Mua lại
          </button>
          <button className="btn-feedback" onClick={() => setShowFeedbackModal(true)}>
            Viết đánh giá
          </button>
        </>
        );

      case 'CANCELLED':
        return <button className="btn-buy-again" onClick={() => openModal('Bạn đã mua lại thành công')}>Mua lại</button>;

      case 'FEEDBACKED':
        return (
          <>
            <button className="btn-buy-again" onClick={() => openModal('Bạn đã mua lại thành công')}>Mua lại</button>
             <button className="btn-view-feedback" onClick={handleViewFeedback}>
              Xem đánh giá
            </button>
          </>
        );

      default:
        return null;  // Các trạng thái khác (CONFIRMED, SHIPPED) không có nút
    }
  };

  return (
    <div className="order">
      <div className="order-header">
        <h3>
          <div className='title-header'>Mã đơn hàng: <span>{order.id}</span></div>
        </h3>
        <h3>
          <div className='title-header'>Ngày đặt hàng: 
          <span> {new Intl.DateTimeFormat('vi-VN').format(new Date(order.orderDate))}</span></div>
        </h3>
      </div>
      {/* Trạng thái đơn hàng */}
      <div className="order-status-container">
      
        <span className="order-status"><img src={imageOrder} alt="Order Icon" className="order-status-icon" />{getOrderStatusMessage(order.orderStatus)}</span>
      </div>

      {/* Danh sách sản phẩm */}
      {/* <div className="order-items">
        {orderItems.map((item) => (
          <OrderItem key={item.id} item={item} />
        ))}

      </div> */}
      <div className="order-items">
        {orderItems.map(item => (
          <div key={item.id} onClick={handleItemClick}> 
             <OrderItem key={item.id} item={item}></OrderItem>
          </div>
        ))}
      </div>

      {/* Thành tiền và các button tương ứng */}
      <div className="order-total">
        <div>
          Tổng tiền: <span className="price">{formattedPrice} VNĐ</span>
        </div>
        <div className="order-buttons">{renderButtons(order.orderStatus)}</div>
      </div>

      {/* Hiển thị modal khi click */}
      {showModal && <AppModal message={modalMessage} onClose={() => setShowModal(false)} />}

        {cancelOrderId && (
        <ConfirmModal
          message="Bạn có chắc chắn muốn hủy đơn hàng này không?"
          onClose={() => setCancelOrderId(null)}
          onConfirm={async () => {
            try {
              await cancelOrderApi(userId, cancelOrderId);
              setCancelOrderId(null);
              openModal("Đơn hàng đã được hủy thành công");
               // 🔥 gọi lại API từ cha để reload danh sách
              if (typeof onOrderUpdate === "function") {
                onOrderUpdate();
              }
            } catch (err) {
              console.error(err);
              setCancelOrderId(null);
              openModal("Có lỗi xảy ra khi hủy đơn hàng");
            }
          }}
        />
      )}
       {showFeedbackModal && (
        <FeedbackModal
          orderItems={orderItems}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleSubmitFeedback}
        />
      )}
      {showViewFeedbackModal && (
        <ViewFeedbackModal
          feedbacks={feedbacks}
          onClose={() => setShowViewFeedbackModal(false)}
        />
      )}
    </div>
  );
};

export default Order;

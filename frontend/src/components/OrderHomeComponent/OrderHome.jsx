import React, { useState, useEffect } from 'react';
import Order from '../orderComponent/Order';  // Đảm bảo đường dẫn chính xác
import { OrderRequestDTO } from '../../dto/requestDTO/OrderRequestDTO';  // Import DTO
import { OrderItemRequestDTO } from '../../dto/requestDTO/OrderItemRequestDTO';  // Import DTO
import './OrderHome.css';  // Thêm CSS cho OrderHome
import Footer from '../commonComponent/Footer';
import Header from '../commonComponent/Header';
import AdBanner from '../AddBannerComponent/AddBanner';
import { getOrdersByUserId } from '../../services/order/order';
const OrderHome = () => {
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [userId, setUserId] = useState('');
  const [orders, setOrders] = useState([]);
  const filteredOrders = orders.filter(order =>
    statusFilter === 'Tất cả' || order.orderStatus === statusFilter
  );
  const fetchOrders = async () => {
    try {
      const data = await getOrdersByUserId();
      setOrders(data.orders);
      setUserId(data.userId)
    } catch (error) {
      console.error("Lỗi khi gọi API orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  return (
    <div>
      <Header></Header>
      <AdBanner></AdBanner>
    <div className="order-list">
      {/* Thanh trạng thái để lọc đơn hàng */}
      <div className="order-status-filter">
        <button onClick={() => setStatusFilter('Tất cả')} className={statusFilter === 'Tất cả' ? 'active' : ''}>Tất cả</button>
        <button onClick={() => setStatusFilter('ORDERED')} className={statusFilter === 'ORDERED' ? 'active' : ''}>Đã đặt hàng</button>
        <button onClick={() => setStatusFilter('CONFIRMED')} className={statusFilter === 'CONFIRMED' ? 'active' : ''}>Đã xác nhận</button>
        <button onClick={() => setStatusFilter('SHIPPED')} className={statusFilter === 'SHIPPED' ? 'active' : ''}>Đang giao</button>
        <button onClick={() => setStatusFilter('COMPLETED')} className={statusFilter === 'COMPLETED' ? 'active' : ''}>Hoàn thành</button>
        <button onClick={() => setStatusFilter('CANCELLED')} className={statusFilter === 'CANCELLED' ? 'active' : ''}>Đã hủy</button>
        <button onClick={() => setStatusFilter('FEEDBACKED')} className={statusFilter === 'FEEDBACKED' ? 'active' : ''}>Đã phản hồi</button>
      </div>
      {/* Danh sách các đơn hàng lọc theo trạng thái */}
      <div className="order-items-list">
        {filteredOrders.map(order => (
          <Order key={order.id} order={order} orderItems={order.orderItems} userId ={userId} onOrderUpdate={fetchOrders} />
        ))}
      </div>
    </div>
    <Footer></Footer>
    </div>
  );
};

export default OrderHome;

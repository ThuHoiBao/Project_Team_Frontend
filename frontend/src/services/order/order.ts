import axios from 'axios';
import { OrderRequestDTO } from '../../dto/requestDTO/OrderRequestDTO';
import { OrderItemRequestDTO } from '../../dto/requestDTO/OrderItemRequestDTO';

// Tạo instance riêng
const api = axios.create({
  baseURL: "http://localhost:8088/api",
});

// Middleware: tự động thêm token vào headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Gọi API lấy danh sách order theo userId
export const getOrdersByUserId = async (): Promise<any> => {
  const response = await api.get(`/orders/user`);  // Lấy dữ liệu từ API
  console.log(response);

  const userId = response.data.userId;  // Lấy userId từ response
  console.log("userId:  " + userId);

  // Trả về đối tượng chứa cả userId và danh sách đơn hàng
  const orders = response.data.orders.map((orderResponse: any) => {
    const dto = new OrderRequestDTO();
    dto.id = orderResponse.id;
    dto.orderStatus = orderResponse.orderStatus;
    dto.totalPrice = orderResponse.totalPrice;
    dto.nameUser = orderResponse.nameUser;
    dto.address = orderResponse.address;
    dto.paymentMethod = orderResponse.paymentMethod;
    dto.discount = orderResponse.discount;
    dto.orderDate = new Date(orderResponse.orderDate);
    dto.phoneNumber = orderResponse.phoneNumber;
    dto.amount = orderResponse.amount;
    dto.cancellationReason = orderResponse.cancellationReason;

    // Map các orderItems
    dto.orderItems = orderResponse.orderItems.map((item: any) => {
      const itemDTO = new OrderItemRequestDTO();
      itemDTO.id = item.id;
      itemDTO.productName = item.productName;
      itemDTO.price = item.price;
      itemDTO.image = item.image;
      itemDTO.quantity = item.quantity;
      itemDTO.size = item.size;
      return itemDTO;
    });

    const orderPlain = dto.toPlain();
    console.log("Plain DTO:", orderPlain);
    return orderPlain;
  });

  // Trả về đối tượng chứa userId và các orders
  return {
    userId: userId,
    orders: orders
  };
};

// Hủy đơn hàng
export const cancelOrderApi = async (userId: string, orderId: string) => {
  const response = await api.post(`/orders/cancel`, {
    userId,
    orderId,
  });
  return response.data;
};

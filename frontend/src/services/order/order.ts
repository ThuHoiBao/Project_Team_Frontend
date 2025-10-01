import axios from 'axios';
import { OrderRequestDTO } from '../../dto/requestDTO/OrderRequestDTO';
import { OrderItemRequestDTO } from '../../dto/requestDTO/OrderItemRequestDTO';

const API_URL = 'http://localhost:8088/api';

// Gọi API lấy danh sách order theo userId
export const getOrdersByUserId = async (userId: string): Promise<any[]> => {
  const response = await axios.get(`${API_URL}/orders/user/${userId}`);
  console.log(response);

  return response.data.map((orderResponse: any) => {
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

    // Map orderItems
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
};
// Hủy đơn hàng
export const cancelOrderApi = async (userId: string, orderId: string) => {
  const response = await axios.post(`${API_URL}/orders/cancel`, {
    userId,
    orderId,
  });
  return response.data;
};

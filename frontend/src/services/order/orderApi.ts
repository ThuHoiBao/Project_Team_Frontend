import axios from "axios";

// Your Axios instance
const api = axios.create({
  baseURL: "http://localhost:8088/api",
});

const getToken = () => localStorage.getItem('token');

// Interface for the payload to create an order
interface CreateOrderApiPayload {
    shippingAddressId: string;
    paymentMethod: string; 
    orderItems: {
        productId: string | number;
        name: string;
        quantity: number;
        price: number;
        image?: string;
        size: string;
    }[];
    couponCode?: string | null;
    coinsApplied: number;
}

// Interface for the response after creating an order
interface CreateOrderApiResponse {
    message: string;
    orderId: string;
    totalPrice: number;
}

// Function to create the preliminary order
export const createOrder = async (payload: CreateOrderApiPayload): Promise<CreateOrderApiResponse> => {
    const token = getToken();
    if (!token) throw new Error("User not authenticated.");

    try {
        const response = await api.post<CreateOrderApiResponse>('/orders', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data; 
    } catch (error: any) {
        console.error("Failed to create order:", error.response?.data || error.message || error);
        throw new Error(error.response?.data?.message || "Could not place the order.");
    }
};

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8088/api", 
});

export interface AddToCartPayload {
  productId: string;
  size: string;
  quantity: number;
}

export interface CartItemInfo {
  id: string; 
  _id?: string; 
  product: {
    id: string;
    _id: string;
    productName: string; 
    price: number;
    image?: string; 
  };
  quantity: number;
  size: string;
  availableStock: number; 
}

interface CartApiResponse {
    message: string;
    cartItems: CartItemInfo[]; 
}

interface AddToCartResponse {
  message: string;
  cartItem: { 
      _id: string;
      product: string | { productName: string; price: number };
      quantity: number;
      size: string;
  };
}

const getToken = () => localStorage.getItem('token');

const handleError = (error: any, defaultMessage: string): Error => {
    console.error(defaultMessage, error);
    if (axios.isAxiosError(error) && error.response) {
      return new Error(error.response.data?.message || defaultMessage);
    }
    return new Error(defaultMessage);
};

export const getCartItems = async (): Promise<CartItemInfo[]> => {
  const token = getToken();
  if (!token) {
    console.warn("No token found, returning empty cart.");
    return [];
  }
  try {
    const response = await api.get<CartApiResponse>('/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Trả về mảng cartItems
    return response.data?.cartItems || [];
  } catch (error) {
    console.error("Failed to fetch cart items:", error);
    return []; 
  }
};

export const addToCart = async (
  payload: AddToCartPayload
): Promise<AddToCartResponse> => {
  const token = getToken();
  if (!token) {
    throw new Error("User not logged in. Please log in.");
  }
  try {
    const response = await api.post<AddToCartResponse>("/cart", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw handleError(error, "Failed to add item to cart.");
  }
};

export const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    const token = getToken();
    if (!token) throw new Error("User not logged in.");

    try {
        const response = await api.patch(`/cart/${itemId}`, { quantity }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw handleError(error, "Failed to update quantity.");
    }
};

export const removeCartItem = async (itemId: string) => {
    const token = getToken();
    if (!token) throw new Error("User not logged in.");

    try {
        const response = await api.delete(`/cart/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw handleError(error, "Failed to remove item.");
    }
};
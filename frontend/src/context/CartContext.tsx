import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { getCartItems, addToCart as addToCartApi, CartItemInfo } from '../services/cart/cartApi'; 


interface CartContextType {
    cartItems: CartItemInfo[];
    isLoadingCart: boolean;
    errorCart: string | null;
    fetchCart: () => Promise<void>; 
    addItemToCart: (productId: string, size: string, quantity: number) => Promise<void>; 
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cartItems, setCartItems] = useState<CartItemInfo[]>([]);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [errorCart, setErrorCart] = useState<string | null>(null);
    const token = localStorage.getItem('token'); // Lấy token

    // Hàm fetch giỏ hàng (dùng useCallback để tránh tạo lại hàm)
    const fetchCart = useCallback(async () => {
        if (!token) {
            setCartItems([]);
            setIsLoadingCart(false);
            return;
        }
        setIsLoadingCart(true);
        setErrorCart(null);
        try {
            const items = await getCartItems();
            setCartItems(items || []);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
            setErrorCart("Could not load cart.");
            setCartItems([]);
        } finally {
            setIsLoadingCart(false);
        }
    }, [token]); // Phụ thuộc vào token

    // Fetch giỏ hàng khi Provider được mount hoặc token thay đổi
    useEffect(() => {
        fetchCart();
    }, [fetchCart]); // Chỉ fetch lại khi hàm fetchCart thay đổi (tức là khi token thay đổi)

    // Hàm thêm sản phẩm vào giỏ hàng
    const addItemToCart = async (productId: string, size: string, quantity: number) => {
        // Có thể thêm loading state riêng cho hành động này nếu muốn
        setErrorCart(null);
        try {
            await addToCartApi({ productId, size, quantity });
            // Sau khi thêm thành công, fetch lại giỏ hàng để cập nhật state
            await fetchCart();
            // Không cần toast ở đây, component gọi hàm sẽ tự xử lý toast
        } catch (error: any) {
            console.error("Error adding item to cart:", error);
            const message = error.response?.data?.message || error.message || "Failed to add item.";
            setErrorCart(message); // Lưu lỗi vào state
            throw error; // Ném lại lỗi để component gọi hàm có thể bắt
        }
    };

    // Giá trị cung cấp bởi Context
    const value = {
        cartItems,
        isLoadingCart,
        errorCart,
        fetchCart,
        addItemToCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom Hook để dễ dàng sử dụng Context
export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
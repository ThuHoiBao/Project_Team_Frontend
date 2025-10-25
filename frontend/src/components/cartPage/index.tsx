import Header from '../commonComponent/Header';
import classNames from 'classnames/bind';
import React, { useState, useEffect, useMemo } from 'react'; // 1. Thêm useMemo
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import CartItem from './CartItem';
import Button from '../commonComponent/Button';
import Footer from '../commonComponent/Footer';
import styles from './cartPage.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
    getCartItems,
    removeCartItem,
    updateCartItemQuantity,
    CartItemInfo,
} from '../../services/cart/cartApi';

const cx = classNames.bind(styles);

interface CartItemData {
    cartItemId: string;
    productId: string;
    image: string;
    name: string;
    size: string;
    price: number;
    quantity: number;
    availableStock: number;
}

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItemData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // 2. State để quản lý item đã chọn
    const [selectedItems, setSelectedItems] = useState(new Set<string>());

    useEffect(() => {
        const fetchCart = async () => {
            setIsLoading(true);
            try {
                const itemsFromApi = await getCartItems();
                const formattedItems: CartItemData[] = itemsFromApi
                    .map((item: CartItemInfo) => {
                        if (!item.product || typeof item.product !== 'object') {
                            return null;
                        }
                        return {
                            // Dùng item.id (từ virtual) thay vì item._id
                            cartItemId: item.id, 
                            productId: item.product.id || item.product._id,
                            image:
                                item.product.image ||
                                'https://placehold.co/100x100?text=No+Image',
                            name: item.product.name,
                            size: item.size,
                            price: item.product.price,
                            quantity: item.quantity,
                            availableStock: item.availableStock,
                        };
                    })
                    .filter(Boolean) as CartItemData[];

                setCartItems(formattedItems);

                // Mặc định chọn tất cả khi tải trang
                setSelectedItems(new Set(formattedItems.map(item => item.cartItemId)));

            } catch (error) {
                console.error('Failed to load cart:', error);
                toast.error('Could not load your cart.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCart();
    }, []);

    // ... (handleQuantityChange không đổi) ...
    const handleQuantityChange = async (
        cartItemId: string,
        newQuantity: number,
    ) => {
        const originalItems = [...cartItems];
        setCartItems((prev) =>
            prev.map((item) =>
                item.cartItemId === cartItemId
                    ? { ...item, quantity: newQuantity }
                    : item,
            ),
        );
        try {
            await updateCartItemQuantity(cartItemId, newQuantity);
        } catch (error: any) {
            console.error('Failed to update quantity:', error);
            toast.error(
                error.message || 'Failed to update quantity. Reverting.',
            );
            setCartItems(originalItems);
        }
    };
    
    // Cập nhật handleRemoveItem
    const handleRemoveItem = async (cartItemId: string) => {
        const originalItems = [...cartItems];
        setCartItems((prev) =>
            prev.filter((item) => item.cartItemId !== cartItemId),
        );
        // Xóa khỏi danh sách đã chọn
        setSelectedItems(prevSet => {
            const newSet = new Set(prevSet);
            newSet.delete(cartItemId);
            return newSet;
        });

        try {
            await removeCartItem(cartItemId);
            toast.success('Item removed from cart.');
        } catch (error: any) {
            console.error('Failed to remove item:', error);
            toast.error('Failed to remove item. Reverting.');
            setCartItems(originalItems);
            // (Không cần hoàn tác selectedItems vì item đã bị xóa)
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    // 3. Hàm xử lý chọn item và chọn tất cả
    const handleSelectItem = (cartItemId: string, isSelected: boolean) => {
        setSelectedItems(prevSet => {
            const newSet = new Set(prevSet);
            if (isSelected) {
                newSet.add(cartItemId);
            } else {
                newSet.delete(cartItemId);
            }
            return newSet;
        });
    };

    const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isSelected = e.target.checked;
        if (isSelected) {
            setSelectedItems(new Set(cartItems.map(item => item.cartItemId)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const selectedSubtotal = useMemo(() => {
        return cartItems
            .filter(item => selectedItems.has(item.cartItemId))
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cartItems, selectedItems]);

    const itemsToCheckout = cartItems
    .filter(item => selectedItems.has(item.cartItemId))
    // 2. Map về đúng định dạng mà CheckoutPage mong đợi
    .map(item => ({
        id: item.cartItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        image: item.image
    }));

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <Header />
                <div className={cx('container')}>
                    <h3 className={cx('cart-title')}>YOUR CART</h3>
                    <div className={cx('loading-cart')}>Loading cart...</div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('breadcrumb')}>
                <Button text to="/home">
                    Home
                </Button>
                <span className={cx('separator')}>{'>'}</span>
                <Button text className={cx('active')}>
                    Cart
                </Button>
            </div>
            <div className={cx('container')}>
                <div className={cx('content')}>
                    <h3 className={cx('cart-title')}>YOUR CART</h3>

                    {/* Xóa .cart-layout-simple */}
                    {/* Bọc bảng trong một div để cuộn */}
                    <div className={cx('cart-table-wrapper')}>
                        <table className={cx('cart-table')}>
                            {/* Tiêu đề bảng (sẽ dính ở trên khi cuộn) */}
                            <thead className={cx('table-header')}>
                                <tr>
                                    <th className={cx('header-select')}>
                                        <input
                                            type="checkbox"
                                            id="select-all"
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className={cx('header-product')}>Product</th>
                                    <th className={cx('header-price')}>Price</th>
                                    <th className={cx('header-quantity')}>Quantity</th>
                                    <th className={cx('header-subtotal')}>Subtotal</th>
                                    <th className={cx('header-remove')}>Remove</th>
                                </tr>
                            </thead>
                            
                            {/* Thân bảng (để chứa các item) */}
                            <tbody>
                                {cartItems.length > 0 ? (
                                    cartItems.map((item) => (
                                        <CartItem
                                            key={item.cartItemId}
                                            id={item.cartItemId}
                                            image={item.image}
                                            name={item.name}
                                            size={item.size}
                                            price={item.price}
                                            initialQuantity={item.quantity}
                                            availableStock={item.availableStock}
                                            onQuantityChange={handleQuantityChange}
                                            onRemove={handleRemoveItem}
                                            formatCurrency={formatCurrency}
                                            isSelected={selectedItems.has(item.cartItemId)}
                                            onSelectItem={handleSelectItem}
                                        />
                                    ))
                                ) : (
                                    // Hiển thị khi giỏ hàng rỗng
                                    <tr>
                                        <td colSpan={6} className={cx('empty-cart-message')}>
                                            Your cart is empty.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div> {/* Hết .cart-table-wrapper */}

                    {/* Thanh Footer (Tổng tiền + Checkout) không đổi */}
                    {cartItems.length > 0 && (
                        <div className={cx('cart-footer')}>
                            <div className={cx('footer-summary')}>
                                <span className={cx('subtotal-label')}>
                                    Subtotal ({selectedItems.size} items):
                                </span>
                                <span className={cx('subtotal-amount')}>
                                    {formatCurrency(selectedSubtotal)}
                                </span>
                            </div>
                            
                            <Link 
                                to="/checkout" 
                                state={{ 
                                     items: itemsToCheckout, 
                                    subtotal: selectedSubtotal 
                                }}
                                
                                className={cx('checkout-btn-link', { disabled: selectedItems.size === 0 })}
                                onClick={(e) => {
                                    if (selectedItems.size === 0) {
                                        e.preventDefault(); 
                                        toast.warn("Please select at least one item.");
                                    }
                                }}
                            >
                                <button 
                                    className={cx('checkout-btn')} 
                                    disabled={selectedItems.size === 0} 
                                >
                                    Checkout
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CartPage;
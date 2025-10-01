import Header from '../commonComponent/Header';
import classNames from 'classnames/bind';

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faTag } from '@fortawesome/free-solid-svg-icons';


import CartItem from './CartItem';
import Button from '../commonComponent/Button';
import Footer from '../commonComponent/Footer';
import styles from './cartPage.module.scss';

const cx = classNames.bind(styles);

interface CartItemData {
    id: string;
    image: string;
    name: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
}

const CartPage: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItemData[]>([
        {
            id: '1',
            image: '/images/gradient-tshirt.jpg',
            name: 'Gradient Graphic T-shirt',
            size: 'Large',
            color: 'White',
            price: 145,
            quantity: 1
        },
        {
            id: '2',
            image: '/images/checkered-shirt.jpg',
            name: 'Checkered Shirt',
            size: 'Medium',
            color: 'Red',
            price: 180,
            quantity: 1
        },
        {
            id: '3',
            image: '/images/skinny-jeans.jpg',
            name: 'Skinny Fit Jeans',
            size: 'Large',
            color: 'Blue',
            price: 240,
            quantity: 1
        }
    ]);

    const [promoCode, setPromoCode] = useState<string>('');

    const handleQuantityChange = (id: string, quantity: number): void => {
        setCartItems(prev => 
            prev.map(item => 
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const handleRemoveItem = (id: string): void => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const handleApplyPromo = (): void => {
        console.log('Applying promo code:', promoCode);
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = subtotal * 0.20; // 20% discount
    const deliveryFee = 15;
    const total = subtotal - discount + deliveryFee;

    return (
        <div className={cx('wrapper')}>    
            <Header />
            <div className={cx('container')}>
               <div className={cx('breadcrumb')}>
                <Button text to='/home'>Home</Button>
                <span className={cx('separator')}>{'>'}</span>
                <Button text className={cx('active')}>Cart</Button>
            </div>
                
                <div className={cx('content')}>
                    <h3 className={cx('cart-title')}>YOUR CART</h3>
                    <div className={cx('cart-layout')}>
                        <div className={cx('cart-items')}>
                            {cartItems.map(item => (
                                <CartItem
                                    key={item.id}
                                    id={item.id}
                                    image={item.image}
                                    name={item.name}
                                    size={item.size}
                                    color={item.color}
                                    price={item.price}
                                    initialQuantity={item.quantity}
                                    onQuantityChange={handleQuantityChange}
                                    onRemove={handleRemoveItem}
                                />
                            ))}
                        </div>

                        <div className={cx('order-summary')}>
                            <h2 className={cx('summary-title')}>Order Summary</h2>
                            
                            <div className={cx('summary-details')}>
                                <div className={cx('summary-row')}>
                                    <span>Subtotal</span>
                                    <span>${subtotal}</span>
                                </div>
                                <div className={cx('summary-row', 'discount')}>
                                    <span>Discount (-20%)</span>
                                    <span>-${discount.toFixed(0)}</span>
                                </div>
                                <div className={cx('summary-row')}>
                                    <span>Delivery Fee</span>
                                    <span>${deliveryFee}</span>
                                </div>
                                <div className={cx('summary-row', 'total')}>
                                    <span>Total</span>
                                    <span>${total.toFixed(0)}</span>
                                </div>
                            </div>

                            <div className={cx('promo-section')}>
                                <div className={cx('promo-input-wrapper')}>
                                    <FontAwesomeIcon icon={faTag} className={cx('promo-icon')} />
                                    <input
                                        type="text"
                                        placeholder="Add promo code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className={cx('promo-input')}
                                    />
                                    <Button 
                                        className={cx('apply-btn')} 
                                        onClick={handleApplyPromo}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>

                            <Button 
                                className={cx('checkout-btn')} 
                                primary 
                                large
                            >
                                Go to Checkout
                                <FontAwesomeIcon icon={faArrowRight} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default CartPage;
import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import styles from './CartItem.module.scss';
import images from '../../../assets/images';

const cx = classNames.bind(styles);

interface CartItemProps {
    id: string;
    image: string;
    name: string;
    size: string;
    color: string;
    price: number;
    initialQuantity?: number;
    onQuantityChange?: (id: string, quantity: number) => void;
    onRemove?: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ 
    id,
    image, 
    name, 
    size, 
    color, 
    price, 
    initialQuantity = 1,
    onQuantityChange,
    onRemove 
}) => {
    const [quantity, setQuantity] = useState<number>(initialQuantity);

    const handleQuantityChange = (newQuantity: number): void => {
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
            onQuantityChange && onQuantityChange(id, newQuantity);
        }
    };

    const handleRemove = (): void => {
        onRemove && onRemove(id);
    };

    return (
        <div className={cx('cart-item')}>
            <div className={cx('product-image')}>
                <img src={images.realShirtImage} alt={name} />
            </div>
            
            <div className={cx('product-info')}>
                <h3 className={cx('product-name')}>{name}</h3>
                <div className={cx('product-details')}>
                    <span className={cx('size')}>Size: <span className={cx('size-value')}>{size}</span></span>
                    <span className={cx('color')}>Color:  <span className={cx('color-value')}>{color}</span></span>
                </div>
                <div className={cx('price')}>${price}</div>
            </div>

            <div className={cx('quantity-controls')}>
                <button 
                    className={cx('quantity-btn')}
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                >
                    -
                </button>
                <span className={cx('quantity')}>{quantity}</span>
                <button 
                    className={cx('quantity-btn')}
                    onClick={() => handleQuantityChange(quantity + 1)}
                >
                    +
                </button>
            </div>

            <button className={cx('remove-btn')} onClick={handleRemove}>
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </div>
    );
};

export default CartItem;
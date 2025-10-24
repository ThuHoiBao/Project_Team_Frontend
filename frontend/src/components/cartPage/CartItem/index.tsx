import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './CartItem.module.scss';
import images from '../../../assets/images';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

interface CartItemProps {
    id: string; // Đây là cartItemId
    image: string;
    name: string;
    size: string;
    price: number;
    availableStock: number;
    initialQuantity?: number;
    onQuantityChange?: (id: string, quantity: number) => void;
    onRemove?: (id: string) => void;
    formatCurrency: (amount: number) => string;
    isSelected: boolean;
    onSelectItem: (id: string, isSelected: boolean) => void;
}

// Component bây giờ sẽ render một thẻ <tr>
const CartItem: React.FC<CartItemProps> = ({
    id,
    image,
    name,
    size,
    price,
    initialQuantity = 1,
    availableStock,
    onQuantityChange,
    onRemove,
    formatCurrency,
    isSelected,
    onSelectItem,
}) => {
    const [quantity, setQuantity] = useState<number>(initialQuantity);

    useEffect(() => {
        setQuantity(initialQuantity);
    }, [initialQuantity]);

    const handleQuantityChange = (newQuantity: number): void => {
        if (newQuantity < 1) return;
        if (newQuantity > availableStock) {
            toast.error(`Only ${availableStock} items available for this size.`);
            return;
        }
        setQuantity(newQuantity);
        onQuantityChange && onQuantityChange(id, newQuantity);
    };

    const handleRemove = (): void => {
        onRemove && onRemove(id);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectItem(id, e.target.checked);
    };

    const itemSubtotal = price * quantity;

    return (
        // BỌC BÊN NGOÀI BẰNG <tr>
        <tr className={cx('cart-item-row')}>
            
            {/* Ô 1: Checkbox */}
            <td className={cx('cell-select')}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleCheckboxChange}
                    aria-label={`Select ${name}`}
                />
            </td>

            {/* Ô 2: Sản phẩm (Ảnh + Tên) */}
            <td className={cx('cell-product')}>
                <div className={cx('product-display')}>
                    <img src={image || images.noImage} alt={name} className={cx('product-image')} />
                    <div className={cx('product-info')}>
                        <h3 className={cx('product-name')}>{name}</h3>
                        <span className={cx('size')}>
                            Size: <span className={cx('size-value')}>{size}</span>
                        </span>
                    </div>
                </div>
            </td>

            {/* Ô 3: Đơn giá */}
            <td className={cx('cell-price')}>{formatCurrency(price)}</td>

            {/* Ô 4: Số lượng */}
            <td className={cx('cell-quantity')}>
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
                        disabled={quantity >= availableStock}
                    >
                        +
                    </button>
                </div>
            </td>

            {/* Ô 5: Tổng (Subtotal) */}
            <td className={cx('cell-subtotal')}>{formatCurrency(itemSubtotal)}</td>
            
            {/* Ô 6: Nút Xóa */}
            <td className={cx('cell-remove')}>
                <button className={cx('remove-btn')} onClick={handleRemove}>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </td>
        </tr>
    );
};

export default CartItem;
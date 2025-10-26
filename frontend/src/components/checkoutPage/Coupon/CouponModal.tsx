import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './CouponModal.module.scss'; // Use correct scss file name
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

// Import updated API functions and types
import {
    getAvailableCoupons,
    applyCouponCode,
    formatDate,
    formatCurrency, // Import formatCurrency
    Coupon,
} from '../../../services/coupon/couponApi'; // Use correct path

const cx = classNames.bind(styles);

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (coupon: Coupon) => void; // Pass selected/applied coupon back
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose, onApply }) => {
    const [typedCode, setTypedCode] = useState('');
    const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [applyLoading, setApplyLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchCoupons = async () => {
                setIsLoading(true);
                setAvailableCoupons([]); // Clear previous list
                try {
                    // Call the updated API function
                    const coupons = await getAvailableCoupons();
                    setAvailableCoupons(coupons);
                } catch (error: any) {
                    console.error("Failed to fetch coupons:", error);
                    toast.error(error.message || "Could not load available coupons.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchCoupons();
            setTypedCode('');
        }
    }, [isOpen]);

    const handleApplyTypedCode = async () => {
        if (!typedCode.trim()) {
            toast.warn("Please enter a coupon code.");
            return;
        }
        setApplyLoading(true);
        try {
            // Call API to validate and get the coupon
            const appliedCoupon = await applyCouponCode(typedCode.trim());
            toast.success(`Coupon "${appliedCoupon.code}" applied!`);
            onApply(appliedCoupon); // Send validated coupon back
            onClose();
        } catch (error: any) {
            console.error("Failed to apply coupon code:", error);
            toast.error(error.message || "Failed to apply coupon code.");
        } finally {
            setApplyLoading(false);
        }
    };

    const handleSelectCoupon = (coupon: Coupon) => {
        toast.success(`Coupon "${coupon.code}" selected!`);
        onApply(coupon); // Send selected coupon back
        onClose();
    };

    // --- Updated Display Logic ---
    const formatDiscount = (coupon: Coupon) => {
        // Display as percentage
        return `${coupon.discountValue}%`;
    };

    const formatMaxDiscount = (coupon: Coupon) => {
        // Display max discount in VND if it exists
        return coupon.maxDiscount ? `(Max: ${formatCurrency(coupon.maxDiscount)})` : '';
    };
    // --- End Updated Display Logic ---

    if (!isOpen) return null;

    return (
        <div className={cx('modalOverlay')} onClick={onClose}>
            <div className={cx('modalContent')} onClick={(e) => e.stopPropagation()}>
                <button className={cx('closeButton')} onClick={onClose} aria-label="Close modal">
                    <X size={24} />
                </button>
                <h2 className={cx('title')}>Select Coupon</h2> {/* Changed title */}

                <div className={cx('inputSection')}>
                    <label htmlFor="couponCodeInput">Coupon Code</label> {/* Changed label */}
                    <input
                        id="couponCodeInput"
                        type="text"
                        placeholder="Enter code"
                        value={typedCode}
                        onChange={(e) => setTypedCode(e.target.value)}
                        disabled={applyLoading}
                    />
                    <button onClick={handleApplyTypedCode} disabled={applyLoading}>
                        {applyLoading ? 'Applying...' : 'Apply'}
                    </button>
                </div>

                <h3 className={cx('listTitle')}>Available Coupons</h3> {/* Changed title */}
                <div className={cx('voucherList')}> {/* Keep class name or change in SCSS */}
                    {isLoading ? (
                        <div className={cx('loading')}>Loading coupons...</div>
                    ) : availableCoupons.length > 0 ? (
                        availableCoupons.map((coupon) => ( // Changed variable name
                            <div key={coupon.id} className={cx('voucherItem')}> {/* Keep class name */}
                                <div className={cx('voucherInfo')}> {/* Keep class name */}
                                    <span className={cx('voucherCode')}>{coupon.code}</span> {/* Keep class name */}
                                    <span className={cx('voucherDetails')}> {/* Keep class name */}
                                        {/* Use updated format functions */}
                                        Discount: {formatDiscount(coupon)}{' '}
                                        <span className={cx('maxDiscount')}>{formatMaxDiscount(coupon)}</span> {/* Keep class name */}
                                    </span>
                                    <span className={cx('voucherExpiry')}> {/* Keep class name */}
                                        {/* Use formatDate with API date string */}
                                        Expires on: {formatDate(coupon.endDate)}
                                    </span>
                                </div>
                                <button
                                    className={cx('selectButton')}
                                    onClick={() => handleSelectCoupon(coupon)} // Changed variable name
                                >
                                    Select
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className={cx('empty')}>No available coupons found.</div> // Changed text
                    )}
                </div>
            </div>
        </div>
    );
};

export default CouponModal; // Changed export name
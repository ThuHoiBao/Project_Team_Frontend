import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './OrderSuccessPage.module.scss'; // Create this SCSS file
import Header from '../commonComponent/Header'; // Adjust path
import Footer from '../commonComponent/Footer'; // Adjust path
import { CheckCheck } from 'lucide-react'; // Success icon

const cx = classNames.bind(styles);

const OrderSuccessPage: React.FC = () => {
    // Get the order ID from the URL parameter
    const { id: orderId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Optional: Redirect if no orderId is present (e.g., direct navigation)
    useEffect(() => {
        if (!orderId) {
            console.warn("No order ID found on success page, redirecting home.");
            navigate('/', { replace: true });
        }
        // Optional: Clear cart state here using your state management (Context, Zustand, Redux)
        // clearCart();
    }, [orderId, navigate]);

    return (
        <div className={cx('page-wrapper')}>
            <Header />
            <div className={cx('container')}>
                <div className={cx('success-box')}>
                    <div className={cx('icon-wrapper')}>
                        <CheckCheck size={70} className={cx('icon-success')} />
                    </div>
                    <h1 className={cx('status-title')}>Order Placed Successfully!</h1>
                    <p className={cx('status-message')}>
                        Thank you for your purchase. Your order ID is{' '}
                        <strong className={cx('order-id')}>{orderId || 'N/A'}</strong>.
                    </p>
                    <p className={cx('status-message')}>
                        You can view your order details in your order history.
                    </p>
                    <div className={cx('action-links')}>
                        {orderId && (
                            <Link to={`/order`} className={cx('link-button')}>
                                View Order Details
                            </Link>
                        )}
                         <Link to="/" className={cx('link-button', 'secondary')}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default OrderSuccessPage;
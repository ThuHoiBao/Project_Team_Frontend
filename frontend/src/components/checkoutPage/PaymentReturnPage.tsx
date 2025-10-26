import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentReturnPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        confirmPayment();
    }, []);

    const confirmPayment = async () => {
        try {
            // Get all VNPAY params from URL
            const vnpayParams: any = {};
            searchParams.forEach((value, key) => {
                vnpayParams[key] = value;
            });

            console.log('📥 Payment Return Params:', vnpayParams);

            const vnp_ResponseCode = vnpayParams.vnp_ResponseCode;
            const orderId = vnpayParams.vnp_TxnRef;

            if (!orderId) {
                setError('Invalid order information');
                setProcessing(false);
                return;
            }

            // Check response code
            if (vnp_ResponseCode !== '00') {
                console.error('❌ Payment failed, code:', vnp_ResponseCode);
                setError('Payment failed or was cancelled');
                setProcessing(false);
                
                // Show error and redirect after delay
                toast.error('Payment failed or was cancelled');
                setTimeout(() => {
                    navigate('/cart');
                }, 3000);
                return;
            }

            console.log('✅ Payment successful, confirming order...');

            // Call backend to confirm order
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:8088/api/payment/confirm-order/${orderId}`,
                vnpayParams, // Send all VNPAY params for hash verification
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            console.log('✅ Order confirmed:', response.data);

            if (response.data.code === '00') {
                toast.success('Payment confirmed successfully!');
                
                // Redirect to success page
                setTimeout(() => {
                    navigate(`/order-success/${orderId}`, { replace: true });
                }, 1000);
            } else {
                throw new Error(response.data.message || 'Confirmation failed');
            }

        } catch (error: any) {
            console.error('❌ Payment confirmation error:', error);
            setError(error.response?.data?.message || error.message || 'Failed to confirm payment');
            setProcessing(false);
            toast.error('Failed to confirm payment');
        }
    };

    if (processing) {
        return (
            <div style={styles.container}>
                <div style={styles.spinner}></div>
                <h2>Processing Payment...</h2>
                <p>Please wait while we confirm your payment</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorIcon}>❌</div>
                <h2>Payment Failed</h2>
                <p>{error}</p>
                <button 
                    onClick={() => navigate('/cart')}
                    style={styles.button}
                >
                    Return to Cart
                </button>
            </div>
        );
    }

    return null;
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center' as const,
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px',
    },
    errorIcon: {
        fontSize: '64px',
        marginBottom: '20px',
    },
    button: {
        marginTop: '20px',
        padding: '12px 24px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
    }
};

export default PaymentReturnPage;
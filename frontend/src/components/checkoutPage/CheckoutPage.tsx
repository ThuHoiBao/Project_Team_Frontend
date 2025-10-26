import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames/bind';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CheckoutPage.module.scss';
import { Lock, CreditCard, Truck, Tag, Coins, MapPin } from 'lucide-react';
import Header from '../commonComponent/Header';
import Button from '../commonComponent/Button';
import Footer from '../commonComponent/Footer';
import { Coupon } from '../../services/coupon/couponApi';
import { toast } from 'react-toastify';
import CouponModal from './Coupon/CouponModal';
import { getCoinBalance } from '../../services/coin/coinApi';
import { getDefaultAddress, AddressDelivery } from '../../services/addressDelivery/addressApi';
import AddressModal from './AddressModal/AddressModal';
import { createOrder } from '../../services/order/orderApi';     
import { createCodOrder } from '../../services/payment/paymentApi';
import { createVnpayUrl } from '../../services/payment/paymentApi'; 
const cx = classNames.bind(styles);

// --- Mock Data (Giữ nguyên) ---
interface CartItem {
  id: number | string;
  name: string;
  quantity: number;
  price: number;
  size: string;
  image: string;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

enum PaymentMethod {
  VNPAY = 'VNPAY',
  COD = 'COD',
}

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationState = location.state as { items: CartItem[], subtotal: number };
  const cartItems = navigationState?.items;
  const subtotal = navigationState?.subtotal; 


  const [discountCode, setDiscountCode] = useState('');
  const [xuAmount, setXuAmount] = useState<number | string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [xuValue, setXuValue] = useState(0);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  const [userCoinBalance, setUserCoinBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const [selectedAddress, setSelectedAddress] = useState<AddressDelivery | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // === ADD STATE FOR ADDRESS MODAL VISIBILITY ===
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);


  const handleAddressSelect = (newAddress: AddressDelivery) => {
      setSelectedAddress(newAddress); // Update the displayed address
  };
  
  useEffect(() => {
    if (!location.state ||!cartItems || cartItems.length === 0) {
      console.warn("No checkout items found, redirecting to cart.");
      navigate('/cart', { replace: true });
    }
  }, [cartItems, location.state, navigate]);


  useEffect(() => {
   const fetchBalance = async () => {
    setIsLoadingBalance(true); 
      try {
          const balance = await getCoinBalance(); 
          setUserCoinBalance(balance);
      } catch (error: any) {
          console.error("Failed to fetch coin balance:", error);
          toast.error(error.message || "Could not load coin balance.");
          setUserCoinBalance(0); 
      } finally {
          setIsLoadingBalance(false); 
      }
    };

        fetchBalance();
    }, []);

    useEffect(() => {
        const fetchAddress = async () => {
            setIsLoadingAddress(true);
            try {
                const address = await getDefaultAddress();
                setSelectedAddress(address); 
            } catch (error: any) {
                console.error("Error fetching default address:", error);
                toast.error(error.message || "Could not load shipping address.");
                setSelectedAddress(null); 
            } finally {
                setIsLoadingAddress(false);
            }
        };
        fetchAddress();
    }, []);

    const calculatedSubtotal = useMemo(() => {
        return cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
     }, [cartItems]);

    const total = useMemo(() => {
        const currentSubtotal = calculatedSubtotal; 
        const effectiveDiscount = Math.min(discountValue, currentSubtotal);
        const effectiveXu = Math.min(xuValue, currentSubtotal - effectiveDiscount);
        return Math.max(0, currentSubtotal - effectiveDiscount - effectiveXu);
    }, [calculatedSubtotal, discountValue, xuValue]);

  
 
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(e.target.value as PaymentMethod);
  };

 const handleOpenCouponModal = () => {
        setIsCouponModalOpen(true);
 };

  const handleApplyCouponFromModal = (coupon: Coupon) => {
      const currentSubtotal = calculatedSubtotal || 0;

      const percentageDiscount = (coupon.discountValue / 100) * currentSubtotal;

      let actualDiscount = percentageDiscount;
      if (coupon.maxDiscount != null && coupon.maxDiscount < actualDiscount) {
        actualDiscount = coupon.maxDiscount;
        toast.info(`Discount capped at ${formatCurrency(coupon.maxDiscount)}.`);
      }

      actualDiscount = Math.min(actualDiscount, currentSubtotal);

      actualDiscount = Math.round(actualDiscount);

      setAppliedCoupon(coupon);       
      setDiscountValue(actualDiscount); 
      setIsCouponModalOpen(false);   
      toast.success(`Applied coupon: ${coupon.code} (-${formatCurrency(actualDiscount)})`);

      setXuValue(0);
      setXuAmount('');
      toast.info("Coin application reset due to coupon change.");
  };

  const handleApplyXu = () => {
         const amountInput = Number(xuAmount);
         const currentSubtotal = calculatedSubtotal || 0;

         if (isNaN(amountInput) || amountInput < 0) {
              toast.error("Please enter a valid positive number for Xu.");
              setXuAmount(''); 
              setXuValue(0);
              return;
         }

         // Check against fetched balance
        if (amountInput > userCoinBalance) {
            toast.error(`You only have ${userCoinBalance} coins available.`);
            setXuValue(0); // Reset value if input exceeds balance
            return;
        }

         const requestedCoinValue = Math.round(amountInput * 1000); // Convert coin to VND value & round
         const applicableSubtotal = Math.max(0, currentSubtotal - discountValue);


         if (applicableSubtotal <= 0) {
             toast.warn("Cannot apply coins as the total is already covered.");
             setXuAmount('');
             setXuValue(0);
             return;
        }

        const maxCoinsNeeded = Math.ceil(applicableSubtotal / 1000);
        const coinsToUse = Math.min(amountInput, maxCoinsNeeded, userCoinBalance);
        let actualXuValueApplied = Math.min(coinsToUse * 1000, applicableSubtotal);
        actualXuValueApplied = Math.round(actualXuValueApplied);

        setXuValue(actualXuValueApplied);
        setXuAmount(coinsToUse);

        if (coinsToUse > 0) {
             toast.info(`Applied ${coinsToUse} coins (-${formatCurrency(actualXuValueApplied)}).`);
        } else {
             toast.info("No coins applied.");
             setXuAmount('');
        }
         if (amountInput > coinsToUse && coinsToUse < maxCoinsNeeded) {
            toast.warn(`Adjusted coins to ${coinsToUse} due to remaining balance or order total.`);
         }
     };


    const handlePayNow = async (e: React.FormEvent) => {
         e.preventDefault();
    console.log("=== CHECKOUT PROCESS START ===");

    // 1. Basic Validations
    if (!selectedAddress) {
        toast.error("Please select or add a shipping address.");
        return;
    }

    if (!cartItems || cartItems.length === 0) {
        toast.error("Your cart appears empty. Cannot proceed.");
        navigate('/cart', { replace: true });
        return;
    }

    setIsSubmitting(true);
    toast.info("Processing your order...");
    
    try {
        // 2. Prepare Order Payload
        const actualCoinsApplied = Math.ceil(xuValue / 1000);

        const orderPayload = {
            shippingAddressId: selectedAddress.id,
            paymentMethod: selectedPaymentMethod,
            orderItems: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                size: item.size
            })),
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            coinsApplied: actualCoinsApplied,
        };

        console.log('📦 ORDER PAYLOAD:', JSON.stringify(orderPayload, null, 2));

        // ============================================
        // 3. HANDLE PAYMENT METHOD - FIXED SECTION
        // ============================================

        if (selectedPaymentMethod === PaymentMethod.COD) {
            console.log('💵 === COD PAYMENT FLOW ===');
            
            // For COD, create and finalize order in one step
            // You'll need to create this new API endpoint in backend
            const response = await createCodOrder(orderPayload);
            
            if (!response || !response.orderId) {
                throw new Error('Invalid response from server');
            }

            console.log('✅ COD Order Created:', response.orderId);
            toast.success("Order placed successfully with Cash on Delivery!");
            
            // Redirect to success page
            navigate(`/order-success/${response.orderId}`, { replace: true });

        } else if (selectedPaymentMethod === PaymentMethod.VNPAY) {
            console.log('💳 === VNPAY PAYMENT FLOW ===');
            
            // Step 1: Create preliminary order
            console.log('🚀 Creating preliminary order...');
            const preliminaryOrderResponse = await createOrder(orderPayload);
            
            // ✅ FIX: Validate response structure first
            if (!preliminaryOrderResponse || typeof preliminaryOrderResponse !== 'object') {
                throw new Error('Invalid response from server');
            }

            const { orderId, totalPrice: finalPriceFromBackend } = preliminaryOrderResponse;
            
            if (!orderId) {
                throw new Error('Order ID not received from server');
            }

            console.log(`✅ Preliminary Order Created: ${orderId}`);
            console.log(`💰 Total Price: ${finalPriceFromBackend}`);

            // Step 2: Handle zero-total orders
            if (finalPriceFromBackend <= 0) {
                console.log('⚠️ Total is 0, skipping payment gateway');
                toast.success("Order placed successfully! (No payment required)");
                navigate(`/order-success/${orderId}`, { replace: true });
                return;
            }

            // Step 3: Request VNPAY payment URL
            const vnpayPayload = {
                orderId: orderId,
                orderDescription: `Payment for order ${orderId}`,
            };

            console.log('🔗 Requesting VNPAY URL...');
            console.log('Payload:', vnpayPayload);
            
            const vnpayResponse = await createVnpayUrl(vnpayPayload);
            
            // ✅ FIX: Comprehensive validation
            console.log('📥 VNPAY Response:', vnpayResponse);
            
            // Check if response exists
            if (!vnpayResponse) {
                throw new Error('No response from payment server');
            }

            // Validate response structure
            if (typeof vnpayResponse !== 'object') {
                throw new Error('Invalid response format from payment server');
            }

            // Check response code and data
            if (vnpayResponse.code === '00' && vnpayResponse.data) {
                console.log('✅ VNPAY URL received:', vnpayResponse.data);
                
                // Validate URL format
                try {
                    new URL(vnpayResponse.data);
                    console.log('✅ URL is valid');
                } catch (urlError) {
                    console.error('❌ Invalid URL format:', vnpayResponse.data);
                    throw new Error('Received invalid payment URL from server');
                }
                
                // Show loading state before redirect
                toast.info("Redirecting to payment gateway...");
                
                // Small delay to ensure user sees the message
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Redirect to VNPAY
                console.log('🔄 Redirecting to VNPAY...');
                window.location.href = vnpayResponse.data;
                // Script execution stops here
                
            } else {
                // Response code is not '00' or data is missing
                console.error('❌ VNPAY Error Response:', vnpayResponse);
                const errorMessage = vnpayResponse.message || 'Failed to initialize payment gateway';
                throw new Error(errorMessage);
            }

        } else {
            // Unknown payment method
            throw new Error('Invalid payment method selected');
        }

    } catch (error: any) {
        console.error('❌ === CHECKOUT FAILED ===');
        console.error('Error:', error);
        
        // ✅ FIX: Better error handling
        let userMessage = "An error occurred during checkout. Please try again.";
        
        if (error.message) {
            // Use the error message if it's user-friendly
            if (error.message.includes('address') || 
                error.message.includes('stock') || 
                error.message.includes('balance') ||
                error.message.includes('payment')) {
                userMessage = error.message;
            }
        }
        
        toast.error(userMessage);
        setIsSubmitting(false);
        
    } finally {
        console.log('=== CHECKOUT PROCESS END ===');
        // Note: setIsSubmitting(false) is NOT called for VNPAY success case
        // because we redirect away from the page
    }
    };

  if (!cartItems) {
    return (
        <div className={cx('page')}>
            <Header />
            <div className={cx('body')}>
                <div className={cx('loading')}>Redirecting...</div>
            </div>
            <Footer />
        </div>
    );
  }

  return (
    <div className={cx('page')}>
      <Header />
      <div className={cx('breadcrumb')}>
         <Button text to='/home'>Home</Button>
         <span className={cx('separator')}>{'>'}</span>
         <Button text to='/cart'>Cart</Button>
         <span className={cx('separator')}>{'>'}</span>
         <Button text className={cx('active')}>Checkout</Button>
      </div>
      <div className={cx('body')}>
        <form onSubmit={handlePayNow} className={cx('checkoutGrid')}>

          {/* === CỘT TRÁI: SHIPPING & REVIEW CART === */}
          <div className={cx('leftColumn')}>
            {/* --- Shipping Information --- */}
            <div className={cx('sectionCard', 'shippingInfo')}>
                            <h2 className={cx('shipping-title')}>
                                <MapPin size={20} /> Shipping Address {/* Changed title */}
                            </h2>
                            {isLoadingAddress ? (
                                <div className={cx('address-loading')}>Loading address...</div>
                            ) : selectedAddress ? (
                                // Display fetched address
                                <div className={cx('address-display')}>
                                    <div className={cx('address-details')}>
                                        <span className={cx('name-phone')}>
                                            {selectedAddress.fullName} (+{selectedAddress.phoneNumber}) {/* Format phone if needed */}
                                        </span>
                                        <span className={cx('address-line')}>
                                            {selectedAddress.address}
                                        </span>
                                    </div>
                                    <div className={cx('address-actions')}>
                                        {selectedAddress.isDefault && (
                                            <span className={cx('default-tag')}>Default</span>
                                        )}
                                        {/* TODO: Implement Change Address Modal */}
                                        <button type="button" className={cx('change-btn')} onClick={() => setIsAddressModalOpen(true)}>
                                            Change
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Display if no address found
                                <div className={cx('no-address')}>
                                    <p>No shipping address found.</p>
                                    {/* TODO: Add Button/Link to add address page/modal */}
                                    <button type="button" className={cx('add-address-btn')} onClick={() => alert('Add address functionality needed!')}>Add Address</button>
                                </div>
                            )}
                        </div>

            {/* --- Review Your Cart --- */}
           <div className={cx('sectionCard', 'reviewCart')}>
                            <h2>Review Your Order</h2>
                            {/* Thay thế div bằng table */}
                            <div className={cx('review-table-wrapper')}> {/* Thêm wrapper nếu cần cuộn */}
                                <table className={cx('review-table')}>
                                    {/* 1. Thêm Tiêu đề bảng */}
                                    <thead>
                                        <tr>
                                            <th className={cx('header-product')}>Product</th>
                                            <th className={cx('header-price')}>Price</th>
                                            <th className={cx('header-quantity')}>Quantity</th>
                                            <th className={cx('header-subtotal')}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    {/* 2. Thân bảng */}
                                    <tbody>
                                        {cartItems.map(item => (
                                            // 3. Mỗi item là một hàng <tr>
                                            <tr key={item.id} className={cx('review-item-row')}>
                                                {/* Ô Product */}
                                                <td className={cx('cell-product')}>
                                                    <div className={cx('product-display')}>
                                                        <img src={item.image} alt={item.name} className={cx('product-image')} />
                                                        <div className={cx('product-info')}>
                                                            <span className={cx('product-name')}>{item.name}</span>
                                                            <span className={cx('size')}>Size: <span className={cx('size-value')}>{item.size}</span></span>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Ô Price */}
                                                <td className={cx('cell-price')}>{formatCurrency(item.price)}</td>
                                                {/* Ô Quantity (chỉ hiển thị số) */}
                                                <td className={cx('cell-quantity')}>{item.quantity}</td>
                                                {/* Ô Subtotal */}
                                                <td className={cx('cell-subtotal')}>{formatCurrency(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div> {/* Kết thúc wrapper */}
                        </div>
          </div> {/* Kết thúc cột trái */}

          {/* === CỘT PHẢI: DISCOUNT, XU, PAYMENT, SUMMARY === */}
          <div className={cx('rightColumn')}>
            {/* --- Discount Code --- */}
            <div className={cx('sectionCard', 'discountCard')}>
                <h2>COUPON</h2>
               {appliedCoupon ? (
                    <div className={cx('appliedVoucher')}>
                    <span>Applied: {appliedCoupon.code} <span className={cx('qTyColor')}>(-{formatCurrency(discountValue)})</span></span>
                     <button type="button" onClick={() => {
                        setAppliedCoupon(null); setDiscountValue(0);
                        setXuValue(0); setXuAmount(''); toast.info("Coupon removed. Coin application reset.");
                     }}>Remove</button>
                                </div>
                  ) : (
                     <div className={cx('applySection')}>
                        <Tag size={18} className={cx('applyIcon')} />
                        <button type="button" onClick={handleOpenCouponModal}>Select Coupon</button>
                        </div>
                     )}
            </div>

            {/* --- Xu (Coins/Points) --- */}
            <div className={cx('sectionCard', 'xuCard')}>
                <h2>Use Coin <span className={cx('coinInfo')}> (1coin = 1000đ)</span></h2>
               <p>
                  Coin available:{' '}
                  {isLoadingBalance ? (
                   <span className={cx('coin-value', 'loading')}>Loading...</span>
                   ) : (
                       <span className={cx('coin-value')}>{userCoinBalance}</span>
                  )}
                </p>
                <div className={cx('applySection')}>
                    <Coins size={18} className={cx('applyIcon')}/>
                    <input 
                        type="number" 
                        placeholder="Enter coin amount" 
                        value={xuAmount} 
                        onChange={(e) => setXuAmount(e.target.value)} 
                        min="0"
                        step="1" 
                        max={userCoinBalance}
                        disabled={isLoadingBalance}
                        />
                    <button type="button" onClick={handleApplyXu} disabled={isLoadingBalance}>Apply</button>
                </div>

                 {xuValue > 0 && (
                    <div className={cx('appliedValueDisplay')}> {/* Use a different class or reuse appliedDiscount-1 carefully */}
                    <span>Coin Applied <span className={cx('qTyColor')}>{xuAmount ? `(${xuAmount})` : ''}</span></span>
                     <span className={cx('coinValueAmount')}> {/* Use a different class */}
                         - {formatCurrency(xuValue)}
                     </span>
                    </div>
                 )}
            </div>

            {/* --- Payment Method --- */}
            <div className={cx('sectionCard', 'paymentMethod')}>
              <h2>Payment Method</h2>
              <div className={cx('paymentOptions')}>
                <label className={cx('paymentOption', { selected: selectedPaymentMethod === PaymentMethod.VNPAY })}>
                  <input type="radio" name="paymentMethod" value={PaymentMethod.VNPAY} checked={selectedPaymentMethod === PaymentMethod.VNPAY} onChange={handlePaymentMethodChange} />
                  <CreditCard size={20} />
                  <span>VNPAY</span>
                </label>
                <label className={cx('paymentOption', { selected: selectedPaymentMethod === PaymentMethod.COD })}>
                  <input type="radio" name="paymentMethod" value={PaymentMethod.COD} checked={selectedPaymentMethod === PaymentMethod.COD} onChange={handlePaymentMethodChange} />
                  <Truck size={20} />
                  <span>Cash on Delivery (COD)</span>
                </label>
              </div>
            </div>

             {/* --- Pricing Summary & Pay Button --- */}
            <div className={cx('sectionCard', 'summaryCard')}>
                 <div className={cx('pricingSummary')}>
                   <div><span>Subtotal</span><span>{formatCurrency(calculatedSubtotal)}</span></div>
                    <div><span>Discount</span><span className={cx('discountAmount')}>- {formatCurrency(discountValue)}</span></div>
                    <div><span>Coin Applied</span><span className={cx('xuAmount')}>- {formatCurrency(xuValue)}</span></div>
                   <div className={cx('total')}><span>Total</span><span>{formatCurrency(total)}</span></div>
                </div>
                <button 
                        type="submit" 
                        className={cx('payNowButton')}
                        disabled={isSubmitting || !selectedAddress}
                    >
                        {isSubmitting ? 'Processing...' : 'Pay Now'}
                    </button>
                 <div className={cx('secureNote')}>
                    <Lock size={14} /> Secure Checkout - SSL Encrypted
                 </div>
             </div>


          </div> {/* Kết thúc cột phải */}

        </form>
      </div>
      <Footer />
      <CouponModal
          isOpen={isCouponModalOpen}
          onClose={() => setIsCouponModalOpen(false)} 
          onApply={handleApplyCouponFromModal}       
      />
      <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          currentAddress={selectedAddress} 
          onSelectAddress={handleAddressSelect}
        />
    </div>
  );
};

export default CheckoutPage;
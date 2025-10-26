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


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));

    }
    else if (name === 'fullName') {
      const textValue = value.replace(
        /[^a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/gi,
        ''
      );
      setFormData(prev => ({ ...prev, [name]: textValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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

    const total = useMemo(() => {
        const currentSubtotal = subtotal || 0;
        const effectiveDiscount = Math.min(discountValue, currentSubtotal);
        const effectiveXu = Math.min(xuValue, currentSubtotal - effectiveDiscount);
        return Math.max(0, currentSubtotal - effectiveDiscount - effectiveXu);
    }, [subtotal, discountValue, xuValue]);

  
 
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(e.target.value as PaymentMethod);
  };

 const handleOpenCouponModal = () => {
        setIsCouponModalOpen(true);
 };

  const handleApplyCouponFromModal = (coupon: Coupon) => {
      const currentSubtotal = subtotal || 0;

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
         const currentSubtotal = subtotal || 0;

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


     const handlePayNow = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAddress) {
            toast.error("Please select or add a shipping address.");
            return;
        }

        const actualCoinsApplied = Math.ceil(xuValue / 1000);

        const orderData = {
            shippingAddress: { 
                 fullName: selectedAddress.fullName,
                 address: selectedAddress.address,
                 phoneNumber: selectedAddress.phoneNumber, 
            },
            paymentMethod: selectedPaymentMethod,
            orderItems: cartItems.map(item => ({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                size: item.size
            })),
            subtotal: subtotal || 0,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            coinsApplied: actualCoinsApplied,
        };

        console.log('Submitting Order Data:', orderData);
        alert('Proceeding to payment/order creation...');
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
              <h2>Shipping Information</h2>
              <div className={cx('formGroup')}>
                <label htmlFor="fullName">Full Name <span className={cx('red')}>*</span></label>
                <input type="text" id="fullName" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleInputChange} required />
              </div>
              <div className={cx('formGroup')}>
                <label htmlFor="address">Address <span className={cx('red')}>*</span></label>
                <input type="text" id="address" name="address" placeholder="Enter your delivery address" value={formData.address} onChange={handleInputChange} required />
              </div>
              <div className={cx('formGroup')}>
                <label htmlFor="phoneNumber">Phone Number <span className={cx('red')}>*</span></label>
                <input type="tel" minLength={10} maxLength={10} id="phoneNumber" name="phoneNumber" placeholder="Enter your phone number" value={formData.phoneNumber} onChange={handleInputChange} required />
              </div>
            </div>
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
              <h2>Discount Code</h2>
              <div className={cx('applySection')}>
                <Tag size={18} className={cx('applyIcon')} />
                <input type="text" placeholder="Enter discount code" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} />
                <button type="button" onClick={handleApplyDiscount}>Apply</button>
              </div>
                <h2>VOUCHER</h2>
                <div className={cx('applySection')}>
                    <Tag size={18} className={cx('applyIcon')}/>
                   <button type="button" onClick={handleOpenCouponModal}>Select Coupon</button>
                </div>
               <div className={cx('appliedDiscount-1')}>
                  <span>Discount <span className={cx('qTyColor')}>{appliedCoupon ? `(${appliedCoupon.code})` : ''}</span></span>
                  <span className={cx('discountAmount-1')}>
                      - {formatCurrency(discountValue)}
                  </span>
                </div>
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

                  <div className={cx('appliedDiscount-1')}>
                    <span>Coin <span className={cx('qTyColor')}> {xuAmount ? `(${xuAmount})` : ''}</span></span>
                    <span className={cx('discountAmount-1')}>
                        - {formatCurrency(xuValue)}
                    </span>
                </div>
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
                    <div><span>Subtotal</span><span>{formatCurrency(subtotal || 0)}</span></div>
                    <div><span>Discount</span><span className={cx('discountAmount')}>- {formatCurrency(discountValue)}</span></div>
                    <div><span>Coin Applied</span><span className={cx('xuAmount')}>- {formatCurrency(xuValue)}</span></div>
                   <div className={cx('total')}><span>Total</span><span>{formatCurrency(total)}</span></div>
                </div>
                 <button type="submit" className={cx('payNowButton')}>Pay Now</button>
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
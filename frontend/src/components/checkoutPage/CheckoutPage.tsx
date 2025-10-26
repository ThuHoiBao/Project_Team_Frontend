import React, { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames/bind';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CheckoutPage.module.scss';
import { Lock, CreditCard, Truck, Tag, Coins } from 'lucide-react';
import Header from '../commonComponent/Header';
import Button from '../commonComponent/Button';
import Footer from '../commonComponent/Footer';

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


  const [formData, setFormData] = useState({ fullName: '', address: '', phoneNumber: '' });
  const [discountCode, setDiscountCode] = useState('');
  const [xuAmount, setXuAmount] = useState<number | string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PaymentMethod.COD);


  const [discountValue, setDiscountValue] = useState(0);
  const [xuValue, setXuValue] = useState(0);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      console.warn("No checkout items found, redirecting to cart.");
      // Dùng replace: true để người dùng không thể "Back" lại trang checkout rỗng
      navigate('/cart', { replace: true });
    }
  }, [cartItems, navigate]);


  const total = useMemo(() => {
    return (subtotal || 0) - discountValue - xuValue;
  }, [subtotal, discountValue, xuValue]);


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

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPaymentMethod(e.target.value as PaymentMethod);
  };

  const handleApplyDiscount = () => { console.log('Applying discount:', setDiscountValue(100000)); /* TODO: API call */ };
  const handleApplyXu = () => { console.log('Applying Xu:', setXuValue(50000)); /* TODO: API call */ };

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Shipping Data:', formData);
    console.log('Payment Method:', selectedPaymentMethod);
    // TODO: Thêm logic gọi API tạo đơn hàng
    alert('Proceeding to payment...');
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

            {/* --- Review Your Cart --- */}
            <div className={cx('sectionCard', 'reviewCart')}>
              <h2>Review Your Order</h2>
              <div className={cx('cartItemsList')}>
                {cartItems.map(item => (
                  <div key={item.id} className={cx('cartItem')}>
                    <img src={item.image} alt={item.name} className={cx('cartItemImage')} />
                    <div className={cx('cartItemDetails')}>
                      <span>{item.name} ({item.size})</span>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <span className={cx('cartItemPrice')}>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
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
            </div>

            {/* --- Xu (Coins/Points) --- */}
            <div className={cx('sectionCard', 'xuCard')}>
              <h2>Use Coin <span className={cx('coinInfo')}> (1coin = 1000đ)</span></h2>
              <div className={cx('applySection')}>
                <Coins size={18} className={cx('applyIcon')} />
                <input type="number" placeholder="Enter Xu amount" value={xuAmount} onChange={(e) => setXuAmount(e.target.value)} min="0" />
                <button type="button" onClick={handleApplyXu}>Apply</button>
              </div>
              {/* <p className={cx('xuBalance')}>Available Xu: 1000</p> */}
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
                <div><span>Xu Applied</span><span className={cx('xuAmount')}>- {formatCurrency(xuValue)}</span></div>
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
    </div>
  );
};

export default CheckoutPage;
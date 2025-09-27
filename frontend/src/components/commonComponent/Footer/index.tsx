import React from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTwitter, 
    faFacebookF, 
    faInstagram, 
    faGithub 
} from '@fortawesome/free-brands-svg-icons';

import styles from './Footer.module.scss';
import images from '../../../assets/images';

const cx = classNames.bind(styles);

const Footer: React.FC = () => {
    return (
        <footer className={cx('footer')}>
            <div className={cx('container')}>
                <div className={cx('footer-content')}>
                    <div className={cx('footer-section')}>
                        <h2 className={cx('logo')}>UTESHOP</h2>
                        <p className={cx('description')}>
                            We have clothes that suits your style and which you're proud to wear. 
                            From women to men.
                        </p>
                        <div className={cx('social-links')}>
                            <a href="#" className={cx('social-link')}>
                                <FontAwesomeIcon icon={faTwitter} />
                            </a>
                            <a href="#" className={cx('social-link')}>
                                <FontAwesomeIcon icon={faFacebookF} />
                            </a>
                            <a href="#" className={cx('social-link')}>
                                <FontAwesomeIcon icon={faInstagram} />
                            </a>
                            <a href="#" className={cx('social-link')}>
                                <FontAwesomeIcon icon={faGithub} />
                            </a>
                        </div>
                    </div>

                    <div className={cx('footer-section')}>
                        <h3 className={cx('section-title')}>COMPANY</h3>
                        <ul className={cx('footer-links')}>
                            <li><a href="#">About</a></li>
                            <li><a href="#">Features</a></li>
                            <li><a href="#">Works</a></li>
                            <li><a href="#">Career</a></li>
                        </ul>
                    </div>

                    <div className={cx('footer-section')}>
                        <h3 className={cx('section-title')}>HELP</h3>
                        <ul className={cx('footer-links')}>
                            <li><a href="#">Customer Support</a></li>
                            <li><a href="#">Delivery Details</a></li>
                            <li><a href="#">Terms & Conditions</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                        </ul>
                    </div>

                    <div className={cx('footer-section')}>
                        <h3 className={cx('section-title')}>FAQ</h3>
                        <ul className={cx('footer-links')}>
                            <li><a href="#">Account</a></li>
                            <li><a href="#">Manage Deliveries</a></li>
                            <li><a href="#">Orders</a></li>
                            <li><a href="#">Payments</a></li>
                        </ul>
                    </div>

                    <div className={cx('footer-section')}>
                        <h3 className={cx('section-title')}>RESOURCES</h3>
                        <ul className={cx('footer-links')}>
                            <li><a href="/ebooks">Free eBooks</a></li>
                            <li><a href="/tutorials">Development Tutorial</a></li>
                            <li><a href="/blog">How to - Blog</a></li>
                            <li><a href="/youtube">Youtube Playlist</a></li>
                        </ul>
                    </div>
                </div>

                <div className={cx('footer-bottom')}>
                    <div className={cx('copyright')}>
                        <p>Uteshop © 2000-2023, All Rights Reserved</p>
                    </div>
                    <div className={cx('payment-methods')}>
                        <img src={images.visaImage} alt="Visa" className={cx('payment-icon')} />
                        <img src={images.mastercardImage} alt="Mastercard" className={cx('payment-icon')} />
                        <img src={images.paypalImage} alt="PayPal" className={cx('payment-icon')} />
                        <img src={images.applepayImage} alt="Apple Pay" className={cx('payment-icon')} />
                        <img src={images.googlePayImage} alt="Google Pay" className={cx('payment-icon')} />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
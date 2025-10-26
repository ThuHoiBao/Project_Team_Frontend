import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEllipsisVertical,
    faEarthAsia,
    faCircleQuestion,
    faUser,
    faCoins,
    faGear,
    faSignOut,
    faChevronDown,
    faBell,
} from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import Button from '../Button';
import styles from './Header.module.scss';
import Menu from '../Popper/Menu';
import { CartIcon, InboxIcon, MoreVertIcon } from '../Icons';
import Search from '../Search';
// import { Link } from 'react-router-dom';
import { MenuItemType } from "../types/MenuItemType";
import { useEffect, useState } from 'react';
import { getCoin, getMyInfo, logoutUser } from '../../../services/user/myInfoApi';
import images from '../../../assets/images';
import { AxiosError } from 'axios';
import { useLoginModal } from '../../../context/LoginContext';
import { useAuth } from '../../../context/AuthContext';
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getSocket, initSocket } from "../../../socket/socket";
import { getNotifications, markAsRead } from "../../../services/notification/notificationApi";
import { toast } from "react-toastify";
import { message } from 'antd';



const cx = classNames.bind(styles);

// Kiểu dữ liệu cho menu item


const MENU_ITEMS: MenuItemType[] = [
    {
        icon: <FontAwesomeIcon icon={faEarthAsia} />,
        title: 'English',
        children: {
            title: 'Language',
            data: [
                {
                    type: 'language',
                    code: 'en',
                    title: 'English',
                },
                {
                    type: 'language',
                    code: 'vi',
                    title: 'Tiếng Việt',
                    children: {
                        title: 'Tiếng Việt',
                        data: [
                            {
                                type: 'language',
                                code: 'en',
                                title: 'TV1',
                            },
                            {
                                type: 'language',
                                code: 'en',
                                title: 'TV2',
                            },
                        ],
                    },
                },
                {
                    type: 'language',
                    code: 'fi',
                    title: 'Suomi',
                },
                {
                    type: 'language',
                    code: 'se',
                    title: 'Svenska',
                },
            ],
        },
    },
    {
        icon: <FontAwesomeIcon icon={faCircleQuestion} />,
        title: 'Feedback and help',
        to: '/feedback',
    },
];
type NotificationData = {
    _id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createAt: string;
};
function Header() {
    const navigate = useNavigate();

    const [avatar, setAvatar] = useState<string>(images.noImage);
    const [currentUser, setCurrentUser] = useState<boolean>();
    const { openLogin } = useLoginModal();
    const { isAuthenticated, logout, token } = useAuth();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [coin, setCoin] = useState('')
    const handleOpenNotification = async (noti: NotificationData) => {
        setSelectedNotification(noti);
        setIsModalOpen(true);
        toggleNotifications()
        if (!noti.isRead) {
            try {
                await markAsRead(noti._id);
                setNotifications((prev) =>
                    prev.map((n) =>
                        n._id === noti._id ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount((prev) => Math.max(prev - 1, 0));
            } catch (err) {
                console.error("Lỗi cập nhật trạng thái đã đọc:", err);
            }
        }
    };


    // Handle logic
    const handleMenuChange = async (menuItem: MenuItemType) => {
        switch (menuItem.title) {
            case "Log out":
                try {
                    // Gọi API logout
                    await logoutUser();
                    // Xóa token trong localStorage
                    // localStorage.removeItem("token");
                    logout();
                    // Chờ 1s rồi mới chuyển trang
                    setTimeout(() => {
                        navigate(location.pathname);
                    }, 1500);
                } catch (error) {
                    console.error("Logout failed:", error);
                }
                break;

            default:
                break;
        }
    };

    const userMenu: MenuItemType[] = [
        {
            icon: <FontAwesomeIcon icon={faUser} />,
            title: 'View profile',
            to: '/myinfo',
        },
        {
            icon: <FontAwesomeIcon icon={faCoins} />,
            title: 'Coin: '+ coin 
        },
        {
            icon: <FontAwesomeIcon icon={faGear} />,
            title: 'My order',
            to: '/order',
        },
        ...MENU_ITEMS,
        {
            icon: <FontAwesomeIcon icon={faSignOut} />,
            title: 'Log out',
            separate: true,
        },
    ];

    useEffect(() => {
        const getInfoResponse = async () => {
            try {
                const data = await getMyInfo();
                //setCurrentUser(true);
                setAvatar(data.image);
                const coinData = await getCoin(data._id)
                if(!coinData) setCoin('0')
                else setCoin(coinData)
                
                // Lấy danh sách thông báo
                const notis = await getNotifications(data._id);
                const listNotifications = notis.map((noti: any) => ({
                    _id: noti._id,
                    title: noti.title,
                    message: noti.message,
                    type: noti.type,
                    isRead: noti.isRead,
                    createAt: noti.createdAt.slice(0, 10)
                }));

                setNotifications(listNotifications);


                // Đếm số chưa đọc
                const unread = listNotifications.filter((n: any) => !n.isRead).length;
                setUnreadCount(unread);

                const socket = initSocket(data._id);
                socket.on("notification", (data: NotificationData) => {
                    setNotifications((prev) => [data, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                });

            } catch (error) {
                if (error instanceof AxiosError) {
                    //setCurrentUser(false);
                    if (error.response?.data.message === "Token has been revoked")
                        logout()
                    console.error("API error:", error.response?.data);
                } else {
                    //setCurrentUser(false);
                    console.error("Unexpected error:", error);
                }
            }
        };
        getInfoResponse();


        return () => {
            const socket = getSocket();
            socket?.off("notification");
            socket?.disconnect();
        };
    }, []);

    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };


    const handleOpenWishlist = () => {
        window.location.href = "/product/wishlist"
    }
    const location = useLocation();
    const handleLoginClick = () => {
        // Nếu đang ở trang Auth (login/register/otp)
        if (location.pathname === "/register" || location.pathname === "/auth") {
            // Gửi sự kiện để AuthPage biết cần hiển thị form login
            window.dispatchEvent(new CustomEvent("switchToLogin"));
        } else {
            openLogin();
        }
    };


    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('logo')}>
                    <h1 style={{cursor: "pointer"}} onClick={() => {
                            window.location.href = "/home"
                        }}>UTESHOP</h1>
                </div>

                {/* Navigation Menu */}
                <nav className={cx('navigation')}>
                    <div className={cx('nav-item', 'dropdown')}>
                        <span className={cx('nav-link')}>
                            Shop
                            <FontAwesomeIcon icon={faChevronDown} className={cx('dropdown-icon')} />
                        </span>
                    </div>
                    <div className={cx('nav-item')}>
                        
                        <Link
                            style={{color: "black", textDecoration: "none"}} 
                            to="/casual"
                            className={styles.card}
                        >
                            <span style={{color: "black", textDecoration: "none"}} className={styles.label}>All Product</span>
                        </Link>
                    </div>
                    <div className={cx('nav-item')}>
                        <span className={cx('nav-link')}>New Arrivals</span>
                    </div>
                    <div className={cx('nav-item')}>
                        <span className={cx('nav-link')}>Brands</span>
                    </div>
                </nav>


                <Search />

                <div className={cx('actions')}>
                    {isAuthenticated ? (
                        <>
                            <Tippy delay={[0, 50]} content="Your cart" placement="bottom">
                                <Button to="/cart" className={cx('action-btn')}>
                                    <CartIcon />
                                </Button>
                            </Tippy>
                            {/* 🔔 Bell icon */}
                            <div className={cx('notification-wrapper')}>
                                <button onClick={toggleNotifications} className={cx('action-btn')}>
                                    <FontAwesomeIcon icon={faBell} />
                                    {unreadCount > 0 && (
                                        <span className={cx('badge')}>{unreadCount}</span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className={cx('notification-dropdown')}>
                                        {notifications.length === 0 ? (
                                            <p className={cx('no-notify')}>No notifications yet</p>
                                        ) : (
                                            notifications.map((noti, idx) => (

                                                <div
                                                    key={idx}
                                                    className={cx('notification-item', { 'read': noti.isRead })}
                                                    onClick={() => handleOpenNotification(noti)}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}
                                                >
                                                    <p style={{
                                                        fontFamily: "Segoe UI Emoji",
                                                        fontWeight: "400",
                                                        fontSize: "0.875rem",
                                                        lineHeight: "1.43",
                                                        color: "rgb(107, 119, 140)",
                                                        display: "block",
                                                        margin: "0px"
                                                    }}>{noti.title}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                            
                                <img style={{cursor: "pointer",
                                display: "inline-block",
                                boxSizing: "content-box",
                                height: "2em",
                                width: "2.25em",
                                marginLeft: "4px"
                                }} src="https://www.iconpacks.net/icons/2/free-heart-icon-3510-thumb.png"
                                onClick={handleOpenWishlist} />
                        </>
                    ) : (
                        <>
                            <Button onClick={handleLoginClick}>Log in</Button>
                        </>
                    )}
                    <Menu items={isAuthenticated ? userMenu : MENU_ITEMS} onChange={handleMenuChange}>
                        {isAuthenticated ? (
                            <img
                                className={cx('user-avatar')}
                                src={avatar || images.noImage}
                                alt="Avatar"
                            />
                        ) : (
                            <button className={cx('more-btn')}>
                                <MoreVertIcon />
                            </button>
                        )}
                    </Menu>
                </div>
            </div>
            {isModalOpen && selectedNotification && (
                <div className={cx('modal-overlay')}>
                    <div className={cx('modal-content')}>
                        <h2>{selectedNotification.title}</h2>
                        <p>{selectedNotification.message}</p>
                        <p style={{ fontSize: "12px", color: "#999" }}>{selectedNotification.createAt}</p>
                        <button style={{padding: "4px", color: "white", backgroundColor: "gray", borderRadius: "5px"}} onClick={() => setIsModalOpen(false)}>Đóng</button>
                    </div>
                </div>
            )}
        </header>

    );
}

export default Header;

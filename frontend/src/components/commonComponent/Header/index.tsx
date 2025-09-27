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
import { getMyInfo, logoutUser } from '../../../services/user/myInfoApi';
import images from '../../../assets/images';
import { AxiosError } from 'axios';
import { useNavigate } from "react-router-dom";


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

function Header() {
const navigate = useNavigate();

    const [avatar, setAvatar] = useState<string>(images.noImage);
    const [currentUser, setCurrentUser] = useState<boolean>();


    // Handle logic
    const handleMenuChange = async (menuItem: MenuItemType) => {
        switch (menuItem.title) {
        case "Log out":
            try {
            // Gọi API logout
            await logoutUser();
            // Xóa token trong localStorage
            localStorage.removeItem("token");
            // Chờ 1s rồi mới chuyển trang
            setTimeout(() => {
                navigate("/login");
            }, 1000);
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
            title: 'Get coins',
            to: '/coin',
        },
        {
            icon: <FontAwesomeIcon icon={faGear} />,
            title: 'Settings',
            to: '/settings',
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
            setCurrentUser(true);
            setAvatar(data.image);
          } catch (error) {
            if (error instanceof AxiosError) {
                setCurrentUser(false);
                console.error("API error:", error.response?.data);
            } else {
                setCurrentUser(false);
                console.error("Unexpected error:", error);
            }
          }
        };
        getInfoResponse();
      }, []);

      console.log("currentUser:", currentUser);
    console.log("userMenu:", userMenu);


    

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('logo')}>
                    <h1>UTESHOP</h1>
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
                    <span className={cx('nav-link')}>On Sale</span>
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
                    {currentUser ? (
                        <>
                            <Tippy delay={[0, 50]} content="Your cart" placement="bottom">
                                <Button to="/cart" className={cx('action-btn')}>
                                    <CartIcon />
                                </Button>
                            </Tippy>
                            <Tippy delay={[0, 50]} content="Inbox" placement="bottom">
                                <button className={cx('action-btn')}>
                                    <InboxIcon />
                                    <span className={cx('badge')}>12</span>
                                </button>
                            </Tippy>
                        </>
                    ) : (
                        <>
                            <Button text to="/login">Log in</Button>
                        </>
                    )}
                    <Menu items={currentUser ? userMenu : MENU_ITEMS} onChange={handleMenuChange}>
                        {currentUser ? (
                            <img
                                className={cx('user-avatar')}
                                src= {avatar || images.noImage}
                                alt="Avatar"
                            />
                        ) : (
                            <button className={cx('more-btn')}>
                                <MoreVertIcon/>
                            </button>
                        )}
                    </Menu>
                </div>
            </div>
        </header>
    );
}

export default Header;

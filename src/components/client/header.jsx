import { useState, useEffect } from 'react';
import { ContactsOutlined, FireOutlined, LogoutOutlined, MenuFoldOutlined, SearchOutlined } from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, Space, message, Input } from 'antd';
import { Menu } from 'antd';
import { isMobile } from 'react-device-detect';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './../../redux/hooks';
import { callLogout } from './../../api/services';
import { setLogoutAction } from './../../redux/slice/accountSlice';
import './../../styles/header.scss';

const Header = (props) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [openMobileMenu, setOpenMobileMenu] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const [current, setCurrent] = useState('home');
    const location = useLocation();

    useEffect(() => {
        setCurrent(location.pathname);
    }, [location])

    const onClick = (e) => {
        setCurrent(e.key);
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.status === 200) {
            localStorage.removeItem('access_token');
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const handleSearch = (value) => {
        // Xử lý tìm kiếm sách ở đây
        if (value) {
            navigate(`/search?keyword=${value}`);
        }
    }

    const itemsDropdown = [
        {
            label: <label>Trang cá nhân</label>,
            key: 'manage-account',
            icon: <ContactsOutlined />
        },
        {
            label: <Link
                to={"/admin"}
            >Trang Quản Trị</Link>,
            key: 'admin',
            icon: <FireOutlined />
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
            icon: <LogoutOutlined />
        },
    ];

    const itemsMobiles = [...itemsDropdown];

    return (
        <>
            <div className="header-section">
                <div className="container">
                    {!isMobile ?
                            <div className='top-menu'>
                                <div className='search-container'>
                                    <Input
                                        placeholder="Tìm kiếm sách..."
                                        size="large"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        onSearch={handleSearch}
                                    />
                                </div>
                                <div className='extra'>
                                    {isAuthenticated === false ?
                                        <Link to={'/login'}>Đăng Nhập</Link>
                                        :
                                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                            <Space style={{ cursor: "pointer" }}>
                                                <span>Welcome {user?.fullName}</span>
                                                <Avatar> {user?.fullName?.substring(0, 2)?.toUpperCase()} </Avatar>
                                            </Space>
                                        </Dropdown>
                                    }
                                </div>

                            </div>
                        :
                        <div className={'header-mobile'}>
                            <span>Your APP</span>
                            <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
                        </div>
                    }
                </div>
            </div>
            <Drawer title="Chức năng"
                placement="right"
                onClose={() => setOpenMobileMenu(false)}
                open={openMobileMenu}
            >
                <Menu
                    onClick={onClick}
                    selectedKeys={[current]}
                    mode="vertical"
                    items={itemsMobiles}
                />
            </Drawer>
        </>
    )
};

export default Header;
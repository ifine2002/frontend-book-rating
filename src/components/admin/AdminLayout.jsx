import React, { useState, useEffect } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    ApiOutlined,
    UserOutlined,
    BankOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AliwangwangOutlined,
    BugOutlined,
    UserAddOutlined,
    BookOutlined,
    LikeOutlined,
    CommentOutlined
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { callLogout } from './../../api/services';
import { setLogoutAction } from './../../redux/slice/accountSlice';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const user = useAppSelector(state => state.account.user);

    const permissions = useAppSelector(state => state.account.user?.role?.permissions || []);
    const [menuItems, setMenuItems] = useState([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location])

    useEffect(() => {

        const items = [
            {
                label: <Link to="/admin">Dashboard</Link>,
                key: '/admin',
                icon: <AppstoreOutlined />
            },
            {
                label: <Link to="/admin/user">User</Link>,
                key: '/admin/user',
                icon: <UserOutlined />
            },
            {
                label: <Link to="/admin/book">Book</Link>,
                key: '/admin/book',
                icon: <BankOutlined />
            },
            {
                label: <Link to="/admin/permission">Permission</Link>,
                key: '/admin/permission',
                icon: <ApiOutlined />
            },
            {
                label: <Link to="/admin/role">Role</Link>,
                key: '/admin/role',
                icon: <ExceptionOutlined />
            },
            {
                label: <Link to="/admin/category">Category</Link>,
                key: '/admin/category',
                icon: <BookOutlined />
            },
            {
                label: <Link to="/admin/follow">Follow</Link>,
                key: '/admin/follow',
                icon: <UserAddOutlined />
            },
            {
                label: <Link to="/admin/rating">Rating</Link>,
                key: '/admin/rating',
                icon: <LikeOutlined />
            },
            {
                label: <Link to="/admin/comment">Comment</Link>,
                key: '/admin/comment',
                icon: <CommentOutlined />
            }
        ];


        setMenuItems(items);
    }, []);

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res.status === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const itemsDropdown = [
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },
    ];

    return (
        <>
            <Layout
                style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden' }}
                className="layout-admin"
            >
                {!isMobile ?
                    <Sider
                        theme='light'
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}>
                        <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
                            <BugOutlined />  ADMIN
                        </div>
                        <Menu
                            selectedKeys={[activeMenu]}
                            mode="inline"
                            items={menuItems}
                            onClick={(e) => setActiveMenu(e.key)}
                        />
                    </Sider>
                    :
                    <Menu
                        selectedKeys={[activeMenu]}
                        items={menuItems}
                        onClick={(e) => setActiveMenu(e.key)}
                        mode="horizontal"
                    />
                }

                <Layout style={{ overflow: 'hidden' }}>
                    {!isMobile &&
                        <div className='admin-header' style={{ display: "flex", justifyContent: "space-between", marginRight: 20 }}>
                            <Button
                                type="text"
                                icon={collapsed ? React.createElement(MenuUnfoldOutlined) : React.createElement(MenuFoldOutlined)}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                }}
                            />

                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                <Space style={{ cursor: "pointer" }}>
                                    Welcome {user?.fullName || 'User'}
                                    <Avatar> {user?.fullName?.charAt(0) || 'U'} </Avatar>

                                </Space>
                            </Dropdown>
                        </div>
                    }
                    <Content style={{ padding: '15px', overflow: 'auto' }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>

        </>
    );
};

export default LayoutAdmin;
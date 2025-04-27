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
    CommentOutlined,
    AuditOutlined
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button, Badge } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { callLogout } from './../../api/services';
import { setLogoutAction } from './../../redux/slice/accountSlice';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const [pendingBooks, setPendingBooks] = useState(0);
    const [stompClient, setStompClient] = useState(null);
    const user = useAppSelector(state => state.account.user);

    const permissions = useAppSelector(state => state.account.user?.role?.permissions || []);
    const [menuItems, setMenuItems] = useState([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location])

    // Kết nối WebSocket để cập nhật số sách đang chờ duyệt
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log('AdminLayout connected to WebSocket');
            
            // Đăng ký nhận thông báo khi có sách mới
            client.subscribe('/topic/admin-books', (message) => {
                try {
                    const notification = JSON.parse(message.body);
                    console.log('AdminLayout received notification:', notification);
                    
                    const action = notification.action;
                    if (action === 'new') {
                        // Tăng số lượng sách chờ duyệt
                        setPendingBooks(prevCount => prevCount + 1);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP error:', frame.headers['message']);
            console.error('Additional details:', frame.body);
        };

        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, []);

    // Khi chuyển đến trang duyệt sách, đặt lại số lượng sách đang chờ duyệt
    useEffect(() => {
        if (location.pathname === '/admin/approval-books') {
            setPendingBooks(0);
        }
    }, [location.pathname]);

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
                label: (
                    <Link to="/admin/approval-books">
                        <Space>
                            Approval Books
                            {pendingBooks > 0 && (
                                <Badge count={pendingBooks} style={{ backgroundColor: '#f5222d' }} />
                            )}
                        </Space>
                    </Link>
                ),
                key: '/admin/approval-books',
                icon: <AuditOutlined />
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
    }, [pendingBooks]);

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
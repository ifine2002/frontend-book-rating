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
    ScheduleOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import { useDispatch, useSelector } from 'react-redux';
import { callLogout } from './../../api/services';
import { setLogoutAction } from './../../redux/slice/accountSlice';

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const user = useSelector(state => state.account.user);

    const permissions = useSelector(state => state.account.user?.role?.permissions || []);
    const [menuItems, setMenuItems] = useState([]);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        setActiveMenu(location.pathname)
    }, [location])

    useEffect(() => {
        console.log("User data:", user);
        console.log("Permissions:", permissions);

        const items = [
            {
                label: <Link to="/admin">Dashboard</Link>,
                key: '/admin',
                icon: <AppstoreOutlined />
            }
        ];

        if (permissions && permissions.length > 0) {
            if (permissions.includes("USER_VIEW")) {
                items.push({
                    label: <Link to="/admin/user">Quản lý người dùng</Link>,
                    key: '/admin/user',
                    icon: <UserOutlined />
                });
            }

            if (permissions.includes("BOOK_VIEW")) {
                items.push({
                    label: <Link to="/admin/book">Quản lý sách</Link>,
                    key: '/admin/book',
                    icon: <ExceptionOutlined />
                });
            }
        }

        setMenuItems(items);
    }, [permissions, user]);

    const handleLogout = async () => {
        const res = await callLogout();
        console.log('status=', res.status)
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
                style={{ minHeight: '100vh' }}
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

                <Layout>
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
                    <Content style={{ padding: '15px' }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>

        </>
    );
};

export default LayoutAdmin;
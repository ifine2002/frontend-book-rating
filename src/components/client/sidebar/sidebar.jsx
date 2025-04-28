import React from 'react';
import { Layout, Menu, Avatar } from 'antd';
import { 
  HomeOutlined, 
  SearchOutlined, 
  CompassOutlined, 
  PlusCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import '../../../styles/sidebar.scss';
import { Link, useLocation } from 'react-router-dom'; 

const { Sider } = Layout;

const Sidebar = () => {
  const location = useLocation();
  
  // Xác định mục menu active dựa trên đường dẫn hiện tại
  const getSelectedKey = () => {
    const pathname = location.pathname;
    
    if (pathname === '/') return 'home';
    if (pathname === '/search') return 'search';
    if (pathname === '/explore') return 'explore';
    if (pathname === '/create') return 'create';
    if (pathname === '/profile') return 'profile';
    
    return '';
  };

  return (
    <Sider
      width={220}
      className="sidebar"
      theme="light"
    >
      <div className="logo">
        <h1><Link to="/">Goodreads</Link></h1>
      </div>
      <Menu 
        mode="vertical" 
        className="sidebar-menu"
        selectedKeys={[getSelectedKey()]}
      >
        <Menu.Item key="home" icon={<HomeOutlined />}>
          <Link to="/">Trang chủ</Link>
        </Menu.Item>
        <Menu.Item key="search" icon={<SearchOutlined />}>
          <Link to="/search">Tìm kiếm</Link>
        </Menu.Item>
        <Menu.Item key="explore" icon={<CompassOutlined />}>
          <Link to="/explore">Khám phá</Link>
        </Menu.Item>
        <Menu.Item key="create" icon={<PlusCircleOutlined />}>
          <Link to="/create">Tạo</Link>
        </Menu.Item>
        <Menu.Item key="profile" icon={<Avatar size={24} icon={<UserOutlined />} />}>
          <Link to="/profile">Trang cá nhân</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
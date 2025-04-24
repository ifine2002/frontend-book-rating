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

const { Sider } = Layout;

const Sidebar = () => {
  return (
    <Sider
      width={220}
      className="sidebar"
      theme="light"
    >
      <div className="logo">
        <h1>Goodreads</h1>
      </div>
      <Menu mode="vertical" className="sidebar-menu">
        <Menu.Item key="home" icon={<HomeOutlined />}>
          Trang chủ
        </Menu.Item>
        <Menu.Item key="search" icon={<SearchOutlined />}>
          Tìm kiếm
        </Menu.Item>
        <Menu.Item key="explore" icon={<CompassOutlined />}>
          Khám phá
        </Menu.Item>
        <Menu.Item key="create" icon={<PlusCircleOutlined />}>
          Tạo
        </Menu.Item>
        <Menu.Item key="profile" icon={<Avatar size={24} icon={<UserOutlined />} />}>
          Trang cá nhân
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default Sidebar;
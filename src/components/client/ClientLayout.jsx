import { Layout } from 'antd';
import Sidebar from './sidebar/sidebar';
import { Outlet } from "react-router-dom";
import Header from './header';
const { Content, Sider } = Layout;

const LayoutClient = () => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Layout>
                <Sider
                    width={220}
                    theme="light"
                    style={{
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        zIndex: 2,
                    }}
                >
                    <Sidebar />
                </Sider>
                <Layout style={{ marginLeft: 220 }}>
                    <Header />
                    <Content style={{ padding: '0 24px' }}>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    )
}

export default LayoutClient;
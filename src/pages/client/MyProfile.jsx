import { useState, useEffect } from "react";
import { callFetchUserProfile } from "../../api/services";
import { Link } from "react-router-dom";
import { Card, Avatar, Tabs, Button, Typography, List, Divider, Empty, Spin } from "antd";
import { useAppSelector } from './../../redux/hooks';
import { 
  UserOutlined, 
  BookOutlined, 
  StarOutlined,
  UserDeleteOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const id  = useAppSelector(state => state.account.user.id);
    console.log("check id:", id)
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const res = await callFetchUserProfile(id);
                if (res && res.data) {
                    setUserData(res.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin người dùng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="flex justify-center items-center h-64">
                <Empty description="Không tìm thấy thông tin người dùng" />
            </div>
        );
    }

    const toggleFollow = () => {
        setIsFollowing(!isFollowing);
    };

    console.log("check isFollowing:", isFollowing)

    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* Header với thông tin người dùng */}
            <Card className="mb-6 shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-2 flex justify-center">
                        <Avatar 
                            src={userData.image} 
                            icon={!userData.image && <UserOutlined />} 
                            size={100}
                            className="border border-gray-200"
                        />
                    </div>
                    <div className="md:col-span-7 flex flex-col justify-center">
                        <Title level={4} className="mb-1">
                            {userData.fullName}
                        </Title>
                        <div className="flex gap-4 text-gray-600">
                            <Text>
                                <span className="font-bold">{userData.follower?.length || 0}</span> người theo dõi
                            </Text>
                            <Text>
                                <span className="font-bold">{userData.following?.length || 0}</span> đang theo dõi
                            </Text>
                        </div>
                    </div>
                    <div className="md:col-span-3 flex items-center justify-center md:justify-end">
                        <Button 
                            onClick={toggleFollow}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-white text-base transition 
                                        ${isFollowing === false ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                        >
                            {isFollowing === false ? 'Follow' : 'Đã Follow'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultActiveKey="follow" className="profile-tabs">
                <TabPane 
                    tab={<span><UserOutlined />Theo dõi</span>} 
                    key="follow"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Title level={5} className="mb-4">
                                Người theo dõi ({userData.follower?.length || 0})
                            </Title>
                            <Card className="shadow-sm">
                                {userData.follower && userData.follower.length > 0 ? (
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={userData.follower}
                                        renderItem={(user, index) => (
                                            <>
                                                <List.Item
                                                    actions={[
                                                        <Button key="follow-back" size="small">
                                                            Theo dõi lại
                                                        </Button>
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={<Avatar src={user.image} icon={!user.image && <UserOutlined />} />}
                                                        title={<Link to={`/profile/${user.id}`}>{user.fullName}</Link>}
                                                    />
                                                </List.Item>
                                                {index < userData.follower.length - 1 && <Divider className="my-2" />}
                                            </>
                                        )}
                                    />
                                ) : (
                                    <Empty description="Không có người theo dõi nào" />
                                )}
                            </Card>
                        </div>
                        <div>
                            <Title level={5} className="mb-4">
                                Đang theo dõi ({userData.following?.length || 0})
                            </Title>
                            <Card className="shadow-sm">
                                {userData.following && userData.following.length > 0 ? (
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={userData.following}
                                        renderItem={(user, index) => (
                                            <>
                                                <List.Item
                                                    actions={[
                                                        <Button 
                                                            key="unfollow" 
                                                            danger 
                                                            size="small"
                                                            icon={<UserDeleteOutlined />}
                                                        >
                                                            Bỏ theo dõi
                                                        </Button>
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={<Avatar src={user.image} icon={!user.image && <UserOutlined />} />}
                                                        title={<Link to={`/profile/${user.id}`}>{user.fullName}</Link>}
                                                    />
                                                </List.Item>
                                                {index < userData.following.length - 1 && <Divider className="my-2" />}
                                            </>
                                        )}
                                    />
                                ) : (
                                    <Empty description="Không theo dõi ai" />
                                )}
                            </Card>
                        </div>
                    </div>
                </TabPane>
                <TabPane 
                    tab={<span><BookOutlined />Sách</span>} 
                    key="books"
                >
                    <div className="p-4">
                        <Title level={5} className="mb-4">Sách đã thêm</Title>
                        <Empty description="Chưa có sách nào được thêm" />
                    </div>
                </TabPane>
                <TabPane 
                    tab={<span><StarOutlined />Đánh giá</span>} 
                    key="reviews"
                >
                    <div className="p-4">
                        <Title level={5} className="mb-4">Đánh giá sách</Title>
                        <Empty description="Chưa có đánh giá nào" />
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default ProfilePage;
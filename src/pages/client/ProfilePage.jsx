import { useState, useEffect, useRef } from "react";
import { callFetchUserProfile, callGetAllPostOfUser, callFetchAllBookFavoriteOfUser } from "../../api/services";
import { useParams, Link } from "react-router-dom";
import { Card, Avatar, Tabs, Button, Typography, List, Divider, Empty, Spin, Modal } from "antd";
import { 
  UserOutlined, 
  BookOutlined, 
  AuditOutlined,
  UserDeleteOutlined
} from '@ant-design/icons';
import queryString from 'query-string';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';
import BookList from '../../components/client/book/BookList';
import './../../styles/ProfilePage.scss';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Hàm throttle để cải thiện hiệu suất khi cuộn
const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
};

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followerVisible, setFollowerVisible] = useState(false);
    const [activeModalTab, setActiveModalTab] = useState("followers");
    const { id } = useParams();
    const isLoading = useRef(false);
    const headerRef = useRef(null);
    
    // Thêm state cho danh sách bài viết
    const [books, setBooks] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0
    });
    
    // WebSocket client
    const [stompClient, setStompClient] = useState(null);

    // Thêm state cho danh sách sách yêu thích
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [favoritePagination, setFavoritePagination] = useState({
        page: 1,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0
    });
    const isFavoriteLoading = useRef(false);
    const [loadingFavorite, setLoadingFavorite] = useState(false);

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
    
    // Khởi tạo WebSocket
    useEffect(() => {
        // Tạo WebSocket connection
        const socket = new SockJS('http://localhost:8080/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            debug: function (str) {
                console.log(str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // Khi kết nối thành công
        client.onConnect = () => {
            console.log('Connected to WebSocket');

            // Subscribe đến topic cập nhật sách
            client.subscribe('/topic/books', (message) => {
                try {
                    const notificationData = JSON.parse(message.body);
                    console.log('WebSocket notification received:', notificationData);
                    
                    // Cập nhật lại dữ liệu khi có sự thay đổi
                    if (notificationData.userId === id) {
                        resetAndFetchBooks();
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
        };

        // Khi mất kết nối
        client.onDisconnect = () => {
            console.log('Disconnected from WebSocket');
        };

        // Khi có lỗi
        client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        // Kết nối
        client.activate();
        setStompClient(client);

        // Cleanup khi unmount
        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [id]);

    // Fetch books lần đầu khi component mount
    useEffect(() => {
        if (id && userData?.email) {
            resetAndFetchBooks();
        }
    }, [id, userData]);

    // Reset dữ liệu và fetch lại từ đầu
    const resetAndFetchBooks = () => {
        setBooks([]);
        setPagination(prev => ({
            ...prev,
            page: 1,
            totalElements: 0,
            totalPages: 0
        }));
        
        fetchBooks(1); // Trang 1
    };

    // Hàm lấy dữ liệu sách từ API
    const fetchBooks = async (pageNumber) => {
        // Ngăn ngừa fetch trùng lặp
        if (isLoading.current) {
            console.log('Fetch already in progress, skipping');
            return Promise.resolve();
        }

        console.log(`Starting fetch for page ${pageNumber}...`);
        isLoading.current = true;
        setLoading(true);
        
        try {
            // API sử dụng 0-based index
            const pageForApi = pageNumber - 1;
            
            console.log(`Fetching user posts, page ${pageNumber} (API page: ${pageForApi})...`);
            
            // Tạo query string với page, size, sort và userId
            const params = {
                page: pageForApi,
                size: pagination.pageSize,
                sort: 'updatedAt,desc',
                userId: id
            };


            // Gọi API
            const query = queryString.stringify(params);
            const response = await callGetAllPostOfUser(userData.email, query);
            if (response && response.data) {
                const { result, totalPages, totalElements } = response.data;
                
                console.log(`API returned ${result?.length || 0} books (page ${pageNumber}/${totalPages})`);
                
                // Nếu đây là lần fetch đầu tiên hoặc page là 1, thay thế books
                if (pageNumber === 1) {
                    setBooks(result || []);
                } else {
                    // Nếu không, thêm vào danh sách hiện tại
                    setBooks(prevBooks => [...prevBooks, ...(result || [])]);
                }
                
                // Cập nhật pagination
                setPagination({
                    page: pageNumber,
                    pageSize: pagination.pageSize,
                    totalElements,
                    totalPages
                });
            }
            return Promise.resolve();
        } catch (error) {
            console.error('Error fetching user posts:', error);
            return Promise.reject(error);
        } finally {
            setLoading(false);
            isLoading.current = false;
        }
    };

    // Xử lý khi người dùng cuộn xuống để tải thêm sách
    const handleLoadMore = () => {
        if (isLoading.current) {
            console.log('Loading already in progress, ignoring load more request');
            return;
        }

        const nextPage = pagination.page + 1;
        
        console.log(`Load more triggered. Loading page ${nextPage}`);
        
        if (nextPage <= pagination.totalPages) {
            // Lưu lại vị trí scroll hiện tại
            const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            fetchBooks(nextPage).then(() => {
                // Khôi phục lại vị trí scroll sau khi hoàn thành
                setTimeout(() => {
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: 'auto'
                    });
                }, 100);
            });
        } else {
            console.log('No more pages to load');
        }
    };

    // Thêm effect để xử lý sự kiện scroll
    useEffect(() => {
        // Xử lý sự kiện scroll với throttle để tăng hiệu suất
        const handleScroll = throttle(() => {
            if (headerRef.current) {
                // Kiểm tra vị trí cuộn
                const scrollPosition = window.scrollY || document.documentElement.scrollTop;
                if (scrollPosition > 10) {
                    headerRef.current.classList.add('sticky');
                } else {
                    headerRef.current.classList.remove('sticky');
                }
            }
        }, 100); // Throttle với 100ms

        // Kích hoạt ngay lập tức để đặt trạng thái ban đầu
        handleScroll();
        
        // Thêm sự kiện listener
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        
        // Cleanup
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    // Fetch favorite books lần đầu khi component mount
    useEffect(() => {
        if (id && userData?.email) {
            resetAndFetchFavoriteBooks();
        }
    }, [id, userData]);

    // Reset dữ liệu và fetch lại từ đầu cho sách yêu thích
    const resetAndFetchFavoriteBooks = () => {
        setFavoriteBooks([]);
        setFavoritePagination(prev => ({
            ...prev,
            page: 1,
            totalElements: 0,
            totalPages: 0
        }));
        fetchFavoriteBooks(1, 5); // Mặc định hiển thị 5 sách
    };

    // Hàm lấy dữ liệu sách yêu thích từ API
    const fetchFavoriteBooks = async (pageNumber, pageSize = 5) => {
        if (isFavoriteLoading.current) {
            return Promise.resolve();
        }
        isFavoriteLoading.current = true;
        setLoadingFavorite(true);
        try {
            const pageForApi = pageNumber - 1;
            const params = {
                page: pageForApi,
                size: pageSize,
                userId: id
            };
            const query = queryString.stringify(params);
            const response = await callFetchAllBookFavoriteOfUser(query);
            if (response && response.data) {
                const { result, totalPages, totalElements } = response.data;
                setFavoriteBooks(result || []);
                setFavoritePagination({
                    page: pageNumber,
                    pageSize: pageSize,
                    totalElements,
                    totalPages
                });
            }
            return Promise.resolve();
        } catch (error) {
            console.error('Error fetching favorite books:', error);
            return Promise.reject(error);
        } finally {
            setLoadingFavorite(false);
            isFavoriteLoading.current = false;
        }
    };

    // Xử lý khi người dùng thay đổi trang hoặc số lượng sách hiển thị
    const handleFavoritePageChange = (page, pageSize) => {
        console.log('Changing page:', page, 'pageSize:', pageSize);
        fetchFavoriteBooks(page, pageSize);
    };

    // Xử lý khi người dùng cuộn xuống để tải thêm sách yêu thích
    const handleLoadMoreFavorite = () => {
        if (isFavoriteLoading.current) return;
        const nextPage = favoritePagination.page + 1;
        if (nextPage <= favoritePagination.totalPages) {
            fetchFavoriteBooks(nextPage, favoritePagination.pageSize);
        }
    };

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

    const showFollowersModal = () => {
        setActiveModalTab("followers");
        setFollowerVisible(true);
    };

    const showFollowingModal = () => {
        setActiveModalTab("following");
        setFollowerVisible(true);
    };

    const handleModalClose = () => {
        setFollowerVisible(false);
    };


    return (
        <div className="max-w-6xl mx-auto p-4">
            {/* Header với thông tin người dùng */}
            <div style={{ height: 'auto', minHeight: '160px' }}>
                <Card 
                    className="mb-6 shadow-md profile-user-header"
                    ref={headerRef}
                >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-2 flex justify-center items-center">
                            <Avatar 
                                src={userData.image} 
                                icon={!userData.image && <UserOutlined />} 
                                size={100}
                                className="border border-gray-200"
                            />
                        </div>
                        <div className="md:col-span-7 flex flex-col justify-center min-h-[120px]">
                            <Title level={4} className="mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                {userData.fullName}
                            </Title>
                            <div className="flex gap-4 text-gray-600">
                                <Text className="cursor-pointer hover:text-blue-500" onClick={showFollowersModal}>
                                    <span className="font-bold">{userData.follower?.length || 0}</span> Follower
                                </Text>
                                <Text className="cursor-pointer hover:text-blue-500" onClick={showFollowingModal}>
                                    <span className="font-bold">{userData.following?.length || 0}</span> Đã follow
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
            </div>

            {/* Modal kết hợp người theo dõi và đang theo dõi */}
            <Modal
                title="Người dùng"
                open={followerVisible}
                onCancel={handleModalClose}
                footer={null}
                width={600}
            >
                <Tabs 
                    defaultActiveKey={activeModalTab}
                    activeKey={activeModalTab}
                    onChange={(key) => setActiveModalTab(key)}
                >
                    <TabPane tab={`Follower ${userData.follower?.length || 0}`} key="followers">
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
                                                title={<Link to={`/profile/${user.id}`} onClick={handleModalClose}>{user.fullName}</Link>}
                                            />
                                        </List.Item>
                                        {index < userData.follower.length - 1 && <Divider className="my-2" />}
                                    </>
                                )}
                            />
                        ) : (
                            <Empty description="Không có người theo dõi nào" />
                        )}
                    </TabPane>
                    <TabPane tab={`Đã follow ${userData.following?.length || 0}`} key="following">
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
                                                title={<Link to={`/profile/${user.id}`} onClick={handleModalClose}>{user.fullName}</Link>}
                                            />
                                        </List.Item>
                                        {index < userData.following.length - 1 && <Divider className="my-2" />}
                                    </>
                                )}
                            />
                        ) : (
                            <Empty description="Không theo dõi ai" />
                        )}
                    </TabPane>
                </Tabs>
            </Modal>

            {/* Tabs */}
            <div className="profile-content">
                <Tabs defaultActiveKey="post" className="profile-tabs mt-6">
                    <TabPane 
                        tab={<span><AuditOutlined />Bài Viết</span>} 
                        key="post"
                    >
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Title level={5} className="mb-4">
                                    Bài viết của {userData.fullName}
                                </Title>
                                <BookList
                                    books={books}
                                    loading={loading}
                                    pagination={pagination}
                                    onLoadMore={handleLoadMore}
                                />
                            </div>
                        </div>
                    </TabPane>
                    <TabPane 
                        tab={<span><BookOutlined />Yêu Thích</span>} 
                        key="books"
                    >
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Title level={5} className="mb-4">Sách yêu thích</Title>
                                <BookList
                                    books={favoriteBooks}
                                    loading={loadingFavorite}
                                    pagination={favoritePagination}
                                    onLoadMore={handleLoadMoreFavorite}
                                    onPageChange={handleFavoritePageChange}
                                    simple={true}
                                />
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default ProfilePage;
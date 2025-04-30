import React, { useState, useEffect } from 'react';
import { Input, Tabs, Pagination, Empty, Spin, Button, Rate } from 'antd';
import { callSearchHomeBook, callSearchUser } from './../../api/services';
import BookCard from '../../components/client/book/BookCard';
import './../../components/client/book/BookDetail.scss';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const { TabPane } = Tabs;
const { Search } = Input;

const SearchPage = () => {
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('books');
    const [bookData, setBookData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [bookPagination, setBookPagination] = useState({
        current: 0,
        pageSize: 8,
        total: 0
    });
    const [userPagination, setUserPagination] = useState({
        current: 0,
        pageSize: 8,
        total: 0
    });

    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('query') || params.get('keyword') || '';
        const tab = params.get('tab') || 'books';
        
        setSearchText(query);
        setActiveTab(tab);
        
        if (query) {
            if (tab === 'books') {
                fetchBooks(query, 0);
            } else {
                fetchUsers(query, 0);
            }
        }
    }, [location.search]);

    const handleSearch = (value) => {
        if (!value.trim()) return;
        setSearchText(value);
        navigate(`/search?keyword=${encodeURIComponent(value)}&tab=${activeTab}`);
        
        if (activeTab === 'books') {
            fetchBooks(value, 0);
        } else {
            fetchUsers(value, 0);
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        navigate(`/search?keyword=${encodeURIComponent(searchText)}&tab=${key}`);
        
        if (key === 'books' && searchText) {
            fetchBooks(searchText, 0);
        } else if (key === 'users' && searchText) {
            fetchUsers(searchText, 0);
        }
    };

    const fetchBooks = async (query, page) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            const queryParams = `page=${page}&size=${bookPagination.pageSize}&keyword=${encodeURIComponent(query.trim())}`;
            const res = await callSearchHomeBook(queryParams);
            
            if (res?.data) {
                setBookData(res.data.result || []);
                setBookPagination({
                    ...bookPagination,
                    current: page,
                    total: res.data.totalElements || 0
                });
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm sách:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (query, page) => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const queryParams = `page=${page}&size=${userPagination.pageSize}&keyword=${encodeURIComponent(query.trim())}`;
            
            const res = await callSearchUser(queryParams);
            if (res?.data) {
                setUserData(res.data.result || []);
                setUserPagination({
                    ...userPagination,
                    current: page,
                    total: res.data.totalElements || 0
                });
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm người dùng:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBookPageChange = (page) => {
        fetchBooks(searchText, page-1);
    };

    const handleUserPageChange = (page) => {
        fetchUsers(searchText, page-1);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="w-full">
                <h1 className="text-2xl font-semibold mb-5">Tìm kiếm</h1>
                <Search
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={handleSearch}
                    enterButton
                    size="large"
                    className="mb-5"
                />
                
                <Tabs activeKey={activeTab} onChange={handleTabChange} className="mt-4">
                    <TabPane tab="Sách" key="books">
                        <Spin spinning={loading}>
                            {bookData.length > 0 ? (
                                <>
                                    <div className="flex flex-col space-y-4 mb-5">
                                        {bookData.map(book => (
                                            <div key={book.id} className="flex border-b border-gray-200 pb-4">
                                                <div className="w-20 h-28 flex-shrink-0 mr-5">
                                                    <img 
                                                        src={book.image} 
                                                        alt={book.name}
                                                        className="w-full h-full object-cover shadow-md" 
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-lg font-semibold mb-1">
                                                        <Link to={`/book/${book.id}`} className="text-blue-600 hover:underline">{book.name}</Link>
                                                    </div>
                                                    <div className="text-sm text-gray-700 mb-2">
                                                        Tác giả: {book.author}
                                                    </div>
                                                    <div className="flex items-center mb-2">
                                                        <Rate allowHalf disabled defaultValue={book.averageRating || 0} className="text-sm" /> 
                                                        <span className="text-xs text-gray-500 ml-3">
                                                            {book.averageRating || 0} avg rating — {book.ratingCount || 0} ratings
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mb-3">
                                                        published {book.publishedDate}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {bookPagination.total > bookPagination.pageSize && (
                                        <div className="flex justify-center mt-5">
                                            <Pagination 
                                                current={bookPagination.current + 1}
                                                pageSize={bookPagination.pageSize}
                                                total={bookPagination.total}
                                                onChange={handleBookPageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Empty description={searchText ? "Không tìm thấy sách nào" : "Vui lòng nhập từ khóa để tìm kiếm"} />
                            )}
                        </Spin>
                    </TabPane>
                    
                    <TabPane tab="Người dùng" key="users">
                        <Spin spinning={loading}>
                            {searchText ? (
                                userData.length > 0 ? (
                                    <div className="flex flex-col space-y-4">
                                        {userData.map(user => (
                                            <div key={user.id} 
                                                className="flex items-start p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-shadow duration-300"
                                                onClick={() => navigate(`/profile/${user.id}`)}
                                            >
                                                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 mr-5">
                                                    <img 
                                                        src={user.image || 'https://via.placeholder.com/150'} 
                                                        alt={user.fullName} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold mb-2">{user.fullName}</h3>
                                                    <p className="text-gray-600 mb-1">{user.address}</p>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {userPagination.total > userPagination.pageSize && (
                                            <div className="flex justify-center mt-5">
                                                <Pagination 
                                                    current={userPagination.current + 1}
                                                    pageSize={userPagination.pageSize}
                                                    total={userPagination.total}
                                                    onChange={handleUserPageChange}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Empty description="Không tìm thấy người dùng nào" />
                                )
                            ) : (
                                <Empty description="Vui lòng nhập từ khóa để tìm kiếm" />
                            )}
                        </Spin>
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default SearchPage;
import React, { useState, useEffect, useRef } from 'react';
import { Typography, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';
import queryString from 'query-string';

import { callGetHomeBooks } from '../../api/services';
import BookList from '../../components/client/book/BookList';

const { Title } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const isLoading = useRef(false);

  // State
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });

  // WebSocket client
  const [stompClient, setStompClient] = useState(null);

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
          resetAndFetchBooks();
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      
      // Subscribe đến topic duyệt sách từ trang admin approval
      client.subscribe('/topic/admin-books', (message) => {
        try {
          const notificationData = JSON.parse(message.body);
          if (notificationData.action === 'approve') {
            const approvedBook = notificationData.data;
            setBooks(prevBooks => {
              if (prevBooks.some(book => book.bookId === approvedBook.bookId)) {
                return prevBooks;
              }
              return [approvedBook, ...prevBooks];
            });
            setPagination(prev => ({
              ...prev,
              totalElements: prev.totalElements + 1
            }));
          }
        } catch (error) {
          console.error('Error parsing admin book WebSocket message:', error);
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
  }, []);

  // Fetch books lần đầu khi component mount
  useEffect(() => {
    resetAndFetchBooks();
  }, []);

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
      return;
    }

    console.log(`Starting fetch for page ${pageNumber}...`);
    isLoading.current = true;
    setLoading(true);
    
    try {
      // API sử dụng 0-based index
      const pageForApi = pageNumber - 1;
      
      console.log(`Fetching page ${pageNumber} (API page: ${pageForApi})...`);
      
      // Tạo query string chỉ với page, size và sort
      const params = {
        page: pageForApi,
        size: pagination.pageSize,
        sort: 'updatedAt,desc' // Mặc định sắp xếp theo ngày tạo, mới nhất trước
      };

      // Gọi API
      const query = queryString.stringify(params);
      const response = await callGetHomeBooks(query);
      
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
        
        console.log(`Updated books: now showing ${pageNumber === 1 ? (result?.length || 0) : books.length + (result?.length || 0)} books`);
        console.log(`Pagination updated: page=${pageNumber}, totalPages=${totalPages}`);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
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
      fetchBooks(nextPage);
    } else {
      console.log('No more pages to load');
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-6">
      <div className="container mx-auto px-4">
        <Spin spinning={loading} size='large'>
          <BookList
            books={books}
            loading={loading}
            pagination={pagination}
            onLoadMore={handleLoadMore}
          />
        </Spin>
      </div>
    </div>
  );
};

export default HomePage; 
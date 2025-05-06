import React, { useState, useEffect } from 'react';
import { Card, Rate, Tag, Typography, Space, Avatar, Button, Tooltip, Input } from 'antd';
import { Link } from 'react-router-dom';
import { 
  BookOutlined, 
  UserOutlined, 
  HeartOutlined, 
  MessageOutlined, 
  CalendarOutlined,
  ShoppingCartOutlined,
  HeartFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
import BookDetailModal from './BookDetailModal';
import { useAppSelector } from '../../../redux/hooks';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { callGetPostById } from '../../../api/services';

const { Meta } = Card;
const { Text, Title, Paragraph } = Typography;

const BookCard = ({ book: initialBook }) => {
  const [favorite, setFavorite] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [book, setBook] = useState(initialBook);
  const defaultImage = 'https://placehold.co/300x400?text=No+Image';
  const user = useAppSelector(state => state.account.user);
  
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function (str) {
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/reviews/${initialBook.bookId}`, async (message) => {
        if (message.body) {
          const notification = JSON.parse(message.body);
          const { action } = notification;
          
          if (action === "create" || action === "delete") {
            await fetchBookDetail();
          }
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();

    return () => {
      if (client && client.connected) {
        client.deactivate();
      }
    };
  }, [initialBook.bookId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };
  
  const openBookDetailModal = () => {
    setModalVisible(true);
  };

  const closeBookDetailModal = () => {
    setModalVisible(false);
  };

  const fetchBookDetail = async () => {
    try {
      const response = await callGetPostById(initialBook.id);
      if (response.data) {
        setBook(prevBook => ({
          ...prevBook,
          stars: response.data.stars
        }));
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
    }
  };

  console.log("check ratingCount: ", book.stars.ratingCount)
  
  return (
    <>
      <Card
        className="mb-7 shadow-md"
        actions={[
          <Tooltip key="rating-tooltip" title="Đánh giá">
            <Button type="text" icon={<MessageOutlined />} onClick={openBookDetailModal}>
              {book.stars?.ratingCount || 0}
            </Button>
          </Tooltip>,
        ]}
      >
        <div className="flex items-center mb-4">
          <Avatar 
            src={book.user.image} 
            icon={<UserOutlined />} 
            size={40}
          />
          <div className="ml-3">
            <Link to={`/profile/${book.user.id}`} className="hover:underline">
              <Text strong>{book.user.fullName}</Text>
            </Link>
            <div>
              <Text type="secondary" className="text-xs">
                <CalendarOutlined className="mr-1" />
                {formatDate(book.updatedAt)}
              </Text>
            </div>
          </div>
        </div>

        <Link to={`/book/${book.bookId}`} className="hover:underline">
          <Title level={4} className="mb-2">
            {book.name}
          </Title>
        </Link>
        
        <Paragraph 
          ellipsis={{
            rows: 3,
            expandable: true,
            symbol: 'Xem thêm',
          }} 
          className="text-gray-700 mb-4"
        >
          {book.description || 'Không có mô tả cho sách này.'}
        </Paragraph>
      
        <div className="flex gap-4 mt-5">
          <div>
            <img 
              alt={book.name} 
              src={book.bookImage || defaultImage}
              className="object-cover rounded-lg"
              style={{ height: '300px', width: '225px' }}
            />
            <div className="book-actions flex gap-2 mt-2">
              <Button 
                type="primary" 
                size="middle" 
                icon={<ShoppingCartOutlined />}
                href={book.bookSaleLink}
                target="_blank"
              >
                Tìm mua
              </Button>
              <Button 
                size="middle" 
                icon={favorite ? <HeartFilled /> : <HeartOutlined />} 
                onClick={toggleFavorite}
                className={favorite ? 'favorite-button active' : 'favorite-button'}
              >
                Yêu thích
              </Button>
            </div>
          </div>
          
          <Space direction="vertical" size="small" className="w-full">
            <div className="">
              <Text type="secondary" className="flex items-center">
                <UserOutlined className="mr-1" /> Tác giả: {book.author}
              </Text>
              
              <Text type="secondary" className="flex items-center mt-4">
                <BookOutlined className="mr-1" /> {book.bookFormat}
              </Text>

              <Text className="flex items-center mt-4">
                Ngôn ngữ: {book.language}
              </Text>

              <Text className="flex items-center mt-4">
                Ngày xuất bản: {book.publishedDate}
              </Text>
            </div>

            {book.categories && book.categories.length > 0 && (
              <div className="mt-3">
                <Text className="mr-2">Thể loại:</Text>
                {book.categories.map((category, index) => (
                  <Tag 
                    key={`${category.categoryId || category.id || 'cat'}-${index}-${book.bookId}`} 
                    color="blue" 
                    className="mb-1"
                  >
                    {category.name}
                  </Tag>
                ))}
              </div>
            )}

            {book.stars && (
              <div className="flex items-center mt-2 cursor-pointer" onClick={openBookDetailModal}>
                <Text className="mr-2">Đánh giá:</Text>
                <Rate allowHalf disabled defaultValue={book.stars.averageRating || 0} className="text-sm" />
                <Text className="ml-2">
                  ({book.stars?.ratingCount || 0})
                </Text>
              </div>
            )}
            
          </Space>
        </div>
    
   
      </Card>

      <BookDetailModal
        visible={modalVisible}
        bookId={book.bookId}
        onCancel={closeBookDetailModal}
        user={user}
      />
    </>
  );
};

export default BookCard; 
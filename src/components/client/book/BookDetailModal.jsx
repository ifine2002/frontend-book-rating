import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Typography, Rate, Divider, Row, Col, Avatar } from 'antd';
import { callGetBookDetailById } from '../../../api/services';
import ActionReview from '../review/ActionReview';
import ListReview from '../review/ListReview';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import './BookDetailModal.scss';

const { Title, Text, Paragraph } = Typography;

const BookDetailModal = ({ visible, bookId, onCancel, user }) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [listReview, setListReview] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [stars, setStars] = useState(null);

  const fetchBookDetail = useCallback(async (showLoading = true) => {
    if (!bookId) return;
    
    try {
      if (showLoading) setLoading(true);
      const response = await callGetBookDetailById(bookId);
      setBook(response.data);
      setListReview(response.data.reviews);
      if (showLoading) setLoading(false);
      setStars(response.data.stars);
    } catch (error) {
      console.error('Error fetching book details:', error);
      if (showLoading) setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (visible && bookId) {
      fetchBookDetail();
    }
  }, [visible, bookId, fetchBookDetail]);

  useEffect(() => {
    if (user?.id && listReview?.length > 0) {
      const existingReview = listReview.find(review => review.userId === user.id);
      if (existingReview) {
        setUserReview(existingReview);
        setRating(existingReview.stars || 0);
        setComment(existingReview.comment || '');
      } else {
        setUserReview(null);
        setRating(0);
        setComment('');
      }
    }
  }, [user, listReview]);

  useEffect(() => {
    if (!visible || !bookId) return;

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
      client.subscribe(`/topic/reviews/${bookId}`, (message) => {
        if (message.body) {
          const notification = JSON.parse(message.body);
          
          const { action, data, timestamp } = notification;
          
          switch (action) {
            case "create":
            case "update":
              handleReviewCreateOrUpdate(data);
              break;
            case "delete":
              handleReviewDelete(data);
              break;
            default:
              console.warn("Không xác định được action:", action);
          }
          
          fetchBookDetail(false);
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
  }, [visible, bookId, user?.id, fetchBookDetail]);

  const handleReviewCreateOrUpdate = (reviewData) => {
    setListReview(prevReviews => {
      const existingReviewIndex = prevReviews.findIndex(r => r.userId === reviewData.userId);
      
      if (existingReviewIndex !== -1) {
        const updatedReviews = [...prevReviews];
        updatedReviews[existingReviewIndex] = {
          ...updatedReviews[existingReviewIndex],
          stars: reviewData.stars,
          comment: reviewData.comment,
          updatedAt: reviewData.updatedAt
        };
        return updatedReviews;
      } else {
        return [reviewData, ...prevReviews];
      }
    });
    
    if (reviewData.userId === user?.id) {
      setUserReview(reviewData);
      setRating(reviewData.stars || 0);
      setComment(reviewData.comment || '');
    }
  };

  const handleReviewDelete = (userId) => {
    setListReview(prevReviews => 
      prevReviews.filter(review => review.userId !== userId)
    );
    
    if (user?.id === userId) {
      setUserReview(null);
      setRating(0);
      setComment('');
    }
  };

  return (
    <Modal
      title={book?.name || 'Chi tiết sách'}
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={null}
      centered
      styles={{
        body: {
          maxHeight: '80vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px 24px'
        },
        content: {
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 100px)',
        }
      }}
      getContainer={false} 
    >
      {loading ? (
        <div className="loading-container">Đang tải...</div>
      ) : !book ? (
        <div className="error-container">Không tìm thấy thông tin sách</div>
      ) : (
        <div className="book-modal-content">
          <div className="book-header">
            <div className="book-image-container">
              <img src={book.image} alt={book.name} className="book-modal-image" />
            </div>
            <div className="book-info">
              <Title level={3}>{book.name}</Title>
              <div className="book-author">
                <Text>Tác giả: {book.author}</Text>
              </div>
              
              <div className="book-rating">
                <Rate allowHalf disabled value={stars?.averageRating || 0} />
                <Text className="rating-count">{stars?.averageRating?.toFixed(1) || 0}</Text>
                <Text className="reviews-count">({stars?.ratingCount || 0} đánh giá)</Text>
              </div>
              
              <Paragraph className="book-description" ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>
                {book.description}
              </Paragraph>
            </div>
          </div>
          
          <Divider />
          
          <div className="book-additional-info">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Text strong>Thể loại:</Text>
                <div>{book.categories?.map(cat => cat.name).join(', ')}</div>
              </Col>
              <Col span={8}>
                <Text strong>Định dạng</Text>
                <div>{book.bookFormat}</div>
              </Col>
              <Col span={8}>
                <Text strong>Ngày xuất bản</Text>
                <div>{book.publishedDate}</div>
              </Col>
            </Row>
          </div>
          
          <Divider />
          
          <ActionReview
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            userReview={userReview}
            bookIdModal={bookId}
          />
          
          <ListReview
            stars={stars}
            listReview={listReview}
          />
        </div>
      )}
    </Modal>
  );
};

export default BookDetailModal; 
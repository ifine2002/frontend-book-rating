import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Rate, Tag, Button, Divider, Card, List, Avatar, Input, Dropdown, Popconfirm } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled, StarOutlined, MoreOutlined } from '@ant-design/icons';
import { callGetBookDetailById } from '../../../api/services';
import { useParams } from 'react-router-dom';
import './BookDetail.css';
import { useAppSelector } from '../../../redux/hooks';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const BookDetail = () => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const { id } = useParams();

  const user = useAppSelector(state => state.account.user);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [listReview, setListReview] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [stars, setStart] = useState(null);


  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        const response = await callGetBookDetailById(id);
        console.log("check res:", response)
        setBook(response.data);
        setListReview(response.data.reviews)
        setLoading(false);
        setStart(response.data.stars)
      } catch (error) {
        console.error('Error fetching book details:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetail();
    }
  }, [id]);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đánh giá sách này chưa
    if (user?.id && listReview?.length > 0) {
      const existingReview = listReview.find(review => review.userId === user.id);
      if (existingReview) {
        setUserReview(existingReview);
        setRating(existingReview.stars || 0);
        setComment(existingReview.comment || '');
      }
    }
  }, [user, listReview]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!book) {
    return <div>Không tìm thấy sách</div>;
  }

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  const handleSubmitReview = async () => {

  }

  const handleDeleteReview = () => {
    // Xử lý xóa đánh giá của người dùng hiện tại
    console.log("Xóa đánh giá có ID:", userReview?.id);
  }

  console.log("check reviews: ", listReview)

  const items = [
    {
      key: '1',
      label: (
        <Popconfirm
        placement="bottomLeft"
          title="Xác nhận xóa đánh giá"
          description="Bạn có chắc chắn muốn xóa đánh giá này?"
          onConfirm={handleDeleteReview}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <span style={{ color: '#ff4d4f' }}>Xóa</span>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="book-detail-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={24} md={8} lg={8}>
          <div className="book-image-container">
            <img src={book.image} alt={book.name} className="book-image" />
            <div className="book-actions">
              <Button 
                type="primary" 
                size="large" 
                icon={<ShoppingCartOutlined />}
                href={book.bookSaleLink}
                target="_blank"
              >
                Tìm mua
              </Button>
              <Button 
                size="large" 
                icon={favorite ? <HeartFilled /> : <HeartOutlined />} 
                onClick={toggleFavorite}
                className={favorite ? 'favorite-button active' : 'favorite-button'}
              >
                Yêu thích
              </Button>
            </div>
          </div>
          
        </Col>
        <Col xs={24} sm={24} md={16} lg={16}>
          <div className="book-info">
            <div className="book-header">
              <Title level={2}>{book.name}</Title>
              <div className="book-author">
                <Text>Tác giả: {book.author}</Text>
              </div>
            </div>
            
            <div className="book-rating">
              <Rate disabled defaultValue={4} />
              <Text className="rating-count">{book.rating?.toFixed(1)}</Text>
              <Text className="reviews-count">({stars.ratingCount} đánh giá)</Text>
            </div>
            
            <Paragraph className="book-description">
              {book.description}
            </Paragraph>
            <div className='book-categories'>
                <Text><span style={{'fontWeight': 'bold'}}>Thể loại:</span> {book.categories?.map(cat => cat.name).join(', ')}</Text>
            </div>
            
            <div className="book-details">
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Text strong>Định dạng</Text>
                  <div>{book.bookFormat}</div>
                </Col>
                <Col span={8}>
                  <Text strong>Ngôn ngữ</Text>
                  <div>{book.language}</div>
                </Col>
                <Col span={8}>
                  <Text strong>Ngày xuất bản</Text>
                  <div>{book.publishedDate}</div>
                </Col>
              </Row>
            </div>
            
            <Divider />
            
          </div>
        </Col>
      </Row>
      
      <div className="book-review">
        <div className="review-header">
          <StarOutlined style={{ fontSize: '24px', color: '#faad14' }} />
          <h3>Chia sẻ suy nghĩ của bạn về cuốn sách này</h3>
        </div>
        <div className="review-form">
          <div className="comment-input">
            <TextArea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Mô tả đánh giá của bạn (không bắt buộc)"
              rows={4}
              style={{ margin: '8px 0' }}
            />
          </div>
          <div className="rating-input">
            <Rate 
              value={rating} 
              onChange={setRating}
              style={{ fontSize: '24px' }}
            />
          </div>
          
          <Button 
            type="primary" 
            onClick={handleSubmitReview}
            size="large"
            style={{'marginRight': '10px'}}
          >
            {userReview ? 'Sửa' : 'Gửi'}
          </Button>

          <div style={{ width: '40px', display: 'inline-block' }}>
            {userReview && (
                <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                  <Button 
                    type="text" 
                    icon={<MoreOutlined style={{ fontSize: '20px' }}/>}
                    style={{ height: '40px' }}
                  />
                </Dropdown>
              )}
          </div>
        </div>
      </div>
    
      
      <div className='list-review'>
        <div className="header-list-review">
          <Divider>Điểm xếp hạng và bài đánh giá</Divider>
        </div>
        <div className="rating-statistics">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <div className="rating-average">
                <div className="rating-average-number">
                  {stars?.averageRating?.toFixed(1)}
                </div>
                <Rate 
                  disabled 
                  allowHalf 
                  value={stars?.averageRating} 
                  className="rating-average-stars" 
                />
                <div className="rating-count-text">
                  {stars?.ratingCount} đánh giá
                </div>
              </div>
            </Col>
            
            <Col xs={24} sm={16} md={18}>
              {[
                { value: 5, count: stars?.totalFiveStar},
                { value: 4, count: stars?.totalFourStar},
                { value: 3, count: stars?.totalThreeStar},
                { value: 2, count: stars?.totalTwoStar},
                { value: 1, count: stars?.totalOneStar}
              ].map(star => {
                // Tính phần trăm cho mỗi mức sao
                const percentage = stars?.ratingCount > 0
                  ? Math.round((star.count / stars.ratingCount) * 100)
                  : 0;
                  
                return (
                  <Row key={star.value} align="middle" className="star-row">
                    <Col span={4}>
                      <div className="star-label">
                        <span className="star-number">{star.value}</span>
                        <StarOutlined style={{ color: '#faad14' }} />
                      </div>
                    </Col>
                    <Col span={16}>
                      <div className="star-progress-container">
                        <div 
                          className="star-progress-bar" 
                          style={{ width: `${percentage}%` }} 
                        />
                      </div>
                    </Col>
                    <Col span={4}>
                      <div className="star-percentage">
                        <span>{percentage}%</span>
                        <span className="star-count">({star.count})</span>
                      </div>
                    </Col>
                  </Row>
                );
              })}
            </Col>
          </Row>
        </div>
        
        {/* Phần danh sách đánh giá có thể đặt ở đây */}
      </div>
    </div>
  );
};

export default BookDetail;
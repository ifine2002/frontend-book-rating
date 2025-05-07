import React from 'react';
import { Card, Rate, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Meta } = Card;
const { Text } = Typography;

const SimpleBookCard = ({ book }) => {
  const defaultImage = 'https://placehold.co/300x400?text=No+Image';

  return (
    <Link to={`/book/${book.id}`} style={{ textDecoration: 'none' }}>
      <Card
        hoverable
        cover={
          <img
            alt={book.name}
            src={book.bookImage || book.image || defaultImage}
            style={{ height: 220, objectFit: 'cover' }}
          />
        }
        style={{ width: 180, margin: '0 auto' }}
        bodyStyle={{ padding: 12 }}
      >
        <Meta
          title={<Text ellipsis style={{ width: 150 }}>{book.name}</Text>}
          description={
            <div style={{ marginTop: 8 }}>
              <Rate allowHalf disabled value={book.averageRating || 0} style={{ fontSize: 16 }} />
              <span style={{ marginLeft: 8, color: '#888' }}>
                {book.averageRating ? book.averageRating.toFixed(1) : '0.0'}
              </span>
            </div>
          }
        />
      </Card>
    </Link>
  );
};

export default SimpleBookCard; 
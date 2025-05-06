import React, { useRef, useEffect } from 'react';
import { Row, Col, Spin, Empty, Button } from 'antd';
import BookCard from './BookCard';

const BookList = ({ books, loading, pagination, onLoadMore }) => {
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  // Thiết lập Intersection Observer khi component mount
  useEffect(() => {
    // Hủy observer cũ nếu có
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Tạo observer mới nếu có ref và còn trang để tải
    if (loadMoreRef.current && pagination && pagination.page <= pagination.totalPages) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          // Nếu phần tử trong viewport và còn trang để tải và không đang tải
          if (entry.isIntersecting && !loading && pagination.page <= pagination.totalPages) {
            console.log('Load more element is visible, triggering load more...');
            onLoadMore();
          }
        },
        {
          // Trigger khi phần tử hiển thị ít nhất 10% trong viewport
          threshold: 0.1,
          // Mở rộng vùng phát hiện 200px dưới viewport
          rootMargin: '0px 0px 200px 0px'
        }
      );

      // Bắt đầu quan sát phần tử
      observerRef.current.observe(loadMoreRef.current);
    }

    // Cleanup khi component unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, pagination, onLoadMore]);

  if (!books || books.length === 0) {
    return (
      <div className="py-20">
        <Empty description="Không tìm thấy sách nào" />
      </div>
    );
  }

  // Xác định nếu còn dữ liệu để tải
  const hasMoreData = pagination && pagination.page <= pagination.totalPages;

  return (
    <div>
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={16} xl={14}>
          {books.map((book, index) => (
            <BookCard key={`${book.bookId}-${index}`} book={book} />
          ))}

          {/* Load more trigger element */}
          <div 
            ref={loadMoreRef}
            className="w-full flex justify-center py-6 mt-4"
            style={{ minHeight: '100px' }}
          >
            {loading ? (
              <Spin size="large" tip="Đang tải sách..." />
            ) : hasMoreData ? (
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  onLoadMore();
                }}
                type="primary" 
                ghost 
                size="large"
                className="load-more-button"
              >
                Tải thêm ({pagination.page}/{pagination.totalPages})
              </Button>
            ) : books.length > 0 ? (
              <div className="text-gray-500 text-center">
                Bạn đã xem hết tất cả sách
              </div>
            ) : null}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default BookList; 
import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, MailOutlined } from '@ant-design/icons';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 w-full">
        {/* Main Content */}
        <div className="min-h-screen flex flex-col items-center justify-center text-center text-white py-20">
          {/* Hero Content */}
          <h1 className="text-5xl font-bold mb-6">
            Khám Phá Thế Giới Sách Vô Tận
          </h1>
          
          <p className="text-xl mb-8 max-w-2xl">
            Tham gia cộng đồng đọc sách lớn nhất Việt Nam. 
            Chia sẻ đánh giá, tìm kiếm sách mới và kết nối với những người yêu sách.
          </p>

          {/* CTA Buttons */}
          <div className="space-x-4">
            <Button 
              size="large"
              type="primary"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => navigate('/login')}
            >
              Đăng Nhập
            </Button>
            
            <Button 
              size="large"
              type="primary"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => navigate('/register')}
            >
              Đăng Ký
            </Button>
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-4xl font-bold">10K+</h3>
              <p className="text-lg">Sách</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold">5K+</h3>
              <p className="text-lg">Người Dùng</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold">50K+</h3>
              <p className="text-lg">Đánh Giá</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
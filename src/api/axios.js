import axios from 'axios';
import { Mutex } from 'async-mutex';
import { notification } from 'antd';

// Kiểm tra nếu đang sử dụng Vite
const baseURL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL 
  ? import.meta.env.VITE_BACKEND_URL 
  : 'http://localhost:8080';

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const mutex = new Mutex();
const NO_RETRY_HEADER = 'x-no-retry';

// Danh sách các API không yêu cầu xác thực
const PUBLIC_APIS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh'
];

// Kiểm tra xem API có phải là public không
const isPublicAPI = (url) => {
  if (!url) return false;
  return PUBLIC_APIS.some(api => url.includes(api));
};

// Thêm biến để kiểm soát việc refresh token đang diễn ra
let isRefreshing = false;
let refreshSubscribers = [];

// Thêm hàm để thêm callback vào hàng đợi
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Thêm hàm để thực thi tất cả callback khi có token mới
const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Kiểm tra token có tồn tại trong localStorage khi khởi tạo
if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem('access_token')) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${window.localStorage.getItem('access_token')}`;
}

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(function (config) {
  // Không thêm token cho public APIs
  if (isPublicAPI(config.url)) {
    delete config.headers.Authorization;
    return config;
  }

  // Kiểm tra và thêm token từ localStorage nếu chưa có trong header
  if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem('access_token')) {
    config.headers.Authorization = `Bearer ${window.localStorage.getItem('access_token')}`;
  }
  
  if (!config.headers.Accept && config.headers["Content-Type"]) {
    config.headers.Accept = "application/json";
    config.headers["Content-Type"] = "application/json; charset=utf-8";
  }
  
  return config;
});

const handleRefreshToken = async () => {
  return await mutex.runExclusive(async () => {
    try {
      // Nếu đang refresh token, không thực hiện lại
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            resolve(token);
          });
        });
      }
      
      isRefreshing = true;
      
      // Tạo instance tạm thời không có authorization header
      const tempAxios = axios.create({
        baseURL: baseURL,
        withCredentials: true, // Quan trọng để gửi cookie
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const res = await tempAxios.get('/auth/refresh');
      
      // Lấy access_token từ cấu trúc trả về
      const access_token = res?.data?.data?.access_token;
      
      if (access_token) {
        // Lưu token mới ngay lập tức
        localStorage.setItem('access_token', access_token);
        
        // Cập nhật token cho tất cả các request sau này
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        
        // Thông báo cho tất cả các request đang chờ
        onRefreshed(access_token);
        
        isRefreshing = false;
        return access_token;
      }
      
      isRefreshing = false;
      onRefreshed(null);
      return null;
    } catch (error) {
      isRefreshing = false;
      onRefreshed(null);
      return null;
    }
  });
};

// Thêm interceptor để xử lý lỗi
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    // Xử lý refresh token khi 401
    if (
      error.config && 
      error.response &&
      +error.response.status === 401 &&
      !isPublicAPI(error.config.url) &&
      !error.config.headers[NO_RETRY_HEADER]
    ) {
      // Nếu đang refresh token, thêm request này vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              const newConfig = { ...error.config };
              newConfig.headers = { ...newConfig.headers };
              newConfig.headers['Authorization'] = `Bearer ${token}`;
              newConfig.headers[NO_RETRY_HEADER] = 'true';
              
              // Thử lại request với token mới
              axios(newConfig).then(
                (response) => {
                  resolve(response.data);
                },
                (err) => {
                  reject(err);
                }
              );
            } else {
              // Refresh token thất bại
              reject(error);
            }
          });
        });
      }
      
      try {
        const access_token = await handleRefreshToken();
        
        if (access_token) {
          // Tạo config mới thay vì sửa config cũ
          const newConfig = { ...error.config };
          newConfig.headers = { ...newConfig.headers };
          newConfig.headers['Authorization'] = `Bearer ${access_token}`;
          newConfig.headers[NO_RETRY_HEADER] = 'true';
          
          // Thử lại request với config mới
          try {
            const retryResponse = await axios(newConfig);
            return retryResponse.data;
          } catch (retryError) {
            throw retryError;
          }
        } else {
          // Không thể refresh token, đăng xuất người dùng
          localStorage.removeItem('access_token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    // Xử lý lỗi 403 (Forbidden)
    if (error.response && +error.response.status === 403) {
      notification.error({
        message: 'Không có quyền truy cập',
        description: error?.response?.data?.error || 'Bạn không có quyền thực hiện hành động này'
      });
    }
    
    // Xử lý các lỗi khác
    if (error.response && error.response.data) {
      const message = error.response.data.message || 'Đã xảy ra lỗi';
      if (+error.response.status !== 401 && +error.response.status !== 403) {
        notification.error({
          message: 'Lỗi',
          description: message
        });
      }
    }
    
    return error?.response?.data ?? Promise.reject(error);
  }
);

export default axiosInstance;
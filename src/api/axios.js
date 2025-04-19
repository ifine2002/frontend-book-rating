import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(function (config) {
  if (typeof window !== "undefined" && window && window.localStorage && window.localStorage.getItem('access_token')) {
      config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
  }
  if (!config.headers.Accept && config.headers["Content-Type"]) {
      config.headers.Accept = "application/json";
      config.headers["Content-Type"] = "application/json; charset=utf-8";
  }
  return config;
});

// Thêm interceptor để xử lý lỗi
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Xử lý khi token hết hạn
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    
    return error?.response?.data ?? Promise.reject(error);
  }
);

export default axiosInstance;
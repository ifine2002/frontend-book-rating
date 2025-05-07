import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.account.isAuthenticated);
  const isLoading = useAppSelector((state) => state.account.isLoading);
  const token = localStorage.getItem('access_token');

  // Nếu đang loading, không chuyển hướng
  if (isLoading) {
    return null;
  }

  // Nếu không có token hoặc chưa xác thực, chuyển hướng đến welcome
  if (!token || !isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

export default ProtectedRoute;
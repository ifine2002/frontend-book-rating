import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.account.isAuthenticated);
  const isLoading = useAppSelector((state) => state.account.isLoading);
  const token = localStorage.getItem('access_token');

  console.log('ProtectedRoute:',  isLoading, isAuthenticated, token );

  // Nếu đang loading, không chuyển hướng
  if (isLoading) {
    return null;
  }

  // Nếu không có token, chuyển hướng đến welcome
  if (!token) {
    return <Navigate to="/welcome" replace />;
  }

  // Nếu có token nhưng chưa xác thực, chuyển hướng đến welcome
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

export default ProtectedRoute;
import React, { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import DashboardPage from './pages/admin/dashboard';
import NotFound from './components/share/notfound';
import LayoutAdmin from './components/admin/AdminLayout';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccount } from './redux/slice/accountSlice';
import { store } from './redux/store';

const LayoutClient = () => {

  return (
    <div>
      Hello everyone
    </div>
  )
}

export default function App() {
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.account.isLoading);
  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
    )
      return;
    
    console.log("App mounted, checking token...");
    const token = localStorage.getItem('access_token');
    console.log("Token exists:", !!token);
    
    dispatch(fetchAccount())
        
  }, [])


  const router = createBrowserRouter([
    {
      path: "/",
      element: (<LayoutClient />),
      errorElement: <NotFound />,
      children: [
      ],
    },

    {
      path: "/admin",
      element: <LayoutAdmin />,
      errorElement: <NotFound />,
      children: [
        {
          index: true,
          element:
            <DashboardPage />
        }
      ],
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

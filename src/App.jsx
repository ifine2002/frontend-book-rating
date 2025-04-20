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
import { fetchAccount } from './redux/slice/accountSlice';
import UserPage from './pages/admin/user';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import PermissionPage from './pages/admin/permission';
import RolePage from './pages/admin/role';
import styles from './styles/app.module.scss';
import CategoryPage from './pages/admin/category';

const LayoutClient = () => {

  return (
    <div>
      Hello everyone
    </div>
  )
}

export default function App() {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.account.isLoading);

  useEffect(() => {
    if (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
    )
      return;
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
        },
        {
          path: "user",
          element:
            <UserPage />
        },
        {
          path: "permission",
          element:
            <PermissionPage />
        },
        {
          path: "role",
          element:
            <RolePage />
        },
        {
          path: "category",
          element:
            <CategoryPage />
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

import React, { useEffect, useRef, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider
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
import BookPage from './pages/admin/book';
import ApprovalBooksPage from './pages/admin/approval-books';
import FollowPage from './pages/admin/follow';
import RatingPage from './pages/admin/rating';
import CommentPage from './pages/admin/comment';
import LayoutClient from './components/client/ClientLayout';
import BookDetailPage from './pages/client/BookDetailPage';
import HomePage from './pages/client/HomePage';
import UploadBookPage from './pages/client/UploadBook';
// import './styles/global.css'
import SearchPage from './pages/client/SearchPage';
import ProfilePage from './pages/client/ProfilePage';
import MyProfile from './pages/client/MyProfile';

export default function App() {
  const dispatch = useAppDispatch();

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
        {
          index: true,
          element: <HomePage />
        },
        {
          path: "book/:id",
          element: <BookDetailPage />
        },
        {
          path: "/search",
          element: <SearchPage />
        },
        {
          path: "/create",
          element: <UploadBookPage />
        },
        {
          path: "/profile/:id",
          element: <ProfilePage />
        },
        {
          path: "/my-profile",
          element: <MyProfile/>
        }
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
          path: "book",
          element:
            <BookPage />
        },
        {
          path: "approval-books",
          element:
            <ApprovalBooksPage />
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
        },
        {
          path: "follow",
          element:
            <FollowPage />
        },
        {
          path: "rating",
          element:
            <RatingPage />
        },
        {
          path: "comment",
          element:
            <CommentPage />
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

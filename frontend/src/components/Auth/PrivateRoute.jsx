import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

/**
 * 認証済みユーザーのみアクセスできるルートを提供するコンポーネント
 * 未認証の場合はログインページにリダイレクト
 */
const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();

  // 認証状態に基づいてリダイレクトまたは子ルートをレンダリング
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
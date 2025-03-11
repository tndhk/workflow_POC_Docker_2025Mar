import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { isAuthenticated, getUser } from '../utils/authUtils';
import { authService } from '../api/services';

// 認証コンテキストを作成
const AuthContext = createContext(null);

/**
 * 認証プロバイダーコンポーネント
 * アプリケーション全体で認証状態を管理する
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated: authState, setUser, setAuth, logout } = useAuthStore();

  // アプリ起動時に認証情報を復元
  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated() && !authState) {
        try {
          // トークンが有効か確認するためにユーザー情報を取得
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setAuth(true);
        } catch (error) {
          // トークンが無効な場合はログアウト
          console.error('認証エラー:', error);
          logout();
          navigate('/login');
        }
      } else if (!isAuthenticated() && authState) {
        // ローカルストレージにトークンがないのにストアに認証情報がある場合は同期
        logout();
      }
    };

    initAuth();
  }, [authState, setUser, setAuth, logout, navigate]);

  // 認証状態とコンテキスト値
  const contextValue = {
    user,
    isAuthenticated: authState,
    logout: () => {
      logout();
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 認証コンテキストを使用するカスタムフック
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
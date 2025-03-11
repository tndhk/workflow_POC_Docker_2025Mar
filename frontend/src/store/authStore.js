import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../api/services';
import { saveToken, removeToken } from '../utils/authUtils';

// 認証情報を管理するZustandストア
const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状態
      user: null,
      isAuthenticated: false,
      token: null,
      loading: false,
      error: null,
      
      // アクション
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setUser: (user) => set({ user }),
      setAuth: (isAuthenticated) => set({ isAuthenticated }),
      
      // ログイン処理
      login: async (username, password) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.login(username, password);
          const { token, user } = response;
          
          // トークンとユーザー情報を保存
          saveToken(token, user);
          
          set({
            user,
            isAuthenticated: true,
            token,
            loading: false,
            error: null
          });
          
          return user;
        } catch (error) {
          const errorMessage = error.error || 'ログインに失敗しました';
          set({ loading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      
      // ユーザー登録処理
      register: async (username, email, password) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authService.register(username, email, password);
          const { token, user } = response;
          
          // トークンとユーザー情報を保存
          saveToken(token, user);
          
          set({
            user,
            isAuthenticated: true,
            token,
            loading: false,
            error: null
          });
          
          return user;
        } catch (error) {
          const errorMessage = error.error || 'ユーザー登録に失敗しました';
          set({ loading: false, error: errorMessage });
          throw new Error(errorMessage);
        }
      },
      
      // ログアウト処理
      logout: () => {
        // トークンを削除
        removeToken();
        
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          error: null
        });
      },
      
      // プロフィール更新
      updateProfile: async (userData) => {
        // 通常はAPI呼び出しが必要だが、現バックエンドには実装がないためモック
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      }
    }),
    {
      name: 'auth-storage', // ローカルストレージのキー
      // 永続化する状態の一部を指定
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token
      })
    }
  )
);

export default useAuthStore;
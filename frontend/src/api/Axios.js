import axios from 'axios';

// バックエンドAPIのベースURL
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axiosインスタンスの作成
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒でタイムアウト
});

// リクエストインターセプター - 認証トークンの追加
apiClient.interceptors.request.use(
  (config) => {
    // ローカルストレージからトークンを取得
    const token = localStorage.getItem('auth-storage')
      ? JSON.parse(localStorage.getItem('auth-storage')).state.token
      : null;

    // トークンがあればヘッダーに追加
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター - エラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 認証エラー (401) の場合
    if (error.response && error.response.status === 401) {
      // ログアウト処理をここに実装（後で追加）
      // authStore.getState().logout();
      console.error('認証エラー: セッションが切れたか、無効なトークンです');
    }
    
    // 他のエラーハンドリング
    return Promise.reject(error);
  }
);

export default apiClient;
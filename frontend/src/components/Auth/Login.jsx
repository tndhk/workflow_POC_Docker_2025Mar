import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

/**
 * ログイン・登録画面コンポーネント
 */
const Login = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const navigate = useNavigate();
  
  // 認証ストアから必要な状態と関数を取得
  const { 
    login, 
    register, 
    isAuthenticated, 
    loading, 
    error, 
    setError 
  } = useAuthStore();
  
  // 認証済みの場合はダッシュボードへリダイレクト
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects');
    }
  }, [isAuthenticated, navigate]);
  
  // フォーム送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isRegistering) {
        // 入力検証
        if (!username || !email || !password) {
          setError('すべての項目を入力してください');
          return;
        }
        
        if (password.length < 6) {
          setError('パスワードは6文字以上で入力してください');
          return;
        }
        
        // 登録処理
        await register(username, email, password);
      } else {
        // 入力検証
        if (!username || !password) {
          setError('ユーザー名とパスワードを入力してください');
          return;
        }
        
        // ログイン処理
        await login(username, password);
      }
      
      // 成功したらダッシュボードへ
      navigate('/projects');
    } catch (err) {
      console.error('認証エラー:', err);
      // エラーは認証ストア内で処理される
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegistering ? 'アカウント作成' : 'ログイン'}
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">ユーザー名</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="ユーザー名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            
            {/* 登録時のみメールアドレス入力を表示 */}
            {isRegistering && (
              <div>
                <label htmlFor="email" className="sr-only">メールアドレス</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="sr-only">パスワード</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isRegistering ? '' : 'rounded-b-md'} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  処理中...
                </span>
              ) : (
                isRegistering ? '登録' : 'ログイン'
              )}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 text-sm"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
            >
              {isRegistering 
                ? 'すでにアカウントをお持ちの方はこちら' 
                : 'アカウントをお持ちでない方はこちら'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
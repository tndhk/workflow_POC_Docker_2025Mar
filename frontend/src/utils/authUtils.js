/**
 * 認証関連のユーティリティ関数
 */

// ローカルストレージのキー
const TOKEN_KEY = 'auth-storage';

/**
 * トークンをローカルストレージに保存
 * @param {string} token JWT認証トークン
 * @param {Object} user ユーザー情報
 */
export const saveToken = (token, user) => {
  try {
    const authData = {
      state: {
        token,
        user,
        isAuthenticated: true
      }
    };
    localStorage.setItem(TOKEN_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error('トークン保存エラー:', error);
  }
};

/**
 * トークンをローカルストレージから取得
 * @returns {string|null} 保存されたトークン
 */
export const getToken = () => {
  try {
    const authData = localStorage.getItem(TOKEN_KEY);
    if (!authData) return null;
    
    const parsedData = JSON.parse(authData);
    return parsedData.state.token;
  } catch (error) {
    console.error('トークン取得エラー:', error);
    return null;
  }
};

/**
 * ユーザー情報をローカルストレージから取得
 * @returns {Object|null} 保存されたユーザー情報
 */
export const getUser = () => {
  try {
    const authData = localStorage.getItem(TOKEN_KEY);
    if (!authData) return null;
    
    const parsedData = JSON.parse(authData);
    return parsedData.state.user;
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    return null;
  }
};

/**
 * 認証情報をローカルストレージから削除（ログアウト）
 */
export const removeToken = () => {
  try {
    // Zustandの永続化データを削除せず、認証情報だけリセット
    const authData = localStorage.getItem(TOKEN_KEY);
    if (!authData) return;
    
    const parsedData = JSON.parse(authData);
    parsedData.state.token = null;
    parsedData.state.user = null;
    parsedData.state.isAuthenticated = false;
    
    localStorage.setItem(TOKEN_KEY, JSON.stringify(parsedData));
  } catch (error) {
    console.error('トークン削除エラー:', error);
  }
};

/**
 * ユーザーが認証されているかチェック
 * @returns {boolean} 認証状態
 */
export const isAuthenticated = () => {
  return !!getToken();
};
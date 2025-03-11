import apiClient from '../axios';

/**
 * 認証関連のAPIサービス
 */
const authService = {
  /**
   * ユーザー登録
   * @param {string} username ユーザー名
   * @param {string} email メールアドレス
   * @param {string} password パスワード
   * @returns {Promise} 登録結果とトークン
   */
  register: async (username, email, password) => {
    try {
      const response = await apiClient.post('/auth/register', {
        username,
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * ログイン
   * @param {string} username ユーザー名
   * @param {string} password パスワード
   * @returns {Promise} ログイン結果とトークン
   */
  login: async (username, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * 現在のユーザー情報を取得
   * @returns {Promise} ユーザー情報
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  }
};

export default authService;
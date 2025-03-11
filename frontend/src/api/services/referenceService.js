import apiClient from '../axios';

/**
 * リファレンスデータ関連のAPIサービス
 */
const referenceService = {
  /**
   * すべてのワークフロープリセットを取得
   * @returns {Promise} プリセット一覧
   */
  getPresets: async () => {
    try {
      const response = await apiClient.get('/presets');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * 特定のプリセットを取得
   * @param {string} presetId プリセットID
   * @returns {Promise} プリセット詳細
   */
  getPreset: async (presetId) => {
    try {
      const response = await apiClient.get(`/presets/${presetId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * すべての国の休日データを取得
   * @returns {Promise} 国別休日データ
   */
  getAllHolidays: async () => {
    try {
      const response = await apiClient.get('/holidays');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * 特定の国の休日データを取得
   * @param {string} country 国コード
   * @returns {Promise} 指定国の休日データ
   */
  getCountryHolidays: async (country) => {
    try {
      const response = await apiClient.get(`/holidays/${country}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  }
};

export default referenceService;
import apiClient from '../axios';

/**
 * プロジェクト関連のAPIサービス
 */
const projectService = {
  /**
   * すべてのプロジェクトを取得
   * @returns {Promise} プロジェクト一覧
   */
  getProjects: async () => {
    try {
      const response = await apiClient.get('/projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * 特定のプロジェクトを取得
   * @param {string} projectId プロジェクトID
   * @returns {Promise} プロジェクト詳細
   */
  getProject: async (projectId) => {
    try {
      const response = await apiClient.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * 新規プロジェクトを作成
   * @param {Object} projectData プロジェクトデータ
   * @returns {Promise} 作成されたプロジェクト
   */
  createProject: async (projectData) => {
    try {
      const response = await apiClient.post('/projects', projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * プロジェクトを更新
   * @param {string} projectId プロジェクトID
   * @param {Object} projectData 更新データ
   * @returns {Promise} 更新されたプロジェクト
   */
  updateProject: async (projectId, projectData) => {
    try {
      const response = await apiClient.put(`/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * プロジェクトを削除
   * @param {string} projectId プロジェクトID
   * @returns {Promise} 削除結果
   */
  deleteProject: async (projectId) => {
    try {
      const response = await apiClient.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  }
};

export default projectService;
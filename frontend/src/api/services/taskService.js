import apiClient from '../axios';

/**
 * タスク関連のAPIサービス
 */
const taskService = {
  /**
   * プロジェクトのすべてのタスクを取得
   * @param {string} projectId プロジェクトID
   * @returns {Promise} タスク一覧
   */
  getTasks: async (projectId) => {
    try {
      const response = await apiClient.get(`/tasks/project/${projectId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * 特定のタスクを取得
   * @param {string} projectId プロジェクトID
   * @param {number} taskId タスクID
   * @returns {Promise} タスク詳細
   */
  getTask: async (projectId, taskId) => {
    try {
      const response = await apiClient.get(`/tasks/project/${projectId}/task/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * 新規タスクを作成
   * @param {string} projectId プロジェクトID
   * @param {Object} taskData タスクデータ
   * @returns {Promise} 作成されたタスク
   */
  createTask: async (projectId, taskData) => {
    try {
      const response = await apiClient.post(`/tasks/project/${projectId}`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * タスクを更新
   * @param {string} projectId プロジェクトID
   * @param {number} taskId タスクID
   * @param {Object} taskData 更新データ
   * @returns {Promise} 更新されたタスク
   */
  updateTask: async (projectId, taskId, taskData) => {
    try {
      const response = await apiClient.put(`/tasks/project/${projectId}/task/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  },

  /**
   * タスクを削除
   * @param {string} projectId プロジェクトID
   * @param {number} taskId タスクID
   * @returns {Promise} 削除結果
   */
  deleteTask: async (projectId, taskId) => {
    try {
      const response = await apiClient.delete(`/tasks/project/${projectId}/task/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'サーバーエラーが発生しました' };
    }
  }
};

export default taskService;
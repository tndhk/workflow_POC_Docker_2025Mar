import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectService } from '../api/services';
import useWorkflowStore from '../store/workflowStore';
import Notification from '../components/UI/Notification';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuth } from '../context/AuthProvider';

/**
 * プロジェクト一覧ページ
 * ユーザーの全プロジェクトを表示し、新規作成・編集・削除機能を提供
 */
const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // WorkflowStoreから必要な関数を取得
  const { deleteProject } = useWorkflowStore();
  
  // プロジェクト一覧を取得
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const data = await projectService.getProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error('プロジェクト取得エラー:', err);
        setError('プロジェクトの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // プロジェクト削除処理
  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`プロジェクト「${projectName}」を削除してもよろしいですか？`)) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteProject(projectId);
      
      // 成功メッセージを表示してリストから削除
      setSuccess(`プロジェクト「${projectName}」を削除しました`);
      setProjects(projects.filter(p => p._id !== projectId));
    } catch (err) {
      console.error('プロジェクト削除エラー:', err);
      setError('プロジェクトの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  // 新規プロジェクト作成
  const handleCreateNewProject = () => {
    navigate('/dashboard');
  };
  
  // 通知メッセージをクリア
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* ローディングインジケータ */}
      {loading && <LoadingSpinner />}
      
      {/* エラー・成功通知 */}
      {error && (
        <Notification 
          type="error" 
          message={error} 
          onClose={clearMessages} 
        />
      )}
      
      {success && (
        <Notification 
          type="success" 
          message={success} 
          onClose={clearMessages} 
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">マイプロジェクト</h1>
        
        {/* ユーザー情報とログアウト */}
        <div className="flex items-center">
          {user && (
            <span className="text-sm text-gray-600 mr-4">
              {user.username} としてログイン中
            </span>
          )}
          <button 
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-800"
          >
            ログアウト
          </button>
        </div>
      </div>
      
      {/* 新規プロジェクト作成ボタン */}
      <button
        onClick={handleCreateNewProject}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mb-6"
      >
        新規プロジェクト作成
      </button>
      
      {/* プロジェクト一覧 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            プロジェクトがありません。「新規プロジェクト作成」ボタンをクリックして作成してください。
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  プロジェクト名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  開始日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  期限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終更新
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {project.name}
                    </div>
                    {project.description && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {project.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.deadlineDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' : 
                        project.status === 'inProgress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {project.status === 'planning' ? '計画中' : 
                        project.status === 'inProgress' ? '進行中' : '完了'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/dashboard/${project._id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project._id, project.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProjectListPage;
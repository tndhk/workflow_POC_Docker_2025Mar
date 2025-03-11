import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useWorkflowStore from '../store/workflowStore';
import ControlPanel from './ControlPanel/controlPanel';
import GanttChart from './GanttChart/GanttChart';
import TaskList from './TaskList/TaskList';
import TaskModal from './TaskModal/TaskModal';
import Notification from './UI/Notification';
import LoadingSpinner from './UI/LoadingSpinner';
import { useAuth } from '../context/AuthProvider';

/**
 * ワークフロー計画ツールのメインコンポーネント (Zustandを使用)
 */
const WorkflowPlanner = () => {
  const { projectId } = useParams(); // URLからプロジェクトIDを取得
  const { user } = useAuth();
  
  // Zustandストアから状態を取得
  const { 
    showTaskModal, 
    currentProject, 
    loading, 
    error, 
    success, 
    clearMessages,
    initProject
  } = useWorkflowStore();

  // 初期化（プロジェクトのロードまたは新規作成）
  useEffect(() => {
    const loadProject = async () => {
      try {
        await initProject(projectId);
      } catch (err) {
        console.error('プロジェクト初期化エラー:', err);
      }
    };

    loadProject();
  }, [projectId, initProject]);

  // チャートの色設定
  const colors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

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
      
      <h1 className="text-2xl font-bold mb-6 text-center">
        {currentProject.name || 'Workflow Planning Tool'}
      </h1>
      
      {/* ユーザー情報表示 */}
      {user && (
        <div className="text-right text-sm text-gray-500 mb-2">
          ログインユーザー: {user.username}
        </div>
      )}
      
      {/* コントロールパネル */}
      <ControlPanel />
      
      {/* 結果表示エリア */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Schedule Results</h2>
        
        {/* ガントチャート */}
        <GanttChart colors={colors} />
      </div>
      
      {/* タスク一覧テーブル */}
      <TaskList />
      
      {/* タスク追加/編集モーダル */}
      {showTaskModal && <TaskModal />}
    </div>
  );
};

export default WorkflowPlanner;
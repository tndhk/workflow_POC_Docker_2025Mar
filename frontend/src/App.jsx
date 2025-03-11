import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import WorkflowPlanner from './components/WorkflowPlanner';
import ProjectListPage from './pages/ProjectListPage';

/**
 * メインアプリケーションコンポーネント
 * ルーティングと認証状態の管理を行う
 */
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 公開ルート */}
          <Route path="/login" element={<Login />} />
          
          {/* 認証が必要なルート */}
          <Route element={<PrivateRoute />}>
            {/* プロジェクト一覧 */}
            <Route path="/projects" element={<ProjectListPage />} />
            
            {/* 新規プロジェクト作成 */}
            <Route path="/dashboard" element={<WorkflowPlanner />} />
            
            {/* 既存プロジェクト編集 */}
            <Route path="/dashboard/:projectId" element={<WorkflowPlanner />} />
          </Route>
          
          {/* デフォルトリダイレクト */}
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
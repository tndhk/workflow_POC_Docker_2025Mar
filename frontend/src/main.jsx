import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // 新しく作成したAppコンポーネントを使用
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
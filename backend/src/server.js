const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');


// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// データベース接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workflow-planner', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 基本ルート（テスト用）
app.get('/', (req, res) => {
  res.json({ message: 'Workflow Planner API' });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// 注：authMiddlewareをインポートする必要があります
const { authMiddleware } = require('./middleware/authMiddleware');

const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', authMiddleware, projectRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

const presetRoutes = require('./routes/presetRoutes');
const holidayRoutes = require('./routes/holidayRoutes');

// 認証不要のリファレンスデータAPI
app.use('/api/presets', presetRoutes);
app.use('/api/holidays', holidayRoutes);

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

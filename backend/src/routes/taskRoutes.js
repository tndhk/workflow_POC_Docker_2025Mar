const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const taskController = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');

// すべてのタスクを取得
router.get('/project/:projectId', authMiddleware, taskController.getTasks);

// タスク詳細を取得
router.get('/project/:projectId/task/:taskId', authMiddleware, taskController.getTask);

// 新規タスク作成
router.post(
  '/project/:projectId',
  [
    authMiddleware,
    check('name', 'Task name is required').not().isEmpty(),
    check('duration', 'Duration must be a positive number').isInt({ min: 1 })
  ],
  taskController.createTask
);

// タスク更新
router.put(
  '/project/:projectId/task/:taskId',
  [
    authMiddleware,
    check('name', 'Task name is required').not().isEmpty()
  ],
  taskController.updateTask
);

// タスク削除
router.delete('/project/:projectId/task/:taskId', authMiddleware, taskController.deleteTask);

module.exports = router;
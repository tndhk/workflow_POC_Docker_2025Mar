const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const projectController = require('../controllers/projectController');

// すべてのプロジェクトを取得
router.get('/', projectController.getProjects);

// プロジェクト詳細を取得
router.get('/:id', projectController.getProject);

// 新規プロジェクト作成
router.post(
  '/',
  [
    check('name', 'Project name is required').not().isEmpty(),
    check('deadlineDate', 'Deadline date is required').not().isEmpty()
  ],
  projectController.createProject
);

// プロジェクト更新
router.put(
  '/:id',
  [
    check('name', 'Project name is required').not().isEmpty()
  ],
  projectController.updateProject
);

// プロジェクト削除
router.delete('/:id', projectController.deleteProject);

module.exports = router;
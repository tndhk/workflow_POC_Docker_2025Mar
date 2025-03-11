const express = require('express');
const router = express.Router();
const presetController = require('../controllers/presetController');

// すべてのプリセットを取得
router.get('/', presetController.getPresets);

// 特定のプリセットを取得
router.get('/:id', presetController.getPreset);

module.exports = router;
const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');

// すべての国の休日データを取得
router.get('/', holidayController.getAllHolidays);

// 特定の国の休日データを取得
router.get('/:country', holidayController.getCountryHolidays);

module.exports = router;
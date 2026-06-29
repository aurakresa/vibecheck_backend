const express = require('express');
const router = express.Router();
const { runDataPipeline, getMarketData } = require('../controllers/cronController');

// URL buat robot Vercel (Cron)
router.get('/pipeline', runDataPipeline);

// URL buat diakses HP Android
router.get('/market-data', getMarketData);

module.exports = router;
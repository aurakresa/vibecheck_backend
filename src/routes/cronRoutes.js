const express = require('express');
const router = express.Router();
const { updateGlobalTrends, getGlobalTrends, runDataPipeline } = require('../controllers/cronController');

// Route lama lu (Google Trends)
router.get('/scrape', updateGlobalTrends);
router.get('/trends', getGlobalTrends);

// 🔴 Route BARU buat Pipeline Wiki & YouTube
router.get('/pipeline', runDataPipeline);

module.exports = router;
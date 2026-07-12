const express = require('express');
const router = express.Router();
const { runDataPipeline, getMarketData } = require('../controllers/cronController');

router.get('/pipeline', runDataPipeline);

router.get('/market-data', getMarketData);

module.exports = router;
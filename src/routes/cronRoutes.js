const express = require('express');
const router = express.Router();
const { updateGlobalTrends, getGlobalTrends } = require('../controllers/cronController');

router.get('/scrape', updateGlobalTrends);
router.get('/trends', getGlobalTrends);

module.exports = router;
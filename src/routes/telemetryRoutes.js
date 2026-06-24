const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/auth');
const { trackActivity, getTelemetryData } = require('../controllers/telemetryController');

// URL buat nambah angka (Dipanggil diem-diem di background Android)
router.post('/track', verifyFirebaseToken, trackActivity);

// URL buat narik data chart (Dipanggil pas buka menu SYS_TELEMETRY)
router.get('/stats', verifyFirebaseToken, getTelemetryData);

module.exports = router;
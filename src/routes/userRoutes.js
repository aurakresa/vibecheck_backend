const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/auth');

// Import semua fungsi dari controller
const { updateUsername, updateProfilePicture, getUserLogs } = require('../controllers/userController');

// Daftar rute API lu
router.put('/username', verifyFirebaseToken, updateUsername);
router.put('/profile-picture', verifyFirebaseToken, updateProfilePicture);
router.get('/logs', verifyFirebaseToken, getUserLogs);

// 🔴 INI BIANG KEROKNYA KALAU SAMPAI HILANG ATAU KEPOTONG
module.exports = router;
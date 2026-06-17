const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/auth');

// Import semua fungsi dari controller, termasuk getUserLogs
const { updateUsername, updateProfilePicture, getUserLogs } = require('../controllers/userController');

// Daftar rute
router.put('/username', verifyFirebaseToken, updateUsername);
router.put('/profile-picture', verifyFirebaseToken, updateProfilePicture);
router.get('/logs', verifyFirebaseToken, getUserLogs);

module.exports = router;
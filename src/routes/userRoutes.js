const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/auth');

// 🔴 Pastiin addClientLog ikut di-import
const { updateUsername, updateProfilePicture, getUserLogs, addClientLog } = require('../controllers/userController');

// Daftar rute
router.put('/username', verifyFirebaseToken, updateUsername);
router.put('/profile-picture', verifyFirebaseToken, updateProfilePicture);
router.get('/logs', verifyFirebaseToken, getUserLogs);

// 🔴 TAMBAHIN RUTE POST INI
router.post('/logs', verifyFirebaseToken, addClientLog);

module.exports = router;
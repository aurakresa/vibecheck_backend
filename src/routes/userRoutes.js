const express = require('express');
const router = express.Router();
const verifyFirebaseToken = require('../middlewares/auth');
const { updateUsername, updateProfilePicture } = require('../controllers/userController');

// Terapkan middleware satpam ke endpoint ini
router.put('/username', verifyFirebaseToken, updateUsername);
router.put('/profile-picture', verifyFirebaseToken, updateProfilePicture);

module.exports = router;
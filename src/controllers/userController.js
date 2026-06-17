const { db } = require('../config/firebase');

exports.updateUsername = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    // Update data di Firestore
    const userRef = db.collection('users').doc(uid);
    await userRef.set({ username, updatedAt: new Date() }, { merge: true });

    res.status(200).json({ success: true, message: 'Username updated successfully', data: { username } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { photoUrl } = req.body; // URL didapat dari frontend setelah upload ke Firebase Storage

    if (!photoUrl) {
      return res.status(400).json({ success: false, message: 'Photo URL is required' });
    }

    const userRef = db.collection('users').doc(uid);
    await userRef.set({ photoUrl, updatedAt: new Date() }, { merge: true });

    res.status(200).json({ success: true, message: 'Profile picture updated successfully', data: { photoUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
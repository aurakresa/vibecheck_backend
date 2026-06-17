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

exports.getUserLogs = async (req, res) => {
  try {
    const uid = req.user.uid;

    // Narik 20 log terakhir punya user ini dari Firestore
    const logsSnapshot = await db.collection('user_logs')
      .where('uid', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const logs = [];
    logsSnapshot.forEach(doc => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        action: data.action,
        details: data.details,
        // Convert timestamp ke ISO string biar gampang dibaca di Android
        timestamp: data.timestamp.toDate().toISOString() 
      });
    });

    res.status(200).json({ success: true, message: 'Logs retrieved', data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.addClientLog = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { action, details } = req.body;
    
    // Panggil helper logUserActivity yang udah kita bikin sebelumnya
    await db.collection('user_logs').add({ 
        uid: uid, 
        action: action, 
        details: details, 
        timestamp: new Date() 
    });
    
    res.status(200).json({ success: true, message: 'Client log saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};
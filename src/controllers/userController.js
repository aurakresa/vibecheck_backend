const { db } = require('../config/firebase');

// 🔴 HELPER CCTV DIKEMBALIKAN
const logUserActivity = async (uid, action, details = "") => {
  try {
    await db.collection('user_logs').add({ uid, action, details, timestamp: new Date() });
  } catch (error) { console.error("Log error:", error); }
};

exports.updateUsername = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

    await db.collection('users').doc(uid).set({ username, updatedAt: new Date() }, { merge: true });

    // 🔴 REKAM JEJAK GANTI USERNAME
    await logUserActivity(uid, "UPDATE_PROFILE", `Update: Profil Node diubah menjadi '${username}'`);

    res.status(200).json({ success: true, message: 'Username updated successfully', data: { username } });
  } catch (error) { res.status(500).json({ success: false, message: 'Error', error: error.message }); }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { photoUrl } = req.body;
    if (!photoUrl) return res.status(400).json({ success: false, message: 'Photo URL is required' });

    await db.collection('users').doc(uid).set({ photoUrl, updatedAt: new Date() }, { merge: true });

    // 🔴 REKAM JEJAK GANTI FOTO
    await logUserActivity(uid, "SYNC_CLOUD", `Update: Foto profil disinkronisasi ke Cloud`);

    res.status(200).json({ success: true, message: 'Profile picture updated successfully', data: { photoUrl } });
  } catch (error) { res.status(500).json({ success: false, message: 'Error', error: error.message }); }
};

exports.getUserLogs = async (req, res) => {
  try {
    const uid = req.user.uid;
    const logsSnapshot = await db.collection('user_logs').where('uid', '==', uid).orderBy('timestamp', 'desc').limit(20).get();
    const logs = [];
    logsSnapshot.forEach(doc => {
      const data = doc.data();
      logs.push({ id: doc.id, action: data.action, details: data.details, timestamp: data.timestamp.toDate().toISOString() });
    });
    res.status(200).json({ success: true, message: 'Logs retrieved', data: logs });
  } catch (error) { res.status(500).json({ success: false, message: 'Error', error: error.message }); }
};

exports.addClientLog = async (req, res) => {
  try {
    const uid = req.user.uid;
    // 🔴 TERIMA NAMA HP DARI ANDROID (deviceName)
    const { action, details, deviceName } = req.body;
    
    // LOGIKA INTERAKTIF (GAYA INSTAGRAM)
    if ((action === "SEC_LOGIN" || action === "SEC_LOGOUT") && deviceName) {
        // Hapus spasi dari nama HP biar aman jadi ID (Misal: SAMSUNG_SM-A528B)
        const safeDeviceName = deviceName.replace(/[^a-zA-Z0-9]/g, '_');
        const docId = `${uid}_${safeDeviceName}`;

        // Timpa dokumen yang sama, JANGAN nambah baru!
        await db.collection('user_logs').doc(docId).set({
            uid: uid, action: action, details: details, timestamp: new Date()
        }, { merge: true });

    } else {
        // Kalau log biasa (kayak Ganti Password), bikin baris baru
        await logUserActivity(uid, action, details);
    }
    
    res.status(200).json({ success: true, message: 'Client log saved successfully' });
  } catch (error) { res.status(500).json({ success: false, message: 'Error', error: error.message }); }
};
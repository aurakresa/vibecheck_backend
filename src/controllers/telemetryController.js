// src/controllers/telemetryController.js

const { db, admin } = require('../config/firebase');

exports.trackActivity = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { type, subtype } = req.body; 

    if (!type) return res.status(400).json({ success: false, message: 'Type is required' });

    const now = new Date();
    const monthId = now.toISOString().slice(0, 7); 
    const fullTimestamp = now.toISOString();

    const batch = db.batch();
    const mainDocRef = db.collection('telemetry_stats').doc(uid);

    let mainUpdateData = { updatedAt: now };

    if (type === 'shutter') {
      mainUpdateData.purikura_shutter_count = admin.firestore.FieldValue.increment(1);
      
      const shutterRef = mainDocRef.collection('shutter_logs').doc(monthId);
      batch.set(shutterRef, {
        period: monthId,
        events: admin.firestore.FieldValue.arrayUnion(fullTimestamp)
      }, { merge: true });

    } else if (type === 'p2p') {
      mainUpdateData.p2p_connect_count = admin.firestore.FieldValue.increment(1);
      
      const p2pRef = mainDocRef.collection('p2p_logs').doc(monthId);
      batch.set(p2pRef, {
        period: monthId,
        events: admin.firestore.FieldValue.arrayUnion(fullTimestamp)
      }, { merge: true });

    } else if (type === 'filter') {
      if (subtype) {
        // 🔥 FIX: Gunakan struktur Object eksplisit agar Firestore melakukan deep-merge pada Map
        mainUpdateData.filters = {
            [subtype]: admin.firestore.FieldValue.increment(1)
        };
      }
    } else if (type === 'frame') {
      if (subtype) {
        // 🔥 FIX: Gunakan struktur Object eksplisit 
        mainUpdateData.frames = {
            [subtype]: admin.firestore.FieldValue.increment(1)
        };
      }
    } else {
      return res.status(400).json({ success: false, message: 'Unknown activity type' });
    }

    batch.set(mainDocRef, mainUpdateData, { merge: true });
    await batch.commit();

    res.status(200).json({ success: true, message: `Telemetry [${type}] logged with granular timestamp` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// [GET] Endpoint buat ngambil data buat digambar jadi Chart di Android
exports.getTelemetryData = async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Siapkan format bulan ini (contoh: "2026-06") untuk narik bucket terbaru
    const now = new Date();
    const monthId = now.toISOString().slice(0, 7);

    // 1. Ambil Data Grand Total
    const doc = await db.collection('telemetry_stats').doc(uid).get();
    let responseData = doc.exists ? doc.data() : { purikura_shutter_count: 0, p2p_connect_count: 0, frames: {}, filters: {} };

    // 2. Ambil Array Timestamp Shutter Bulan Ini
    const shutterDoc = await db.collection('telemetry_stats').doc(uid).collection('shutter_logs').doc(monthId).get();
    responseData.shutter_logs = shutterDoc.exists ? shutterDoc.data().events : [];

    // 3. Ambil Array Timestamp P2P Bulan Ini
    const p2pDoc = await db.collection('telemetry_stats').doc(uid).collection('p2p_logs').doc(monthId).get();
    responseData.p2p_logs = p2pDoc.exists ? p2pDoc.data().events : [];

    // 🔴 Paksa Anti-Cache biar angka di HP gerak real-time!
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Kirim JSON lengkap ke Android (Cocok 100% dengan DTO baru)
    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
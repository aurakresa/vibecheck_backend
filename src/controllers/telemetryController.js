const { db, admin } = require('../config/firebase');

exports.trackActivity = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { type, subtype } = req.body; 

    if (!type) return res.status(400).json({ success: false, message: 'Type is required' });

    const now = new Date();
    // Bikin format "YYYY-MM" untuk nama dokumen Bucket
    const monthId = now.toISOString().slice(0, 7); 
    // Format timestamp akurat untuk isi Array
    const fullTimestamp = now.toISOString();

    const batch = db.batch();
    const mainDocRef = db.collection('telemetry_stats').doc(uid);

    // 1. Update Dokumen Utama (Untuk Grand Total & Chart Filter Tone Warna)
    let mainUpdateData = { updatedAt: now };

    // 2. Routing Data Berdasarkan Tipe
    if (type === 'shutter') {
      mainUpdateData.purikura_shutter_count = admin.firestore.FieldValue.increment(1);
      
      // Masukkan ke Array Bucket Shutter
      const shutterRef = mainDocRef.collection('shutter_logs').doc(monthId);
      batch.set(shutterRef, {
        period: monthId,
        events: admin.firestore.FieldValue.arrayUnion(fullTimestamp)
      }, { merge: true });

    } else if (type === 'p2p') {
      mainUpdateData.p2p_connect_count = admin.firestore.FieldValue.increment(1);
      
      // Masukkan ke Array Bucket P2P
      const p2pRef = mainDocRef.collection('p2p_logs').doc(monthId);
      batch.set(p2pRef, {
        period: monthId,
        events: admin.firestore.FieldValue.arrayUnion(fullTimestamp)
      }, { merge: true });

    } else if (type === 'filter') {
      if (subtype) {
        // Dot notation update untuk Map di Firestore
        mainUpdateData[`filters.${subtype}`] = admin.firestore.FieldValue.increment(1);
      }
    } else if (type === 'frame') {
      if (subtype) {
        mainUpdateData[`frames.${subtype}`] = admin.firestore.FieldValue.increment(1);
      }
    } else {
      return res.status(400).json({ success: false, message: 'Unknown activity type' });
    }

    // Eksekusi semua perintah secara bersamaan (Batch)
    batch.set(mainDocRef, mainUpdateData, { merge: true });
    await batch.commit();

    res.status(200).json({ success: true, message: `Telemetry [${type}] logged with granular timestamp` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getTelemetryData = async (req, res) => {
  // Biarkan sama seperti sebelumnya untuk mengambil data Grand Total.
  // Untuk mengambil data Shutter/P2P bulanan, Android akan menembak endpoint baru atau langsung query sub-collection.
  // (Lebih baik Android langsung tarik sub-collection shutter_logs/p2p_logs via Firebase Android SDK untuk efisiensi).
  try {
    const uid = req.user.uid;
    const doc = await db.collection('telemetry_stats').doc(uid).get();

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    if (!doc.exists) {
      return res.status(200).json({ success: true, data: { purikura_shutter_count: 0, p2p_connect_count: 0, frames: {}, filters: {} } });
    }
    res.status(200).json({ success: true, data: doc.data() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
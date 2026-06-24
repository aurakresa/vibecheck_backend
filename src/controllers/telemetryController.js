const { db, admin } = require('../config/firebase');

// [POST] Endpoint buat nerima sinyal aktivitas dari Android
exports.trackActivity = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { type, subtype } = req.body; 

    if (!type) {
      return res.status(400).json({ success: false, message: 'Type is required' });
    }

    const docRef = db.collection('telemetry_stats').doc(uid);
    const increment = admin.firestore.FieldValue.increment(1);
    
    let updateData = { updatedAt: new Date() };

    switch (type) {
      case 'shutter':
        updateData.purikura_shutter_count = increment;
        break;
      case 'p2p':
        updateData.p2p_connect_count = increment;
        break;
      case 'frame':
        if (subtype) {
          // 🔴 Bikin jadi Nested Object (Map) biar dibaca Android!
          updateData.frames = {};
          updateData.frames[subtype] = increment; 
        }
        break;
      case 'filter':
        if (subtype) {
          // 🔴 Bikin jadi Nested Object (Map) biar dibaca Android!
          updateData.filters = {};
          updateData.filters[subtype] = increment;
        }
        break;
      default:
        return res.status(400).json({ success: false, message: 'Unknown activity type' });
    }

    // Dengan merge: true, Firebase bakal ngegabungin isi Map dengan aman 
    // tanpa numpuk/ngapus filter lain yang udah ada.
    await docRef.set(updateData, { merge: true });

    res.status(200).json({ success: true, message: `Telemetry [${type}] logged` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// [GET] Endpoint buat ngambil data buat digambar jadi Chart di Android
exports.getTelemetryData = async (req, res) => {
  try {
    const uid = req.user.uid;
    const doc = await db.collection('telemetry_stats').doc(uid).get();

    // 🔴 Paksa Anti-Cache biar angka di HP gerak real-time!
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (!doc.exists) {
      return res.status(200).json({
        success: true,
        data: {
          purikura_shutter_count: 0,
          p2p_connect_count: 0,
          frames: {},
          filters: {}
        }
      });
    }

    res.status(200).json({ success: true, data: doc.data() });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
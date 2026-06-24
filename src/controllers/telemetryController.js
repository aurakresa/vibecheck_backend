const { db, admin } = require('../config/firebase');

// [POST] Endpoint buat nerima sinyal aktivitas dari Android
exports.trackActivity = async (req, res) => {
  try {
    const uid = req.user.uid;
    // Android bakal ngirim 'type' (shutter/p2p/frame/filter) dan 'subtype' (cyan/2x2/dll)
    const { type, subtype } = req.body; 

    if (!type) {
      return res.status(400).json({ success: false, message: 'Type is required' });
    }

    const docRef = db.collection('telemetry_stats').doc(uid);
    const increment = admin.firestore.FieldValue.increment(1);
    
    // Objek ini bakal nambahin angka tanpa nimpa data yang udah ada
    let updateData = { updatedAt: new Date() };

    switch (type) {
      case 'shutter':
        updateData['purikura_shutter_count'] = increment;
        break;
      case 'p2p':
        updateData['p2p_connect_count'] = increment;
        break;
      case 'frame':
        if (subtype) updateData[`frames.${subtype}`] = increment; // Nambah spesifik ke tipe framenya
        break;
      case 'filter':
        if (subtype) updateData[`filters.${subtype}`] = increment; // Nambah spesifik ke tipe filternya
        break;
      default:
        return res.status(400).json({ success: false, message: 'Unknown activity type' });
    }

    // Pakai merge: true biar kalau dokumennnya belum ada, dibikinin otomatis
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

    if (!doc.exists) {
      // Kalau user baru dan belum ngapa-ngapain, balikin angka nol semua
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
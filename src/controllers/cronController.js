const { db } = require('../config/firebase');
const googleTrends = require('google-trends-api');

exports.updateGlobalTrends = async (req, res) => {
  try {
    const results = await googleTrends.interestOverTime({
        keyword: ['Y2K', 'peace sign', 'photobooth'],
        startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
    });

    const parsedData = JSON.parse(results);
    const timeline = parsedData.default.timelineData;
    const latestData = timeline[timeline.length - 1];

    const y2kScore = latestData.value[0] || 50;
    const peaceScore = latestData.value[1] || 50;
    const photoboothScore = latestData.value[2] || 50;

    const trendsData = {
      "HALF_BODY_PEACE": peaceScore + 20,       
      "HALF_BODY_COOL": y2kScore + 15,          
      "FULL_BODY_WIDE": photoboothScore + 10,   
      "HALF_BODY_FRAME": Math.round((y2kScore + photoboothScore) / 2),
      "FULL_BODY_ACTION": Math.round(y2kScore * 0.8)
    };

    const updateData = {
      updatedAt: new Date(),
      source: "Google Trends API",
      trends: trendsData
    };

    await db.collection('global_metrics').doc('pose_trends').set(updateData);
    res.status(200).json({ success: true, message: 'Google Trends fetched!', data: updateData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getGlobalTrends = async (req, res) => {
    try {
        const doc = await db.collection('global_metrics').doc('pose_trends').get();
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
        
        if (!doc.exists) {
            return res.status(200).json({ success: true, data: { source: "N/A", trends: {} } });
        }
        res.status(200).json({ success: true, data: doc.data() });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
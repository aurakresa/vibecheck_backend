const { db } = require('../config/firebase');
const axios = require('axios');
const ytSearch = require('yt-search');

exports.runDataPipeline = async (req, res) => {
  try {
    console.log("🚀 STARTING VIBECHECK DATA PIPELINE (WIKI + YT)...");
    const scrapeTime = new Date();
    let wikiTrends = {};

    const keywordsWiki = ["Digital_camera", "Y2K_aesthetic", "Computational_photography", "Photographic_filter"];
    for (const keyword of keywordsWiki) {
        try {
            const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${keyword}/monthly/2026050100/2026060100`;
            const response = await axios.get(url, { headers: { "User-Agent": "VibeCheck_Project/1.0" } });
            const items = response.data.items;
            wikiTrends[keyword] = items[items.length - 1].views;
        } catch (err) {
            wikiTrends[keyword] = 0; 
        }
    }

    const ytSearchQuery = "photo pose ideas";
    const ytResults = await ytSearch(ytSearchQuery);
    const topVideos = ytResults.videos.slice(0, 10).map(video => ({
        title: video.title,
        channel: video.author.name,
        views: video.views,
        duration: video.timestamp,
        url: video.url,
        scraped_at: scrapeTime
    }));

    await db.collection('bigdata_market').doc('wiki_trends').set({ updatedAt: scrapeTime, data: wikiTrends });
    await db.collection('bigdata_market').doc('youtube_trends').set({ updatedAt: scrapeTime, top_videos: topVideos });

    res.status(200).json({ success: true, message: "Pipeline Wiki & YT Selesai!", wiki_data: wikiTrends, yt_data: topVideos.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMarketData = async (req, res) => {
    try {
        const wikiDoc = await db.collection('bigdata_market').doc('wiki_trends').get();
        const ytDoc = await db.collection('bigdata_market').doc('youtube_trends').get();

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

        res.status(200).json({
            success: true,
            data: {
                wiki_trends: wikiDoc.exists ? wikiDoc.data() : null,
                youtube_trends: ytDoc.exists ? ytDoc.data() : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
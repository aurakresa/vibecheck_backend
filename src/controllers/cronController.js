const { db } = require('../config/firebase');
const axios = require('axios');
const ytSearch = require('yt-search');

exports.runDataPipeline = async (req, res) => {
    try {
        console.log("🚀 STARTING VIBECHECK DATA PIPELINE...");
        const scrapeTime = new Date();

        // ==========================================
        // 1. EXTRACT & TRANSFORM WIKIPEDIA
        // ==========================================
        const keywordsWiki = ["Digital_camera", "Y2K_aesthetic", "Computational_photography", "Photographic_filter"];
        let wikiTrends = {};

        for (const keyword of keywordsWiki) {
            try {
                // Ambil data sebulan terakhir saja biar cepat
                const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${keyword}/monthly/2026050100/2026060100`;
                const response = await axios.get(url, {
                    headers: { "User-Agent": "VibeCheck_Data_Project/1.0 (student_project)" }
                });
                
                // Ambil total views bulan terakhir
                const items = response.data.items;
                const lastMonthViews = items[items.length - 1].views;
                wikiTrends[keyword] = lastMonthViews;
            } catch (err) {
                console.log(`❌ Gagal tarik Wiki: ${keyword}`);
                wikiTrends[keyword] = 0; // Fallback
            }
        }

        // ==========================================
        // 2. EXTRACT & TRANSFORM YOUTUBE
        // ==========================================
        const ytSearchQuery = "tren edit foto filter aesthetic viral";
        console.log(`🔍 Mencari video YouTube terpopuler: '${ytSearchQuery}'`);
        
        const ytResults = await ytSearch(ytSearchQuery);
        // Ambil top 10 video aja biar enteng di HP
        const topVideos = ytResults.videos.slice(0, 10).map(video => ({
            title: video.title,
            channel: video.author.name,
            views: video.views,
            duration: video.timestamp,
            scraped_at: scrapeTime
        }));

        // ==========================================
        // 3. LOAD (SIMPAN KE FIRESTORE)
        // ==========================================
        // Simpan Wiki ke dokumen khusus
        await db.collection('bigdata_market').doc('wiki_trends').set({
            updatedAt: scrapeTime,
            data: wikiTrends
        });

        // Simpan YouTube ke dokumen khusus
        await db.collection('bigdata_market').doc('youtube_trends').set({
            updatedAt: scrapeTime,
            top_videos: topVideos
        });

        console.log("☁️ SUKSES! Data Wiki & YouTube tersimpan di Firestore.");

        res.status(200).json({
            success: true,
            message: "Data Pipeline Selesai",
            wiki_data: wikiTrends,
            yt_data: topVideos.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
};
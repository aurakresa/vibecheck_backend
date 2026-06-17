const express = require('express');
const cors = require('cors');

// 🔴 PERUBAHAN: Pake titik dua (../) karena file ini sekarang di dalam folder /api
const userRoutes = require('../src/routes/userRoutes'); 

const app = express();

app.use(cors());
app.use(express.json());

// Halaman Depan
app.get('/', (req, res) => {
    res.send('<h1>VIBECHECK_OS BACKEND IS RUNNING 🚀</h1><p>Semua sistem normal dan siap menerima request!</p>');
});

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({ success: true, message: 'VibeCheck Backend is Live!' });
});

// Panggil rute users
app.use('/api/users', userRoutes);

// Jalankan server di lokal
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server nyala di port ${PORT}`);
    });
}

// WAJIB UNTUK VERCEL
module.exports = app;
const express = require('express');
const cors = require('cors');

const userRoutes = require('../src/routes/userRoutes'); 
// 🔴 INI BARIS YANG KETINGGALAN KEMARIN COY:
const telemetryRoutes = require('../src/routes/telemetryRoutes');

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

// Panggil rute
app.use('/api/users', userRoutes);
app.use('/api/telemetry', telemetryRoutes);

// Jalankan server di lokal
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server nyala di port ${PORT}`);
    });
}

// WAJIB UNTUK VERCEL
module.exports = app;
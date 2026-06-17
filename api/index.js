const express = require('express');
const cors = require('cors');
const userRoutes = require('../src/routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({ success: true, message: 'VibeCheck Backend is Live!' });
});

app.use('/api/users', userRoutes);

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server nyala di port ${PORT}`);
    });
}

// Export module untuk Vercel
module.exports = app;
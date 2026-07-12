require('dotenv').config();
const express = require('express');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const userRoutes = require('../src/routes/userRoutes'); 
const telemetryRoutes = require('../src/routes/telemetryRoutes');
const cronRoutes = require('../src/routes/cronRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Muat dokumen Swagger YAML
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// 2. Gunakan CDN CSS untuk mencegah blank screen (layar putih) di Vercel
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";

// 3. Terapkan Swagger UI dengan opsi customCssUrl
app.use(
    '/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument, {
        customCssUrl: CSS_URL,
        customSiteTitle: "VibeCheck API Docs"
    })
);

app.get('/', (req, res) => {
    res.send('<h1>VIBECHECK_OS BACKEND IS RUNNING 🚀</h1><p>Semua sistem normal dan siap menerima request!</p><br><p>📚 Buka <a href="/api-docs">/api-docs</a> untuk dokumentasi API.</p>');
});

app.get('/api/status', (req, res) => {
  res.status(200).json({ success: true, message: 'VibeCheck Backend is Live!' });
});

app.use('/api/users', userRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/external', cronRoutes);

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server nyala di port ${PORT}`);
        console.log(`📚 Dokumentasi API tersedia di http://localhost:${PORT}/api-docs`);
    });
}

module.exports = app;
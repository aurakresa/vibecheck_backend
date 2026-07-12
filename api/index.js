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

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
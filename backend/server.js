const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { loadData } = require('./data-loader');
const insightsRouter = require('./routes/insights');
const scatterRouter = require('./routes/scatter');
const correlationsRouter = require('./routes/correlations');
const distributionRouter = require('./routes/distribution');
const recipesRouter = require('./routes/recipes');
const clustersRouter = require('./routes/clusters');
const securityRouter = require('./routes/security');
const verify2faRouter = require('./routes/verify-2fa');
const cleanupRouter = require('./routes/cleanup');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/insights', insightsRouter);
app.use('/api/scatter', scatterRouter);
app.use('/api/correlations', correlationsRouter);
app.use('/api/distribution', distributionRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/clusters', clustersRouter);
app.use('/api/security-status', securityRouter);
app.use('/api/verify-2fa', verify2faRouter);
app.use('/api/cleanup', cleanupRouter);

// Preload data then start server
loadData()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to load data:', err);
    process.exit(1);
  });

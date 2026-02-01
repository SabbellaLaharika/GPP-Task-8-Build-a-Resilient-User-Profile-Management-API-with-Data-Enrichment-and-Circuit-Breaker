const express = require('express');
const morgan = require('morgan');
const app = express();

const PORT = process.env.MOCK_PORT || 8081;
const FAILURE_RATE = parseFloat(process.env.MOCK_SERVICE_FAILURE_RATE || 0);
const DELAY_MS = parseInt(process.env.MOCK_SERVICE_DELAY_MS || 0);

app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.get('/enrich/:userId', (req, res) => {
  setTimeout(() => {
    if (Math.random() < FAILURE_RATE) {
      console.log('Simulating failure');
      return res.status(503).json({ error: 'Service Unavailable (Simulated)' });
    }

    res.json({
        userId: req.params.userId,
        recentActivity: ['login', 'view_product', 'purchase'],
        loyaltyScore: Math.floor(Math.random() * 100)
    });
  }, DELAY_MS);
});

app.listen(PORT, () => {
  console.log(`Mock Enrichment Service running on port ${PORT}`);
});

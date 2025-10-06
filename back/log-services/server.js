const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/logs/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'log-service' });
});

app.use('/logs', routes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LogService is running on http://0.0.0.0:${PORT}`);
});
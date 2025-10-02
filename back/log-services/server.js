const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/logs/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'log-service' });
});

app.use('/logs', routes);

app.listen(PORT, () => {
  console.log(`LogService is running on http://localhost:${PORT}`);
});

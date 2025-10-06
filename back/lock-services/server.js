const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'lock-service' });
});

app.use('/', routes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LockService is running on http://0.0.0.0:${PORT}`);
});
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/users/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'user-service' });
});

app.use('/users', routes);
app.use('/uploads', express.static('uploads'));

// Escutar em 0.0.0.0 para aceitar conexões de outros pods
app.listen(PORT, '0.0.0.0', () => {
  console.log(`UserService is running on http://0.0.0.0:${PORT}`);
});
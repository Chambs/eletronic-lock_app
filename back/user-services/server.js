const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/users/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'user-service' });
});

app.use('/users', routes);
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`UserService is running on http://localhost:${PORT}`);
});

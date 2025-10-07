const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/users/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'user-service' });
});

app.use('/api/users', routes); 

app.use('/api/uploads', express.static('uploads'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`UserService is running on http://0.0.0.0:${PORT}`);
});
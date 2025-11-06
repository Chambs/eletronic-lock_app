const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection test successful');
    client.release();
  } catch (error) {
    console.error('Database connection test failed:', error);
    process.exit(1);
  }
}

app.get('/api/users/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'user-service' });
});

app.use('/api/users', routes);

app.use('/api/uploads', express.static('uploads'));

async function startServer() {
  await testDatabaseConnection();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UserService is running on http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;

if (require.main === module) {
  startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
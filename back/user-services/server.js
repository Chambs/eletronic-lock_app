const express = require('express');
const userRoutes = require('./routes');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.send('UserService is running!');
});

app.listen(PORT, () => {
  console.log(`UserService is running on http://localhost:${PORT}`);
});

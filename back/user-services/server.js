const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes');
require('./user-create-log'); 

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`UserService is running on http://localhost:${PORT}`);
});

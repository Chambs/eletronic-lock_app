const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use('/logs', routes);

app.listen(PORT, () => {
  console.log(`LogService is running on http://localhost:${PORT}`);
});

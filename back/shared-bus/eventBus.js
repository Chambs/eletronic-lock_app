const express = require("express");
const cors = require('cors');
const app = express();
const axios = require('axios');

const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(cors());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'event-bus' });
});

app.post('/join', (req, res) => {
    const event = req.body
    axios.post('http://user-service:3001/users/join', event);
    axios.post('http://log-service:3002/logs/join', event);
    res.status(200).send({msg:'ok'});
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SharedBus is running on http://0.0.0.0:${PORT}`);
});
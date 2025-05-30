const express = require("express");
const cors = require('cors');
const app = express();
const axios = require('axios');

const PORT = 3004;

app.use(express.json());
app.use(cors());

app.post('/events', (req, res) => {
    const event = req.body
    axios.post('http://localhost:3001/event', event); //user-services
    axios.post('http://localhost:3002/event', event); //log-services
    axios.post('http://localhost:3003/event', event); //lock-services
    res.status(200).send({msg:'ok'});
})

app.listen(PORT, () => {
  console.log(`SharedBus is running on http://localhost:${PORT}`);
});

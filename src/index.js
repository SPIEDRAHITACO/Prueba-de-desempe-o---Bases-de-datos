const express = require('express');
const cors = require('cors');
const { pgPool, connectMongo } = require('./config/db');
const apiRoutes = require('./routes/api.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectMongo();

app.use('/api', apiRoutes);

pgPool.connect((err, client, release) => {
    if (err) return console.error('Error acquiring PostgreSQL client', err.stack);
    console.log('PostgreSQL connected successfully');
    release();
    
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});
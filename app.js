const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Import configs
const dbConnection = require('./config/database');
const cloudinaryConfig = require('./config/cloudinary');
const { encrypt, decrypt } = require('./utils/encrypt');

// Defining the app constant
const app = express();
module.exports = { app };

// Middleware setup
app.set('trust proxy', 1)
app.get('/ip', (req, res) => res.send(req.ip))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Implement CORS
app.use(
    cors({
        origin: true,
        methods: ['POST', 'GET', 'DELETE', 'OPTIONS', 'PUT'],
        credentials: true,
        maxAge: 3600,
    })
);

dbConnection();
cloudinaryConfig();

// console.log(decrypt(""))


// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Backend Server is listening at http://localhost:${PORT} ...`);
});

// API Routes
require('./router');

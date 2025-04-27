require('dotenv').config()

const express = require("express");
const cors = require("cors");
const path = require('path');
const mongoose = require('mongoose');
const { handleUpgrade } = require('./websocket.js');
// Add Sequelize import
const { sequelize } = require('./models/sequelize');

//INIT APP
const app = express();
//IMPORT HTTP
const http = require('http');
//CREATE HTTP SERVER
const server = http.createServer(app);

//PORT
const PORT = process.env.PORT || 8000;

const MONGODB_URI = process.env.MONGODB_URI;

// Variables to track database connection status
let isMongoDbConnected = false;
let isSequelizeConnected = false;

//CONNECT TO MONGODB
mongoose.connect(MONGODB_URI, {})
    .then(() => {
        isMongoDbConnected = true;
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        isMongoDbConnected = false;
    });

// Listen for MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
    isMongoDbConnected = false;
});

// Listen for MongoDB reconnection
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
    isMongoDbConnected = true;
});

// Connect to SQLite using Sequelize
sequelize.authenticate()
    .then(() => {
        console.log('Connected to SQLite via Sequelize');
        isSequelizeConnected = true;
    })
    .catch(err => {
        console.error('SQLite connection error:', err);
        isSequelizeConnected = false;
    });

server.on('upgrade', handleUpgrade);

//USE CORS
//app.use(cors());

app.use(cors({
    origin: '*',
    exposedHeaders: ['X-Database-Status', 'X-Sequelize-Status'],
}));

//app.use(cors({
//    origin: 'http://localhost:3000'
//}));

//USE JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to check database connection status
app.use((req, res, next) => {
    if (req.path.startsWith('/api/v1/')) {
        // Set headers for both database connections
        res.setHeader('X-Database-Status', isMongoDbConnected ? 'CONNECTED' : 'NOT_CONNECTED');
        res.setHeader('X-Sequelize-Status', isSequelizeConnected ? 'CONNECTED' : 'NOT_CONNECTED');
        
        // For now, only require MongoDB connection
        if (!isMongoDbConnected) {
            return res.status(500).json({
                error: true,
                message: 'Unable to connect to the database. Verify the connection string and restart the server.'
            });
        }
    }
    next();
});

//PUBLIC STATIC FOLDER
app.use(express.static('dist'));
app.use('/public', express.static('public'));
app.use('/images', express.static('../storage/uploads'));

/* app.use((req, res, next) => {
    setTimeout(() => {
        next();
    }, 4500); // 5000 milliseconds = 5 seconds
});  */

app.use('/apps/:appName', (req, res, next) => {
    const appName = req.params.appName;
    const publicDir = path.join(__dirname, 'apps', appName, 'public');

    // Serve static files from the public directory of the specified app
    express.static(publicDir)(req, res, next);
});

//Slash endpoint
const home = require('./routes/home.js');
const authRoute = require('./routes/auth.js');
const manageRoute = require('./routes/manage.js');
const imageRoute = require('./routes/image.js');
const listingRoute = require('./routes/listing.js');
const networkdeviceRoute = require('./routes/networkdevice.js');
const todoRoute = require('./routes/todo.js');
const snippetRoute = require('./routes/snippet.js');
const appRoute = require('./routes/app.js');
const accountsRoute = require('./routes/accounts.js');
const pageRoute = require('./routes/page.js');
const totpRoute = require('./routes/totp.js');
const iconpackRoute = require('./routes/iconpack.js');

app.use('/api/v1/', home);
app.use('/api/v1/', authRoute);
app.use('/api/v1/', manageRoute);
app.use('/api/v1/', imageRoute);
app.use('/api/v1/', listingRoute);
app.use('/api/v1/', networkdeviceRoute);
app.use('/api/v1/', todoRoute);
app.use('/api/v1/', snippetRoute);
app.use('/api/v1/', appRoute);
app.use('/api/v1/', accountsRoute);
app.use('/api/v1/', pageRoute);
app.use('/api/v1/', totpRoute);
app.use('/api/v1/', iconpackRoute);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

//use custom exception handler
app.use((req, res) => {
    res.status(400).send("Error");
});

server.listen(PORT, () => {
    console.log(`SERVER RUNNING AT ${PORT}`);
});
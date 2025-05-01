require('dotenv').config()

const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const { handleUpgrade } = require('./websocket.js');
// Sequelize import
const { sequelize } = require('./models');

// App discovery and installation
const { discoverAndRegisterApps, installDependencies } = require('./utils/appDiscovery');

//INIT APP
const app = express();
//IMPORT HTTP
const http = require('http');
//CREATE HTTP SERVER
const server = http.createServer(app);

//PORT
const PORT = process.env.PORT || 8000;

// Variables to track database connection status
let isSequelizeConnected = false;

// Connect to SQLite using Sequelize
sequelize.authenticate()
    .then(() => {
        console.log('Connected to SQLite via Sequelize');
        isSequelizeConnected = true;
        
        // Once database is connected, initialize app discovery
        initializeAppDiscovery();
    })
    .catch(err => {
        console.error('SQLite connection error:', err);
        isSequelizeConnected = false;
    });

// Function to set up app discovery and watching
function initializeAppDiscovery() {
    // Ensure storage/apps directory exists
    const storageAppsDir = path.join(__dirname, '../storage/apps');
    if (!fs.existsSync(storageAppsDir)) {
        console.log(`Creating storage/apps directory: ${storageAppsDir}`);
        fs.mkdirSync(storageAppsDir, { recursive: true });
    }
    
    // Initial app discovery - passing true to indicate this is the server startup scan
    // This will sync the database with available apps in both directories
    discoverAndRegisterApps(null, true)
        .then(() => {
            console.log('Initial app discovery and database synchronization complete');
        })
        .catch(error => {
            console.error('Error during initial app discovery:', error);
        });
    
    // Setup file watcher for storage/apps only (as per requirements)
    const watcher = chokidar.watch(storageAppsDir, {
        persistent: true,
        ignoreInitial: true,
        depth: 2,
        ignored: [
            /(^|[\/\\])\../, // ignore dotfiles
            '**/node_modules/**', // ignore all node_modules directories
            '**/.git/**',     // ignore git directories
            '**/package-lock.json', // ignore package lock files
            '**/npm-debug.log',  // ignore npm debug logs
            '**/npm-install.log' // ignore our custom install logs
        ]
    });
    
    // Handle new app directories and removed app directories
    watcher
        .on('addDir', dirPath => {
            // Only process direct subdirectories of storage/apps
            if (path.dirname(dirPath) === storageAppsDir) {
                console.log(`New app directory detected: ${dirPath}`);
                discoverAndRegisterApps([dirPath])
                    .catch(error => console.error(`Error processing new app directory ${dirPath}:`, error));
            }
        })
        .on('unlinkDir', dirPath => {
            // Only process direct subdirectories of storage/apps
            if (path.dirname(dirPath) === storageAppsDir) {
                const appName = path.basename(dirPath);
                console.log(`App directory removed: ${appName}`);
                
                // Call the utility function to handle app removal
                // The updated version will check if app exists in server/apps before removing
                const { removeAppFromDatabase } = require('./utils/appDiscovery');
                removeAppFromDatabase(appName)
                    .then(() => console.log(`App ${appName} removal process completed`))
                    .catch(error => console.error(`Error removing app ${appName}: ${error.message}`));
            }
        })
        .on('error', error => console.error(`Watcher error: ${error}`));
}

server.on('upgrade', handleUpgrade);

//USE CORS
//app.use(cors());

app.use(cors({
    origin: '*',
    exposedHeaders: ['X-Sequelize-Status'],
}));

app.use(cors({
    origin: 'http://localhost:3000'
}));

//USE JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware to check database connection status
app.use((req, res, next) => {
    if (req.path.startsWith('/api/v1/')) {
        // Set header for database connection
        res.setHeader('X-Sequelize-Status', isSequelizeConnected ? 'CONNECTED' : 'NOT_CONNECTED');
        
        // Check if database is connected
        if (!isSequelizeConnected) {
            return res.status(500).json({
                error: true,
                message: 'Unable to connect to the database. Verify the connection and restart the server.'
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
    
    // Check storage/apps directory first (higher priority)
    const storagePublicDir = path.join(__dirname, '../storage/apps', appName, 'public');
    if (fs.existsSync(storagePublicDir)) {
        return express.static(storagePublicDir)(req, res, next);
    }
    
    // Fall back to server/apps directory
    const serverPublicDir = path.join(__dirname, 'apps', appName, 'public');
    if (fs.existsSync(serverPublicDir)) {
        return express.static(serverPublicDir)(req, res, next);
    }
    
    // If neither exists, continue to next middleware
    next();
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

// Routes
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
    try{
        // Check if the requested file exists in the dist folder
        const filePath = path.join(__dirname, 'dist', req.path);
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }
    }
    catch (err) {
        res.status(404).send("File not found");
    }
});

//use custom exception handler
app.use((req, res) => {
    res.status(400).send("Error");
});

server.listen(PORT, () => {
    console.log(`SERVER RUNNING AT ${PORT}`);
});
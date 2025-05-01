const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    dashboard,
    saveSettings,
    getSetting,
    saveThemeSettings,
    saveWeatherSettings,
    weatherData,
    oidcSettings,
    getOidcSettings,
    importMigration
} = require('../controllers/manage');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// Ensure temp directory exists for migration file uploads
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer storage for migration file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir); // Store in temp directory
    },
    filename: function (req, file, cb) {
        cb(null, 'backup-' + Date.now() + '.zip'); // Generate unique filename for zip files
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit to 50MB (increased for zip files with uploads)
    fileFilter: function (req, file, cb) {
        // Accept only ZIP files
        if (file.mimetype !== 'application/zip' && file.mimetype !== 'application/x-zip-compressed') {
            return cb(new Error('Only ZIP files are allowed'), false);
        }
        cb(null, true);
    }
});

// Dashboard route
router.get('/dashboard', verifyToken, dashboard);

// Weather data route
router.get('/weather', verifyToken, weatherData);

// Settings routes
router.post('/settings', verifyToken, saveSettings); // Save all settings
router.post('/settings/theme', verifyToken, saveThemeSettings); // Save theme settings
router.post('/settings/weather', verifyToken, saveWeatherSettings); // Save weather settings
router.post('/settings/oidc', verifyToken, oidcSettings); // Save oidc settings
router.get('/settings/oidc', verifyToken, getOidcSettings); // Get oidc settings
router.get('/settings', verifyToken, getSetting); // Get current settings

// Migration import route
router.post('/settings/import-migration', verifyToken, upload.single('migrationFile'), importMigration);

module.exports = router;

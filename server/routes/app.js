const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth');
const { runIntegratedApp, connectTest, installedApps, installFromZip, removeInstalledApp, syncFromDisk, installRemoteApp } = require('../controllers/app');

// Ensure the upload directory exists
const uploadDir = './public/uploads/integrations';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        cb(null, `${timestamp}_${randomNum}.zip`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
            cb(null, true);
        } else {
            cb(new Error('Only .zip files are allowed! Found: ' + file.mimetype), false);
        }
    }
});

router.get('/app/run/:listingId/:appId', verifyToken, runIntegratedApp);
router.post('/app/test', verifyToken, connectTest);
router.get('/app/installed', verifyToken, installedApps);
router.post('/app/fromzip', verifyToken, upload.single('file'), installFromZip);
router.get('/app/sync', verifyToken, syncFromDisk);
router.get('/app/:appId/delete', verifyToken, removeInstalledApp);
router.get('/app/:appId/install', verifyToken, installRemoteApp);

module.exports = router;
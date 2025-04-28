const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const multer = require('multer')
const path = require('path');
const fs = require('fs');
const { uploadImage, listImages, showPreviewImage, deleteImage } = require('../controllers/image');
const uploadToLocalFolder = require('../middlewares/uploadToLocalMiddleware');

// Define the upload directory
const uploadDirectory = './public/uploads/icons';

// Check if the directory exists, and create it if it doesn't
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const originalname = path.parse(file.originalname);
        const filename = `${timestamp}${originalname.ext}`;

        cb(null, filename);
    }
});

const fileFilter = function (req, file, cb) {
    // Check if the file is an image
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }

    // Check file size (max 100KB)
    if (file.size > 100 * 1024) {
        return cb(new Error('File size exceeds the limit (100KB)!'), false);
    }

    // Accept the file
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter
});

const router = express.Router();

router.post('/images/upload', verifyToken, upload.single('icon'), uploadToLocalFolder, uploadImage);
router.get('/images', verifyToken, listImages);
router.get('/iconpack/preview', verifyToken, showPreviewImage);
router.get('/image/delete/:imageId', verifyToken, deleteImage);

module.exports = router;
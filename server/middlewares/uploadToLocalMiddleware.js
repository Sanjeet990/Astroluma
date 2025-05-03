const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const uploadToLocalFolder = async(req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const localFolder = path.join(__dirname, '../../storage/uploads');
    await fs.mkdir(localFolder, { recursive: true });

    const targetPath = path.join(localFolder, req.file.filename);
    const data = await fs.readFile(req.file.path);

    // Check if the file is an image format supported by sharp
    const isSupported = await isSharpSupported(req.file.filename);
    

    if (isSupported) {
      // Process image with sharp if supported
      const image = sharp(data);
      const metadata = await image.metadata();
      let resizeOptions = {};

      if (metadata.width > 160 || metadata.height > 160) {
        resizeOptions = metadata.width > metadata.height
          ? { width: 160 }
          : { height: 160 };
      }

      const processedImageBuffer = await image
        .resize(resizeOptions)
        .toBuffer();

      await fs.writeFile(targetPath, processedImageBuffer);
    } else {
      // For unsupported formats, just copy the original file
      await fs.writeFile(targetPath, data);
    }

    req.localUrl = req.file.filename;

    // Clean up the original file
    await fs.unlink(req.file.path);

    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
}

// Helper function to check if file can be processed by sharp
async function isSharpSupported(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif'];
  return supportedFormats.includes(ext);
}

module.exports = uploadToLocalFolder;
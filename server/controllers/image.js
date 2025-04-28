const path = require('path');
const fs = require('fs');
const { Icon } = require('../models');

exports.uploadImage = async (req, res) => {
    const uploadedFile = req.localUrl;
    const userId = req.user?.id;

    if (!uploadedFile || !userId) {
        return res.status(400).json({
            error: true,
            message: "Image upload failed."
        });
    }

    try {
        const icon = await Icon.create({
            iconPath: uploadedFile,
            userId
        });

        return res.status(200).json({
            error: false,
            message: "Image uploaded successfully.",
            data: icon
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            error: true,
            message: "Image upload failed."
        });
    }
}

exports.listImages = async (req, res) => {
    const userId = req.user?.id;

    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const icons = await Icon.findAll({
            where: {
                [Icon.sequelize.Sequelize.Op.or]: [
                    { userId },
                    { userId: null }
                ]
            },
            order: [['id', 'DESC']], // Sort by id in descending order
            offset,
            limit
        });

        return res.status(200).json({
            error: false,
            message: "Icons retrieved successfully.",
            data: icons
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            error: true,
            message: "Failed to retrieve icons."
        });
    }
}

exports.showPreviewImage = async (req, res) => {

    const userId = req.user?.id;

    try {
        //Get random 12 icons
        const icons = await Icon.findAll({
            where: {
                [Icon.sequelize.Sequelize.Op.or]: [
                    { userId },
                    { userId: null }
                ]
            }
        });

        return res.status(200).json({
            iconPack: "Astroluma Default",
            iconPackVersion: "1.0.0",
            iconProvider: "com.astroluma.self",
            packDeveloper: "Sanjeet990",
            baseUrl: "http://localhost:8000/images/",
            baseUrlLight: null,
            iconData: icons.map(icon => {
                return {
                    iconUrl: icon.iconPath,
                    iconUrlLight: null,
                    iconId: icon.id,
                    iconName: icon.id
                }
            })
        });

    } catch (err) {
        return res.status(400).json({
            error: true,
            message: "Failed to retrieve icon."
        });
    }

}

exports.deleteImage = async (req, res) => {
    const loggedinuser = req.user;
    const imageId = req.params.imageId;

    try {
        // Find the image first
        const image = await Icon.findOne({
            where: {
                id: imageId,
                userId: loggedinuser?.id
            }
        });

        if (!image) {
            return res.status(400).json({
                error: true,
                message: "Image not found or you don't have permission to delete it."
            });
        }

        // Get the file path
        const iconPath = image.iconPath;
        const localFilePath = iconPath.startsWith('/uploads/') 
            ? path.join(__dirname, '../public', iconPath) 
            : null;

        // Delete from database
        await Icon.destroy({
            where: {
                id: imageId,
                userId: loggedinuser?.id
            }
        });

        // Delete physical file if it exists
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return res.status(200).json({
            error: false,
            message: "Image deleted successfully."
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error deleting image."
        });
    }
};

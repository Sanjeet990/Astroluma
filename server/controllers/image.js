const { Icon } = require("../models");

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

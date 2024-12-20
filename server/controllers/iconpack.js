const IconPack = require("../models/IconPack");
const axios = require("axios");

exports.listIconPacks = async (req, res) => {
    const userId = req.user?._id;

    try {
        const iconPacks = await IconPack.find({ $or: [{ userId: userId }, { userId: null }] });

        return res.status(200).json({
            error: false,
            message: iconPacks
        });

    } catch (err) {
        return res.status(500).json({
            error: true,
            message: err.message
        });
    }
}

exports.addiconpack = async (req, res) => {
    const { iconpackUrl } = req.body;
    const userId = req.user?._id;

    if (!iconpackUrl) {
        return res.status(500).json({
            error: true,
            message: "Icon pack URL is required"
        });
    }

    if (!iconpackUrl?.toLowerCase()?.startsWith('http') || !iconpackUrl?.toLowerCase()?.endsWith('.json') || !iconpackUrl?.toLowerCase()?.includes('://icons.getastroluma.com/')) {
        return res.status(500).json({
            error: true,
            message: "Icon pack URL is invalid"
        });
    }


    try {
        // Load the iconpack URL using axios
        const response = await axios.get(iconpackUrl);

        if (response.status !== 200) {
            return res.status(400).json({
                error: true,
                message: "Failed to load icon pack"
            });
        } else {
            const data = response.data;

            if (data?.error) {
                return res.status(400).json({
                    error: true,
                    message: data.message
                });
            }

            // Check if icon pack already exists
            const existingIconPack = await IconPack.findOne({ iconProvider: data?.iconProvider, userId: userId });
            if (existingIconPack) {
                return res.status(400).json({
                    error: true,
                    message: "Icon pack already exists"
                });
            }

            const IconPackInstance = new IconPack({
                iconProvider: data?.iconProvider,
                iconName: data?.iconPack,
                iconPackVersion: data?.iconPackVersion,
                jsonUrl: iconpackUrl,
                packDeveloper: data?.packDeveloper,
                credit: data?.credit,
                userId: userId
            });

            try {
                const savedIconPack = await IconPackInstance.save();
                return res.status(200).json({
                    error: false,
                    message: savedIconPack
                });
            } catch (err) {
                return res.status(500).json({
                    error: true,
                    message: err.message
                });
            }
        }
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

exports.deleteIconPack = async (req, res) => {
    const iconPackId = req.params.id;
    const userId = req.user?._id;

    try {
        const iconPack = await IconPack.findOne({ _id: iconPackId, userId: userId });

        if (!iconPack) {
            return res.status(404).json({
                error: true,
                message: "Icon pack not found"
            });
        }

        await IconPack.deleteOne({ _id: iconPackId, userId: userId });

        return res.status(200).json({
            error: false,
            message: "Icon pack deleted successfully"
        });

    } catch (err) {
        return res.status(500).json({
            error: true,
            message: err.message
        });
    }
}

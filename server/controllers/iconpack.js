const { IconPack } = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");

exports.listIconPacks = async (req, res) => {
    const userId = req.user?.id;

    try {
        const iconPacks = await IconPack.findAll({ 
            where: { 
                [Op.or]: [
                    { userId: userId }, 
                    { userId: null }
                ] 
            }
        });

        return res.status(200).json({
            error: false,
            message: iconPacks
        });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({
            error: true,
            message: err.message
        });
    }
}

exports.addiconpack = async (req, res) => {
    const { iconpackUrl } = req.body;
    const userId = req.user?.id;

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
            const existingIconPack = await IconPack.findOne({
                where: { 
                    iconProvider: data?.iconProvider, 
                    userId: userId 
                }
            });
            
            if (existingIconPack) {
                return res.status(400).json({
                    error: true,
                    message: "Icon pack already exists"
                });
            }

            try {
                const savedIconPack = await IconPack.create({
                    iconProvider: data?.iconProvider,
                    iconName: data?.iconPack,
                    iconPackVersion: data?.iconPackVersion,
                    jsonUrl: iconpackUrl,
                    packDeveloper: data?.packDeveloper,
                    credit: data?.credit,
                    userId: userId
                });
                
                return res.status(200).json({
                    error: false,
                    message: savedIconPack
                });
            } catch (err) {
                console.error("Error:", err);
                return res.status(500).json({
                    error: true,
                    message: err.message
                });
            }
        }
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({
            error: true,
            message: err.message
        });
    }
};

exports.deleteIconPack = async (req, res) => {
    const iconPackId = req.params.id;
    const userId = req.user?.id;

    try {
        const iconPack = await IconPack.findOne({ 
            where: { 
                id: iconPackId, 
                userId: userId 
            }
        });

        if (!iconPack) {
            return res.status(404).json({
                error: true,
                message: "Icon pack not found"
            });
        }

        await IconPack.destroy({ 
            where: { 
                id: iconPackId, 
                userId: userId 
            }
        });

        return res.status(200).json({
            error: false,
            message: "Icon pack deleted successfully"
        });

    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({
            error: true,
            message: err.message
        });
    }
}

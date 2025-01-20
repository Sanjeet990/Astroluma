const Authenticator = require("../models/Authenticator");

exports.saveTotp = async (req, res) => {
    const userId = req.user?._id;
    const { serviceIcon, serviceName, secret, accountName, authId } = req.body;

    // Do error handling
    if (!serviceIcon || !serviceName || !accountName || (!secret && !userId)) {
        return res.status(400).json({
            error: true,
            message: "Service Icon, Service Name, Account Name are required. Secret is required if userId is not present."
        });
    }

    try {
        let authenticator;

        if (authId) {
            // If authId is provided, update the existing authenticator
            authenticator = await Authenticator.findOne({ _id: authId, userId });

            if (!authenticator) {
                return res.status(404).json({
                    error: true,
                    message: "Authenticator not found."
                });
            }

            authenticator.serviceIcon = serviceIcon;
            authenticator.serviceName = serviceName;
            //authenticator.secretKey = secret; No need to update the secretKey
            authenticator.accountName = accountName;

            await authenticator.save();
            return res.status(200).json({
                error: false,
                message: "Authenticator updated successfully.",
                data: authenticator,
            });
        } else {
            // Check if the same secretKey exists for the same userId
            authenticator = await Authenticator.findOne({ userId, secretKey: secret });

            if (authenticator) {
                return res.status(400).json({
                    error: true,
                    message: "Authenticator with this secret already exists."
                });
            }

            // If authId is not provided, create a new authenticator
            authenticator = new Authenticator({
                userId,
                serviceIcon,
                serviceName,
                secretKey: secret,
                accountName,
            });

            await authenticator.save();
            return res.status(200).json({
                error: false,
                message: "Authenticator added successfully.",
                data: authenticator,
            });
        }
    } catch (err) {
        console.error('Error creating/updating Authenticator:', err);
        return res.status(500).json({
            error: true,
            message: "Cannot add or update authenticator.",
        });
    }
};

exports.listTotp = async (req, res) => {
    const userId = req.user._id;

    try {
        const items = await Authenticator.find({ userId }).sort({ sortOrder: 1 });

        return res.status(200).json({
            error: false,
            message: { items }
        });
    } catch (err) {
        return res.status(400).json({
            error: true,
            message: "Error fetching devices."
        });
    }
}

exports.deleteTotp = async (req, res) => {
    const userId = req.user._id;
    const authId = req.params.authId;

    // Return error if authId is not provided
    if (!authId) {
        return res.status(400).json({
            error: true,
            message: "Auth ID is required"
        });
    }

    try {
        const result = await Authenticator.deleteOne({
            _id: authId,
            userId
        });

        if (result.deletedCount === 0) {
            return res.status(400).json({
                error: true,
                message: "Totp not found"
            });
        }

        return res.status(200).json({
            error: false,
            message: "Totp deleted"
        });
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: "Error deleting totp"
        });
    }
}

exports.totpDetails = async (req, res) => {
    const userId = req.user._id;
    const authId = req.params.authId || null;

    try {
        let totpData = null;

        if (authId) {
            totpData = await Authenticator.findOne({
                _id: authId,
                userId
            });

            if (totpData) {
                totpData.secretKey = "************************";
            }
            
        }

        return res.status(200).json({
            error: false,
            message: totpData
        });
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: "Error fetching totp details."
        });
    }
}

exports.reorderTotp = async (req, res) => {
    const userId = req.user._id;
    const items = req.body.items;

    try {
        const bulkOps = items.map((itemId, index) => ({
            updateOne: {
                filter: { _id: itemId, userId },
                update: { sortOrder: index }
            }
        }));

        await Authenticator.bulkWrite(bulkOps);

        return res.status(200).json({
            error: false,
            message: "Items reordered successfully"
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Error reordering items"
        });
    }
}
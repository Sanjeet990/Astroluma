const { Authenticator } = require("../models");

exports.saveTotp = async (req, res) => {
    const userId = req.user?.id;
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
            authenticator = await Authenticator.findOne({
                where: { id: authId, userId }
            });

            if (!authenticator) {
                return res.status(404).json({
                    error: true,
                    message: "Authenticator not found."
                });
            }

            // Update the authenticator
            await authenticator.update({
                serviceIcon,
                serviceName,
                accountName
            });

            return res.status(200).json({
                error: false,
                message: "Authenticator updated successfully.",
                data: authenticator,
            });
        } else {
            // Check if the same secretKey exists for the same userId
            authenticator = await Authenticator.findOne({ 
                where: { userId, secretKey: secret }
            });

            if (authenticator) {
                return res.status(400).json({
                    error: true,
                    message: "Authenticator with this secret already exists."
                });
            }

            // If authId is not provided, create a new authenticator
            authenticator = await Authenticator.create({
                userId,
                serviceIcon,
                serviceName,
                secretKey: secret,
                accountName,
                sortOrder: 9999
            });

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
    const userId = req.user.id;

    try {
        const items = await Authenticator.findAll({
            where: { userId },
            order: [['sortOrder', 'ASC']]
        });

        return res.status(200).json({
            error: false,
            message: { items }
        });
    } catch (err) {
        console.error('Error listing authenticators:', err);
        return res.status(400).json({
            error: true,
            message: "Error fetching devices."
        });
    }
}

exports.deleteTotp = async (req, res) => {
    const userId = req.user.id;
    const authId = req.params.authId;

    // Return error if authId is not provided
    if (!authId) {
        return res.status(400).json({
            error: true,
            message: "Auth ID is required"
        });
    }

    try {
        const rowsDeleted = await Authenticator.destroy({
            where: {
                id: authId,
                userId
            }
        });

        if (rowsDeleted === 0) {
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
        console.error('Error deleting authenticator:', err);
        return res.status(500).json({
            error: true,
            message: "Error deleting totp"
        });
    }
}

exports.totpDetails = async (req, res) => {
    const userId = req.user.id;
    const authId = req.params.authId || null;

    try {
        let totpData = null;

        if (authId) {
            totpData = await Authenticator.findOne({
                where: {
                    id: authId,
                    userId
                }
            });

            if (totpData) {
                // Mask the secret key for security
                totpData.secretKey = "************************";
            }
        }

        return res.status(200).json({
            error: false,
            message: totpData
        });
    } catch (err) {
        console.error('Error fetching authenticator details:', err);
        return res.status(500).json({
            error: true,
            message: "Error fetching totp details."
        });
    }
}

exports.reorderTotp = async (req, res) => {
    const userId = req.user.id;
    const items = req.body.items;

    try {
        // Using Sequelize transaction to ensure all updates succeed or fail together
        await Authenticator.sequelize.transaction(async (transaction) => {
            // Process each item in the array
            for (let i = 0; i < items.length; i++) {
                await Authenticator.update(
                    { sortOrder: i },
                    { 
                        where: { 
                            id: items[i], 
                            userId 
                        },
                        transaction
                    }
                );
            }
        });

        return res.status(200).json({
            error: false,
            message: "Items reordered successfully"
        });
    } catch (error) {
        console.error('Error reordering authenticators:', error);
        return res.status(400).json({
            error: true,
            message: "Error reordering items"
        });
    }
}
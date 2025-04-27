const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

exports.verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    const token = authHeader?.split(' ')[1];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: true,
            message: 'Unauthorized: Missing or invalid token format',
        });
    }

    if (!token) {
        return res.status(401).json({
            error: true,
            message: 'Unauthorized: Missing token',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET || "SomeRandomStringSecret");

        // Find user by username (case insensitive) using Sequelize
        const user = await User.findOne({
            where: {
                username: {
                    [Op.like]: decoded.username
                }
            }
        });

        if (user) {
            // User found, attach to request
            req.user = user;

            // Proceed to the next middleware or endpoint
            next();
        } else {
            return res.status(401).json({
                error: true,
                message: 'Unauthorized: User not found',
            });
        }
    } catch (err) {
        return res.status(401).json({
            error: true,
            message: 'Unauthorized: Invalid token',
        });
    }
};

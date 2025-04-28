const md5 = require('md5');
const { User } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Save or update user account
exports.saveAccount = async (req, res) => {
    const loggedinuser = req.user;

    let userId = req.body.userId;

    if (loggedinuser.isSuperAdmin === false) {
        userId = loggedinuser.id;
    }

    const { fullName, username, password, siteName } = req.body;

    if (!fullName || !username || !siteName) {
        return res.status(400).json({
            error: true,
            message: "All fields are required."
        });
    }

    if (!userId && (!password || password.length < 6)) {
        return res.status(400).json({
            error: true,
            message: "Password is required and must be at least 6 characters long."
        });
    }

    try {
        if (!userId) {
            // Check if username exists - using LOWER() for case-insensitive comparison in SQLite
            const existingUser = await User.findOne({ 
                where: 
                    Sequelize.where(
                        Sequelize.fn('LOWER', Sequelize.col('username')), 
                        Sequelize.fn('LOWER', username)
                    )
            });

            if (existingUser) {
                return res.status(400).json({
                    error: true,
                    message: "Username already exists."
                });
            }

            // Create a new user
            await User.create({
                fullName,
                username: username.toLowerCase(),
                password: md5(password),
                siteName,
                colorTheme: "dark",
                authenticator: false,
                camerafeed: false,
                networkdevices: false,
                profilePicture: "Default",
                isSuperAdmin: false
            });

            return res.status(200).json({
                error: false,
                message: "User created successfully."
            });
        } else {
            // Update existing user
            const updatedRows = await User.update(
                { 
                    fullName, 
                    username: username.toLowerCase(), 
                    siteName 
                },
                { 
                    where: { id: userId }
                }
            );

            if (updatedRows[0] === 0) {
                return res.status(400).json({
                    error: true,
                    message: "User not found or no changes made."
                });
            }

            return res.status(200).json({
                error: false,
                message: "User updated successfully."
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: true,
            message: "Error in adding or updating user."
        });
    }
};

// List all users
exports.userList = async (req, res) => {
    const loggedinuser = req.user;

    if (loggedinuser?.isSuperAdmin === false) {
        return res.status(400).json({
            error: true,
            message: "You are not authorized to view users."
        });
    }

    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        
        return res.status(200).json({
            error: false,
            message: users
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: true,
            message: "Error in retrieving users."
        });
    }
};

exports.updateAvatar = async (req, res) => {
    const loggedinuser = req.user;

    if (!loggedinuser.isSuperAdmin) {
        return res.status(400).json({
            error: true,
            message: "You are not authorized to change passwords."
        });
    }

    const userId = req.params.userId;
    const { avatar } = req.body;

    if (!avatar) {
        return res.status(400).json({
            error: true,
            message: "Avatar is not supplied."
        });
    }

    try {
        const updatedRows = await User.update(
            { userAvatar: avatar },
            { where: { id: userId } }
        );

        return res.status(200).json({
            error: false,
            message: "Avatar changed successfully."
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Error in changing avatar."
        });
    }
}

exports.updateOwnAvatar = async (req, res) => {
    const loggedinuser = req.user;

    const userId = loggedinuser?.id;
    const { avatar } = req.body;

    if (!avatar) {
        return res.status(400).json({
            error: true,
            message: "Avatar is not supplied."
        });
    }

    try {
        await User.update(
            { userAvatar: avatar },
            { where: { id: userId } }
        );

        return res.status(200).json({
            error: false,
            message: "Avatar changed successfully."
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Error in changing avatar."
        });
    }
}

exports.doDebrand = async (req, res) => {
    const loggedinuser = req.user;

    const userId = loggedinuser?.id;
    
    try {
        await User.update(
            { hideBranding: true },
            { where: { id: userId } }
        );

        return res.status(200).json({
            error: false,
            message: "Astroluma branding removed successfully."
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Error in removing Astroluma branding."
        });
    }
}

exports.doRebrand = async (req, res) => {
    const loggedinuser = req.user;

    const userId = loggedinuser?.id;
    
    try {
        await User.update(
            { hideBranding: false },
            { where: { id: userId } }
        );

        return res.status(200).json({
            error: false,
            message: "Astroluma branding applied successfully."
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Error in applying Astroluma branding."
        });
    }
}

// Get information of a specific user
exports.accountInfo = async (req, res) => {
    const loggedinuser = req.user;

    let userId = req.params.userId;

    if (loggedinuser.isSuperAdmin === false) {
        userId = loggedinuser.id;
    }

    try {
        const user = await User.findOne({ 
            where: { id: userId },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(400).json({
                error: true,
                message: "User not found."
            });
        }

        return res.status(200).json({
            error: false,
            message: user
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Error in retrieving user information."
        });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    const loggedinuser = req.user;

    if (!loggedinuser.isSuperAdmin) {
        return res.status(400).json({
            error: true,
            message: "You are not authorized to delete users."
        });
    }

    const userId = req.params.userId;

    try {
        const deletedRows = await User.destroy({
            where: {
                id: userId,
                isSuperAdmin: false
            }
        });

        if (deletedRows === 0) {
            return res.status(400).json({
                error: true,
                message: "User not found or is a super admin."
            });
        }

        return res.status(200).json({
            error: false,
            message: "User deleted successfully."
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Error in deleting user."
        });
    }
};

// Change user password
exports.changePassword = async (req, res) => {
    const loggedinuser = req.user;

    const userId = req.params.userId;
    const { password } = req.body;

    if (!loggedinuser.isSuperAdmin) {
        if (loggedinuser.id !== parseInt(userId)) {
            return res.status(400).json({
                error: true,
                message: "You are not authorized to change passwords."
            });
        }
    }

    if (!password || password.length < 6) {
        return res.status(400).json({
            error: true,
            message: "Password is required and must be at least 6 characters long."
        });
    }

    try {
        await User.update(
            { password: md5(password) },
            { where: { id: userId } }
        );

        return res.status(200).json({
            error: false,
            message: "Password changed successfully."
        });
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Error in changing password."
        });
    }
};

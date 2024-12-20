const md5 = require('md5');
const User = require('../models/User');

// Save or update user account
exports.saveAccount = async (req, res) => {
    const loggedinuser = req.user;

    if (loggedinuser.isSuperAdmin === false) {
        return res.status(400).json({
            error: true,
            message: "You are not authorized to add users."
        });
    }

    const { userId, fullName, username, password, siteName } = req.body;

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
            // Check if username exists
            const existingUser = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });

            if (existingUser) {
                return res.status(400).json({
                    error: true,
                    message: "Username already exists."
                });
            }

            // Create a new user
            const newUser = new User({
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
            await newUser.save();

            return res.status(200).json({
                error: false,
                message: "User created successfully."
            });
        } else {
            // Update existing user
            const result = await User.updateOne(
                { _id: userId },
                { $set: { fullName, username: username.toLowerCase(), siteName } }
            );

            if (result.nModified === 0) {
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
        const users = await User.find({}, { password: 0 }); // Exclude password field
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

// Get information of a specific user
exports.accountInfo = async (req, res) => {
    const loggedinuser = req.user;

    if (loggedinuser.isSuperAdmin === false) {
        return res.status(400).json({
            error: true,
            message: "You are not authorized to view user information."
        });
    }

    const userId = req.params.userId;

    try {
        const user = await User.findOne({ _id: userId }, { password: 0 }); // Exclude password field

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
        const result = await User.deleteOne({
            _id: userId,
            isSuperAdmin: false
        });

        if (result.deletedCount === 0) {
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

    if (!loggedinuser.isSuperAdmin) {
        return res.status(400).json({
            error: true,
            message: "You are not authorized to change passwords."
        });
    }

    const userId = req.params.userId;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({
            error: true,
            message: "Password is required and must be at least 6 characters long."
        });
    }

    try {
        await User.updateOne(
            { _id: userId },
            { $set: { password: md5(password) } }
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

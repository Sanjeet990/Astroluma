const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.doLogin = async (req, res) => {
    let error = "";

    const username = req?.body?.username?.toLowerCase();
    const password = req?.body?.password;

    if (!username || !password) {
        error = "Username and/or password must not be empty.";
    }

    if (!error) {
        try {
            // Find the user by username
            const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });

            if (user) {
                // Check if the password matches
                if (password === user.password) {
                    const payload = {
                        userId: user._id, // Use user._id for user ID
                        username: user.username,
                        role: user.isSuperAdmin ? 'admin' : 'user',
                    };

                    // Create the JWT token
                    const token = jwt.sign(payload, process.env.SECRET || "SomeRandomStringSecret", {});

                    return res.status(200).json({
                        error: false,
                        message: {
                            token,
                            role: user.isSuperAdmin ? 'admin' : 'user',
                            fullName: user.fullName,
                            colorTheme: user.colorTheme || "light",
                            avatar: user.profilePicture
                        }
                    });
                }
            }
            error = "Invalid username and/or password";
        } catch (err) {
            error = "An error occurred during authentication";
        }
    }

    return res.status(400).json({
        error: true,
        message: error
    });
}
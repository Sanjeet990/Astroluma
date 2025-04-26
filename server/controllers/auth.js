const jwt = require('jsonwebtoken');
const User = require('../models/User');
const GlobalSetting = require('../models/GlobalSetting');
const axios = require('axios');
const murmurhash = require('murmurhash');


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

exports.authMethods = async (req, res) => {
    //fetch oidc settings
    let globalSettings = await GlobalSetting.findOne({});


    return res.status(200).json({
        error: false,
        message: {
            oidc: {
                enabled: globalSettings?.oidcEnabled || false,
                config: {
                    authorizationEndpoint: globalSettings?.oidcConfig?.authorizationEndpoint,
                    clientId: globalSettings?.oidcConfig?.clientId,
                    redirectUri: globalSettings?.oidcConfig?.redirectUri,
                    scope: globalSettings?.oidcConfig?.scope
                }
            }
        }
    });
}

exports.validateOIDCCode = async (req, res) => {
    const code = req?.body?.code;

    let error = "";

    if (!code) {
        error = "Code must not be empty.";
    }

    //find the global settings
    let globalSettings = await GlobalSetting.findOne({});
    if (!globalSettings?.oidcConfig) {
        error = "OIDC settings not found.";
    }

    const oidcConfig = globalSettings?.oidcConfig;

    const decodedSecret = oidcConfig.clientSecret;

    if (!error) {
        const tokenResponse = await axios.post(
            oidcConfig?.tokenEndpoint,
            new URLSearchParams({
                client_id: oidcConfig?.clientId,
                client_secret: decodedSecret,
                redirect_uri: oidcConfig?.redirectUri,
                grant_type: "authorization_code",
                code: code,
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        console.log(tokenResponse.data, oidcConfig?.userinfoEndpoint);

        const { access_token } = tokenResponse.data;

        const userResponse = await axios.get(oidcConfig?.userinfoEndpoint, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const user = userResponse.data;
        
        const userIdentifier = user[oidcConfig?.userIdentifier];

        const username = userIdentifier;

        //Search if this exists in the users collection
        const userData = await User
            .findOne({ username: username });

        if (userData) {
            //First update the logout URL
            userData.logoutUrl = oidcConfig?.logoutUri;

            userData.save();

            const payload = {
                userId: userData._id, // Use user._id for user ID
                username: userData.username,
                role: userData.isSuperAdmin ? 'admin' : 'user',
            };

            // Create the JWT token
            const token = jwt.sign(payload, process.env.SECRET || "SomeRandomStringSecret", {});

            return res.status(200).json({
                error: false,
                message: {
                    token,
                    role: userData.isSuperAdmin ? 'admin' : 'user',
                    fullName: userData.fullName,
                    colorTheme: userData.colorTheme || "light",
                    avatar: userData.profilePicture
                }
            });

        } else {
            if (oidcConfig?.autoProvisioning) {
                //create a new user
                const newUser = new User({
                    username: username,
                    fullName: user.name,
                    siteName: "Astroluma",
                    isSuperAdmin: false,
                    colorTheme: "dark",
                    profilePicture: user?.picture || "Astroluma",
                    authenticator: false,
                    camerafeed: false,
                    networkdevices: false,
                    provider: "oidc",
                    logoutUrl: oidcConfig?.logoutUri,
                });

                await newUser.save();

                const payload = {
                    userId: newUser._id, // Use user._id for user ID
                    username: newUser.username,
                    role: newUser.isSuperAdmin ? 'admin' : 'user',
                };

                // Create the JWT token
                const token = jwt.sign(payload, process.env.SECRET || "SomeRandomStringSecret", {});

                return res.status(200).json({
                    error: false,
                    message: {
                        token,
                        role: newUser.isSuperAdmin ? 'admin' : 'user',
                        fullName: newUser.fullName,
                        colorTheme: newUser.colorTheme || "light",
                        avatar: newUser.profilePicture
                    }
                });
            } else {
                return res.status(400).json({
                    error: true,
                    message: "User not found and automatic user provisioning is not enabled."
                });
            }
        }

    } else {
        return res.status(400).json({
            error: true,
            message: error
        });
    }
}
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { Op } = require('sequelize');
const { User, GlobalSetting } = require('../models');

// Login handler
exports.doLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                error: true,
                message: "Username and password must be provided."
            });
        }

        // Find user
        const userData = await User.findOne({
            where: {
                username: username.toLowerCase()
            }
        });

        // Verify credentials
        if (userData && userData.password === password) {
            const payload = {
                userId: userData.id,
                username: userData.username,
                fullName: userData.fullName,
                isSuperAdmin: userData.isSuperAdmin,
            };

            const token = jwt.sign(payload, process.env.SECRET || "SomeRandomStringSecret", {});

            return res.status(200).json({
                error: false,
                message: {
                    token,
                    role: userData.isSuperAdmin ? 'admin' : 'user',
                    fullName: userData.fullName,
                    colorTheme: userData.colorTheme || "light",
                    avatar: userData.userAvatar
                }
            });
        }

        return res.status(401).json({
            error: true,
            message: "Invalid credentials."
        });
    }
    catch (error) {
        return res.status(400).json({
            error: true,
            message: "Login failed."
        });
    }
};

// Get available authentication methods
exports.authMethods = async (req, res) => {
    const globalSettings = await GlobalSetting.findOne();

    return res.status(200).json({
        error: false,
        message: {
            oidc: globalSettings?.oidcEnabled ? {
                enabled: true,
                clientId: globalSettings?.oidcConfig?.clientId,
                redirectUri: globalSettings?.oidcConfig?.redirectUri,
                scope: globalSettings?.oidcConfig?.scope
            } : {
                enabled: false
            }
        }
    });
};

exports.validateOIDCCode = async (req, res) => {
    const code = req?.body?.code;

    let error = "";

    if (!code) {
        error = "Code must not be empty.";
    }

    // Find the global settings
    let globalSettings = await GlobalSetting.findOne();
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
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        if (tokenResponse?.status !== 200 || !tokenResponse?.data?.access_token) {
            return res.status(400).json({
                error: true,
                message: "Cannot get valid token."
            });
        }

        try {
            const tokenData = tokenResponse?.data;
            const idToken = tokenData?.id_token;

            // Get userinfo
            const userinfo = await axios.get(oidcConfig?.userinfoEndpoint, {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`
                }
            });

            if (userinfo?.status !== 200) {
                return res.status(400).json({
                    error: true,
                    message: "Cannot get userinfo."
                });
            }

            const user = userinfo?.data;
            const username = user[oidcConfig?.userIdentifier];

            let userData = await User.findOne({
                where: {
                    username: { [Op.iLike]: username },
                    provider: "oidc"
                }
            });

            if (userData) {
                const payload = {
                    userId: userData.id,
                    username: userData.username,
                    fullName: userData.fullName,
                    isSuperAdmin: userData.isSuperAdmin,
                };

                const token = jwt.sign(payload, process.env.SECRET || "SomeRandomStringSecret", {});

                return res.status(200).json({
                    error: false,
                    message: {
                        token,
                        role: userData.isSuperAdmin ? 'admin' : 'user',
                        fullName: userData.fullName,
                        colorTheme: userData.colorTheme || "light",
                        avatar: userData.userAvatar
                    }
                });
            } else {
                if (oidcConfig?.autoProvisioning) {
                    // Create a new user
                    const newUser = await User.create({
                        username: username,
                        fullName: user.name,
                        siteName: "Astroluma",
                        isSuperAdmin: false,
                        colorTheme: "dark",
                        userAvatar: user?.picture ? {
                            iconUrl: user?.picture,
                            iconUrlLight: null,
                            iconProvider: 'external'
                        } : {
                            iconUrl: "Astroluma",
                            iconUrlLight: null,
                            iconProvider: 'com.astroluma.self'
                        },
                        authenticator: false,
                        camerafeed: false,
                        networkdevices: false,
                        provider: "oidc",
                        logoutUrl: oidcConfig?.logoutUri,
                    });

                    const payload = {
                        userId: newUser.id,
                        username: newUser.username,
                        fullName: newUser.fullName,
                        isSuperAdmin: newUser.isSuperAdmin,
                    };

                    const token = jwt.sign(payload, process.env.SECRET || "SomeRandomStringSecret", {});

                    return res.status(200).json({
                        error: false,
                        message: {
                            token,
                            role: newUser.isSuperAdmin ? 'admin' : 'user',
                            fullName: newUser.fullName,
                            colorTheme: newUser.colorTheme || "light",
                            avatar: newUser.userAvatar
                        }
                    });
                } else {
                    return res.status(400).json({
                        error: true,
                        message: "User not exists. And auto provisioning is disabled."
                    });
                }
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                error: true,
                message: "Cannot validate token."
            });
        }
    } else {
        return res.status(400).json({
            error: true,
            message: error
        });
    }
};
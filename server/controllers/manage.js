const { Authenticator, User, GlobalSetting, Listing, IconPack, App, Icon, NetworkDevice, Page, Snippet, Todo, sequelize } = require('../models');
const axios = require('axios');
const { isHostMode } = require('../utils/apiutils');
const { Op } = require('sequelize');
const fs = require('fs');
const CryptoJS = require('crypto-js');
const { Json } = require('sequelize/lib/utils');

// Method to fetch and return dashboard data for the authenticated user
/**
 * Retrieves the user's dashboard data including authenticators, sidebar items, and homepage items.
 * 
 * This function fetches the necessary data concurrently using Promise.all and sends a structured
 * response containing the data for the dashboard.
 * 
 * @param {Object} req - The request object, expected to contain the authenticated user info.
 * @param {Object} res - The response object to send status and messages.
 */
exports.dashboard = async (req, res) => {
    const userData = req.user; // Extract the authenticated user's data
    const userId = userData?.id; // Extract the user ID from the user data

    try {
        // Fetch authenticators, sidebar items, and homepage items concurrently
        const [authenticators, sidebarItems, homepageItems, iconPacks] = await Promise.all([
            Authenticator.findAll({ where: { userId }, order: [['sortOrder', 'ASC']] }), // Fetch authenticators sorted by sortOrder
            Listing.findAll({ where: { userId, inSidebar: true }, order: [['listingName', 'ASC']] }), // Sidebar items sorted by listingName
            Listing.findAll({ where: { userId, parentId: null }, order: [['listingName', 'ASC']] }), // Homepage items sorted by listingName
            IconPack.findAll({ where: { [Op.or]: [{ userId: userId }, { userId: null }] } }) // Icon packs of the user
        ]);

        userData.password = undefined; // Remove the password from the user data

        // Add a default "Home" item to the sidebar
        sidebarItems.unshift({
            id: null,
            listingName: "Featured",
            listingIcon: "<FaHome />", // Assuming FaHome is a React component, consider handling this differently in the frontend
            listingType: "link",
            listingUrl: "/"
        });

        // Prepare the response object to be sent to the client
        const toRespond = {
            authenticators,
            userData,
            sidebarItems,
            homepageItems,
            iconPacks,
            isHostMode: isHostMode()
        };

        // Send the response with status 200
        return res.status(200).json({
            error: false,
            message: toRespond // The data to be sent in the response
        });
    } catch (err) {
        // Handle any errors that occur during the fetch operations
        console.error("Error fetching dashboard data: ", err); // Log the error for debugging purposes
        return res.status(500).json({
            error: true,
            message: "An error occurred while fetching dashboard data. Please try again later."
        });
    }
};

/**
 * Fetches weather data based on user location and preferences.
 * 
 * @param {Object} req - Express request object containing user data.
 * @param {Object} res - Express response object to send the results.
 */
exports.weatherData = async (req, res) => {
    // Extract user information
    const { latitude, longitude, unit, location } = req.user || {};

    // Validate required parameters
    if (!latitude || !longitude) {
        return res.status(400).json({
            error: true,
            message: "Latitude and longitude are required."
        });
    }

    // Construct API parameters
    const params = {
        latitude,
        longitude,
        current_weather: true,
        temperature_unit: unit === "metric" ? 'celsius' : 'fahrenheit',
        windspeed_unit: 'kmh',
        precipitation_unit: 'mm'
    };

    // Mapping weather codes to descriptions
    const weatherCodeToDescription = {
        0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain', 71: 'Slight snowfall', 73: 'Moderate snowfall', 75: 'Heavy snowfall', 77: 'Snow grains',
        80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers', 85: 'Slight snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Violent thunderstorm', 99: 'Heavy hail'
    };

    try {
        // Fetch weather data
        const [weatherResponse] = await Promise.all([
            axios.get("https://api.open-meteo.com/v1/forecast", { params })
        ]);

        const currentWeather = weatherResponse.data.current_weather;
        if (!currentWeather) {
            return res.status(500).json({
                error: true,
                message: "Unable to fetch current weather data."
            });
        }

        // Extract required data
        const {
            temperature,
            windspeed: windSpeed,
            weathercode: weatherCode
        } = currentWeather;

        // Prepare response object
        const weatherDescription = weatherCodeToDescription[weatherCode] || 'Unknown weather';
        const temperatureData = {
            temperature,
            windSpeed,
            weatherCode,
            weatherDescription,
            location,
            unit: unit === "metric" ? "°C" : "°F"
        };

        // Return success response
        return res.status(200).json({
            error: false,
            message: temperatureData
        });
    } catch (err) {
        console.error("Error fetching weather data:", err.message);

        // Return error response
        return res.status(500).json({
            error: true,
            message: "Error fetching weather data. Please try again later."
        });
    }
};

/**
 * Saves user settings in the database.
 * 
 * @param {Object} req - The HTTP request object, containing user and settings data.
 * @param {Object} res - The HTTP response object used to send the response.
 */
exports.saveSettings = async (req, res) => {
    // Extract user ID from the request object.
    const userId = req.user?.id;

    // Extract settings fields from the request body.
    const { siteName, siteLogo, authenticator, camerafeed, networkdevices, todolist, snippetmanager, linksalwaysnewtab, foldersalwaysnewtab } = req.body;

    // Validate that the user ID exists.
    if (!userId) {
        return res.status(401).json({
            error: true,
            message: "Unauthorized: User ID is missing."
        });
    }

    // Validate that the siteName field is provided.
    if (!siteName) {
        return res.status(400).json({
            error: true,
            message: "Site Name is required."
        });
    }

    try {
        // Update user settings in the database.
        const [updatedRows] = await User.update(
            {
                siteName,
                siteLogo,
                authenticator,
                camerafeed,
                networkdevices: networkdevices && isHostMode(),
                todolist,
                snippetmanager,
                linksalwaysnewtab,
                foldersalwaysnewtab
            },
            { where: { id: userId } }
        );

        // Return a success response.
        return res.status(200).json({
            error: false,
            message: "Settings saved successfully."
        });
    } catch (err) {
        // Log the error for debugging purposes.
        console.error("Error saving settings:", err);

        // Return a server error response.
        return res.status(500).json({
            error: true,
            message: "Cannot save settings. Please try again later."
        });
    }
};


/**
 * Saves the theme settings for a user.
 * 
 * This function updates the user's selected color theme in the database.
 * If the theme selection is missing or invalid, it returns a 400 error.
 * If the update fails, a 500 error is returned.
 * 
 * @param {Object} req - The request object, expected to contain user info and the colorTheme in the body.
 * @param {Object} res - The response object to send status and messages.
 */
exports.saveThemeSettings = async (req, res) => {
    const userId = req.user?.id; // Extract the user ID from the authenticated request
    const { colorTheme } = req.body; // Extract the color theme from the request body

    // Check if the colorTheme is provided in the request
    if (!colorTheme) {
        return res.status(400).json({
            error: true,
            message: "Theme selection is required." // Return error if theme is not provided
        });
    }

    try {
        // Update the user's color theme in the database using Sequelize
        const [updatedCount] = await User.update(
            { colorTheme },
            { where: { id: userId } }
        );

        // Check if any record was actually updated
        if (updatedCount === 0) {
            return res.status(400).json({
                error: true,
                message: "No changes made to theme settings." // No update if no record was modified
            });
        }

        // Return a success response if the update was successful
        return res.status(200).json({
            error: false,
            message: "Theme settings saved successfully." // Success message on successful update
        });

    } catch (err) {
        // Handle any errors during the update operation
        console.error("Error updating theme settings:", err);
        return res.status(500).json({
            error: true,
            message: "An error occurred while saving the theme settings." // General error message
        });
    }
};

/**
 * Saves the weather settings for a user.
 * 
 * This function updates the user's preferred location and unit of measurement for weather information.
 * It checks for the required fields in the request body and validates the data before performing the update.
 * 
 * @param {Object} req - The request object, expected to contain user info and the weather settings in the body.
 * @param {Object} res - The response object to send status and messages.
 */
exports.saveWeatherSettings = async (req, res) => {
    const userId = req.user?.id; // Extract the user ID from the authenticated request
    const { location, unit } = req.body; // Extract the location and unit from the request body

    // Check if the required fields are provided
    if (!location?.location || !location?.latitude || !location?.longitude || !unit) {
        return res.status(400).json({
            error: true,
            message: "Location and unit are required." // Missing fields error message
        });
    }

    // Validate that the unit is either 'Celsius' or 'Fahrenheit'
    const validUnits = ['metric', 'imperial'];
    if (!validUnits.includes(unit)) {
        return res.status(400).json({
            error: true,
            message: "Unit must be either 'Metric' or 'Imperial'." // Invalid unit error message
        });
    }

    try {
        // Update the user's weather settings in the database using Sequelize
        const [updatedCount] = await User.update(
            {
                location: location?.location,
                longitude: location?.longitude,
                latitude: location?.latitude,
                unit
            },
            { where: { id: userId } }
        );

        // Check if any record was actually updated
        if (updatedCount === 0) {
            return res.status(400).json({
                error: true,
                message: "No changes made to weather settings." // Specific message when no changes are made
            });
        }

        // Return a success response if the update was successful
        return res.status(200).json({
            error: false,
            message: "Weather settings saved successfully." // Success message on successful update
        });

    } catch (err) {
        console.error("Error updating weather settings:", err);
        // Handle any errors during the update operation
        return res.status(500).json({
            error: true,
            message: "An error occurred while saving the weather settings." // General error message
        });
    }
};

/**
 * Retrieves the user settings.
 * 
 * This function fetches the user's site settings, such as site name, authenticator, camera feed, and network devices.
 * It returns a success response with these settings if found or an error if something goes wrong.
 * 
 * @param {Object} req - The request object, expected to contain the authenticated user info.
 * @param {Object} res - The response object to send status and messages.
 */
exports.getSetting = async (req, res) => {
    const userId = req.user?.id; // Extract user ID from the authenticated request

    // Ensure the user ID exists
    if (!userId) {
        return res.status(400).json({
            error: true,
            message: "User is not authenticated." // Return error if user ID is missing
        });
    }

    try {
        // Fetch the user's settings from the database
        const user = await User.findByPk(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "User settings not found." // Return error if no user is found
            });
        }

        // Return the user's settings in the response
        return res.status(200).json({
            error: false,
            message: {
                siteName: user.siteName,
                authenticator: user.authenticator,
                camerafeed: user.camerafeed,
                networkdevices: user.networkdevices,
                todolist: user.todolist,
                snippetmanager: user.snippetmanager,
                siteLogo: user.siteLogo,
                linksalwaysnewtab: user.linksalwaysnewtab || false,
                foldersalwaysnewtab: user.foldersalwaysnewtab || false
            }
        });
    } catch (err) {
        console.error("Error fetching user settings:", err);
        // Handle any unexpected errors during the database operation
        return res.status(500).json({
            error: true,
            message: "An error occurred while fetching user settings." // General error message
        });
    }
};


exports.oidcSettings = async (req, res) => {
    const user = req.user;

    // If the user is not admin
    if (!user?.isSuperAdmin) {
        return res.status(401).json({
            error: true,
            message: "Unauthorized: Admin access required."
        });
    }

    const { issuerUrl, clientId, clientSecret, redirectUri, scope, authorizationEndpoint, tokenEndpoint, userinfoEndpoint, jwksUri, logoutUri, autoUserProvisioning, userIdentifier, enableOidcAuth } = req.body;

    if (!issuerUrl || !clientId || !clientSecret || !redirectUri || !scope || !authorizationEndpoint || !tokenEndpoint || !userinfoEndpoint || !jwksUri || !logoutUri || !userIdentifier) {
        return res.status(400).json({
            error: true,
            message: "All fields are required."
        });
    }

    try {
        const oidcSettings = {
            issuerUrl,
            clientId,
            clientSecret,
            redirectUri,
            scope,
            authorizationEndpoint,
            tokenEndpoint,
            userinfoEndpoint,
            jwksUri,
            logoutUri,
            userIdentifier,
            autoProvisioning: autoUserProvisioning
        };

        // Find the global settings or create if not exists
        const [settings, created] = await GlobalSetting.findOrCreate({
            where: {},
            defaults: {
                oidcConfig: oidcSettings,
                oidcEnabled: enableOidcAuth
            }
        });

        if (!created) {
            // If settings already existed, update them
            await settings.update({
                oidcConfig: oidcSettings,
                oidcEnabled: enableOidcAuth
            });
        }

        return res.status(200).json({
            error: false,
            message: "OIDC settings saved successfully."
        });
    } catch (err) {
        console.error("Error saving OIDC settings:", err);
        return res.status(500).json({
            error: true,
            message: "An error occurred while saving OIDC settings."
        });
    }
};

exports.getOidcSettings = async (req, res) => {
    const user = req.user;

    // If the user is not admin
    if (!user?.isSuperAdmin) {
        return res.status(401).json({
            error: true,
            message: "Unauthorized: Admin access required."
        });
    }

    try {
        const settings = await GlobalSetting.findOne();

        let oidcConfig = null;
        if (settings?.oidcConfig) {
            const decryptedSecret = settings.oidcConfig.clientSecret;
            oidcConfig = {
                issuerUrl: settings.oidcConfig.issuerUrl,
                clientId: settings.oidcConfig.clientId,
                clientSecret: decryptedSecret ? decryptedSecret : "",
                redirectUri: settings.oidcConfig.redirectUri,
                scope: settings.oidcConfig.scope,
                authorizationEndpoint: settings.oidcConfig.authorizationEndpoint,
                tokenEndpoint: settings.oidcConfig.tokenEndpoint,
                userinfoEndpoint: settings.oidcConfig.userinfoEndpoint,
                jwksUri: settings.oidcConfig.jwksUri,
                logoutUri: settings.oidcConfig.logoutUri,
                autoUserProvisioning: settings.oidcConfig.autoProvisioning,
                userIdentifier: settings.oidcConfig.userIdentifier,
                enableOidcAuth: settings.oidcEnabled
            };
        } else {
            oidcConfig = {
                issuerUrl: "",
                clientId: "",
                clientSecret: "",
                redirectUri: "",
                scope: "",
                authorizationEndpoint: "",
                tokenEndpoint: "",
                userinfoEndpoint: "",
                jwksUri: "",
                logoutUri: "",
                autoUserProvisioning: false,
                userIdentifier: "",
                enableOidcAuth: false
            };
        }

        return res.status(200).json({
            error: false,
            message: oidcConfig
        });
    } catch (err) {
        console.error("Error fetching OIDC settings:", err);
        return res.status(500).json({
            error: true,
            message: "An error occurred while fetching OIDC settings."
        });
    }
};

/**
 * Imports migration data from a JSON file.
 * 
 * This function wipes existing data (except for default icon packs) and imports new data from a JSON file.
 * Only users with superadmin privileges can perform this action.
 * 
 * @param {Object} req - The request object containing the JSON file and user data
 * @param {Object} res - The response object to send the result
 */
exports.importMigration = async (req, res) => {
    try {
        const user = req.user;

        // Check if the user is a superadmin
        if (!user?.isSuperAdmin) {
            return res.status(401).json({
                error: true,
                message: "Unauthorized: Admin access required for importing migration data."
            });
        }

        // Check if file exists in the request
        if (!req.file) {
            return res.status(400).json({
                error: true,
                message: "No migration file uploaded."
            });
        }

        // Parse the JSON data from the uploaded file
        let migrationData;
        try {
            const fileContent = fs.readFileSync(req.file.path, 'utf8');
            migrationData = JSON.parse(fileContent);

            // Remove the temporary file
            fs.unlinkSync(req.file.path);
        } catch (parseError) {
            console.error("Error parsing migration file:", parseError);
            return res.status(400).json({
                error: true,
                message: "Invalid JSON file format. Could not parse the file."
            });
        }

        // Start a database transaction to ensure data consistency
        const transaction = await sequelize.transaction();

        try {
            // Wipe all data except the default icon pack
            await Promise.all([
                User.destroy({ where: {}, transaction }),
                App.destroy({ where: {}, transaction }),
                Authenticator.destroy({ where: {}, transaction }),
                GlobalSetting.destroy({ where: {}, transaction }),
                Icon.destroy({ where: {}, transaction }),
                // Only delete non-default icon packs
                IconPack.destroy({
                    where: {
                        iconProvider: {
                            [Op.ne]: 'com.astroluma.self'
                        }
                    },
                    transaction
                }),
                Listing.destroy({ where: {}, transaction }),
                NetworkDevice.destroy({ where: {}, transaction }),
                Page.destroy({ where: {}, transaction }),
                Snippet.destroy({ where: {}, transaction }),
                Todo.destroy({ where: {}, transaction })
            ]);

            // Import data in the order of dependencies
            console.log('Importing Users...');
            if (migrationData.Users && migrationData.Users.length > 0) {
                await User.bulkCreate(migrationData.Users, { transaction });
            }

            console.log('Importing Apps...');
            if (migrationData.Apps && migrationData.Apps.length > 0) {
                await App.bulkCreate(migrationData.Apps, { transaction });
            }

            console.log('Importing GlobalSettings...');
            if (migrationData.GlobalSettings && migrationData.GlobalSettings.length > 0) {
                await GlobalSetting.bulkCreate(migrationData.GlobalSettings, { transaction });
            }

            console.log('Importing IconPacks...');
            if (migrationData.IconPacks && migrationData.IconPacks.length > 0) {
                // Get all existing icon packs
                const existingIconPacks = await IconPack.findAll({
                    attributes: ['id', 'iconProvider'],
                    transaction
                });

                console.log(existingIconPacks);

                // Create a map of iconProvider -> id for quick lookup
                const existingIconProviderMap = {};
                existingIconPacks.forEach(pack => {
                    existingIconProviderMap[pack.iconProvider] = pack.id;
                });

                // Process each icon pack and handle conflicts
                for (const iconPack of migrationData.IconPacks) {
                    try {
                        // Skip any icon packs with the same provider as default one
                        if (iconPack.iconProvider === 'com.astroluma.self') {
                            console.log(`Skipping default icon pack: ${iconPack.iconProvider}`);
                            continue;
                        }

                        // Check if an icon pack with the same provider already exists
                        if (existingIconProviderMap[iconPack.iconProvider]) {
                            console.log(`Icon pack with provider ${iconPack.iconProvider} already exists, skipping`);
                            continue;
                        }

                        // Create each icon pack individually without specifying ID
                        // This lets the database assign a new ID automatically
                        const newIconPack = Object.assign({}, iconPack);
                        delete newIconPack.id; // Remove ID to let it auto-increment

                        await IconPack.create(newIconPack, { transaction });
                        console.log(`Created icon pack: ${iconPack.iconProvider}`);
                    } catch (err) {
                        console.error(`Error importing icon pack ${iconPack.iconProvider}:`, err);
                        // Continue with other icon packs even if one fails
                    }
                }
            }

            console.log('Importing Icons...');
            if (migrationData.Icons && migrationData.Icons.length > 0) {
                await Icon.bulkCreate(migrationData.Icons, { transaction });
            }

            console.log('Importing Listings...');
            if (migrationData.Listings && migrationData.Listings.length > 0) {
                // Initialize SECRET_KEY for decryption
                const SECRET_KEY = migrationData?.Secret;

                //First thing first, the integration field is a string, we need an object
                migrationData.Listings.forEach(listing => {
                    if (listing.integration) {
                        try {
                            const parsedValue = listing.integration;
                            listing.integration = parsedValue;

                            // Decrypt integration.config if it exists
                            if (parsedValue.config) {
                                try {
                                    const bytes = CryptoJS.AES.decrypt(parsedValue.config, SECRET_KEY);
                                    const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
                                    parsedValue.config = JSON.parse(decryptedValue);
                                } catch (error) {
                                    console.error('Error decrypting config:', error);
                                    //parsedValue.config = null;
                                }
                            }
                        } catch (e) {
                            console.error("Error parsing integration field:", e);
                        }
                    }
                });

                // First import listings without parent references
                const listingsWithoutParent = migrationData.Listings.filter(listing => !listing.parentId);
                await Listing.bulkCreate(listingsWithoutParent, { transaction });
                //console.log(listingsWithoutParent);

                // Then import listings with parent references
                const listingsWithParent = migrationData.Listings.filter(listing => listing.parentId);
                await Listing.bulkCreate(listingsWithParent, { transaction });
            }

            console.log('Importing NetworkDevices...');
            if (migrationData.NetworkDevices && migrationData.NetworkDevices.length > 0) {
                await NetworkDevice.bulkCreate(migrationData.NetworkDevices, { transaction });
            }

            console.log('Importing Pages...');
            if (migrationData.Pages && migrationData.Pages.length > 0) {
                await Page.bulkCreate(migrationData.Pages, { transaction });
            }

            console.log('Importing Authenticators...');
            if (migrationData.Authenticators && migrationData.Authenticators.length > 0) {
                await Authenticator.bulkCreate(migrationData.Authenticators, { transaction });
            } else {
                console.log('No Authenticators to import.');
            }

            console.log('Importing Snippets...');
            if (migrationData.Snippets && migrationData.Snippets.length > 0) {
                // Filter out snippets with null userId or assign a default userId
                const validSnippets = migrationData.Snippets.filter(snippet => {
                    // If userId is null, try to find the first user ID to assign
                    if (!snippet.userId) {
                        console.log(`Found snippet without userId: ${snippet.snippetTitle}`);

                        // If we have users, assign the first user's ID
                        if (migrationData.Users && migrationData.Users.length > 0) {
                            snippet.userId = migrationData.Users[0].id;
                            console.log(`Assigned userId ${snippet.userId} to snippet: ${snippet.snippetTitle}`);
                            return true;
                        } else {
                            console.log(`Skipping snippet without userId: ${snippet.snippetTitle}`);
                            return false; // Skip this snippet if no users are available
                        }

                    }
                    return true; // Keep snippets that already have a userId
                });

                if (validSnippets.length > 0) {
                    try {
                        await Snippet.bulkCreate(validSnippets, { transaction });
                        console.log(`Imported ${validSnippets.length} snippets successfully`);
                    } catch (snippetErr) {
                        console.error("Error importing snippets:", snippetErr);
                        console.log("Continuing with import process...");
                    }
                } else {
                    console.log('No valid snippets to import after filtering.');
                }
            }

            console.log('Importing Todos...');
            if (migrationData.Todos && migrationData.Todos.length > 0) {
                await Todo.bulkCreate(migrationData.Todos, { transaction });
            }

            // Commit transaction if all operations succeed
            await transaction.commit();

            console.log('Migration data import completed successfully!');
            return res.status(200).json({
                error: false,
                message: "Migration data imported successfully."
            });

        } catch (importError) {
            console.error("Error during data import:", importError);
            // Rollback transaction if any operation fails
            await transaction.rollback();

            console.error("Error during data import:", importError);
            return res.status(500).json({
                error: true,
                message: "Error importing migration data. Database has been rolled back to previous state."
            });
        }
    } catch (error) {
        console.error("Error handling migration import:", error);
        return res.status(500).json({
            error: true,
            message: "Server error during migration import."
        });
    }
};
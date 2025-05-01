const Authenticator = require('../models/Authenticator');
const User = require('../models/User');
const GlobalSetting = require('../models/GlobalSetting');
const App = require('../models/App');
const Icon = require('../models/Icon');
const Listing = require('../models/Listing');
const axios = require('axios');
const IconPack = require('../models/IconPack');
const { isHostMode } = require('../utils/apiutils');
const fs = require('fs').promises;
const path = require('path');
const zip = require('adm-zip')();

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
    const userId = userData?._id; // Extract the user ID from the user data

    try {
        // Fetch authenticators, sidebar items, and homepage items concurrently
        const [authenticators, sidebarItems, homepageItems, iconPacks] = await Promise.all([
            Authenticator.find({ userId }).sort({ sortOrder: 1 }), // Fetch authenticators sorted by sortOrder
            Listing.find({ userId, inSidebar: true }).sort({ listingName: 1 }), // Sidebar items sorted by listingName
            Listing.find({ userId, parentId: null }).sort({ listingName: 1 }), // Homepage items sorted by listingName
            IconPack.find({ $or: [{ userId: userId }, { userId: null }] }) // Icon packs of the user
        ]);

        userData.password = undefined; // Remove the password from the user data

        // Add a default "Home" item to the sidebar
        sidebarItems.unshift({
            _id: null,
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
    const userId = req.user?._id;

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
        await User.updateOne(
            { _id: userId },
            { siteName, siteLogo, authenticator, camerafeed, networkdevices: networkdevices && isHostMode(), todolist, snippetmanager, linksalwaysnewtab, foldersalwaysnewtab }
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
    const userId = req.user?._id; // Extract the user ID from the authenticated request
    const { colorTheme } = req.body; // Extract the color theme from the request body

    // Check if the colorTheme is provided in the request
    if (!colorTheme) {
        return res.status(400).json({
            error: true,
            message: "Theme selection is required." // Return error if theme is not provided
        });
    }

    try {
        // Update the user's color theme in the database
        const updateResult = await User.updateOne(
            { _id: userId },
            { colorTheme }
        );

        // Check if any document was actually updated
        if (updateResult.modifiedCount === 0) {
            return res.status(400).json({
                error: true,
                message: "No changes made to theme settings." // No update if no document was modified
            });
        }

        // Return a success response if the update was successful
        return res.status(200).json({
            error: false,
            message: "Theme settings saved successfully." // Success message on successful update
        });

    } catch (err) {
        // Handle any errors during the update operation
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
    const userId = req.user?._id; // Extract the user ID from the authenticated request
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
        // Update the user's weather settings in the database
        const updateResult = await User.updateOne(
            { _id: userId },
            {
                location: location?.location,
                longitude: location?.longitude,
                latitude: location?.latitude,
                unit
            }
        );

        // Check if the document was actually updated
        if (updateResult.modifiedCount === 0) {
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
    const userId = req.user?._id; // Extract user ID from the authenticated request

    // Ensure the user ID exists
    if (!userId) {
        return res.status(400).json({
            error: true,
            message: "User is not authenticated." // Return error if user ID is missing
        });
    }

    try {
        // Fetch the user's settings from the database
        const user = await User.findOne({ _id: userId }).exec();

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
        // Handle any unexpected errors during the database operation
        return res.status(500).json({
            error: true,
            message: "An error occurred while fetching user settings." // General error message
        });
    }
};


exports.oidcSettings = async (req, res) => {
    const user = req.user;

    //if the user is not admin
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

        const existingSettings = await GlobalSetting.findOne({});

        if (existingSettings) {
            existingSettings.oidcConfig = oidcSettings;
            existingSettings.oidcEnabled = enableOidcAuth;
            await existingSettings.save();
        } else {
            await GlobalSetting.create({ oidcConfig: oidcSettings, oidcEnabled: enableOidcAuth });
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

}

exports.getOidcSettings = async (req, res) => {
    const user = req.user;

    //if the user is not admin
    if (!user?.isSuperAdmin) {
        return res.status(401).json({
            error: true,
            message: "Unauthorized: Admin access required."
        });
    }

    try {
        const settings = await GlobalSetting.findOne({});

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
            }
            //console.log("OIDC settings fetched:", oidcConfig);
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
}

exports.generateBackup = async (req, res) => {
    try {
        // Create mapping for IDs
        const idMappings = {
            users: {},
            listings: {}
        };
        
        // Function to transform Mongoose data
        const transformData = (data) => {
            const transformed = JSON.parse(JSON.stringify(data));
            
            // Convert MongoDB _id to string id
            if (transformed._id) {
                transformed._id = transformed._id.toString();
                delete transformed._id;
            }
            
            // Remove Mongoose-specific fields
            delete transformed.__v;
            
            return transformed;
        };

        // =============================================
        // Users collection
        // =============================================
        const users = await User.find({}).lean();
        
        const transformedUsers = users.map((user, index) => {
            const userId = index + 1;
            idMappings.users[user._id.toString()] = userId;
            
            const transformedUser = transformData(user);
            transformedUser.id = userId;
            
            return transformedUser;
        });

        // =============================================
        // Apps collection
        // =============================================
        const apps = await App.find({}).lean();
        
        const transformedApps = apps.map((app, index) => {
            const transformedApp = transformData(app);
            transformedApp.id = index + 1;
            return transformedApp;
        });

        // =============================================
        // Global settings
        // =============================================
        const globalSettings = await GlobalSetting.find({}).lean();
        
        const transformedGlobalSettings = globalSettings.map((setting, index) => {
            const transformedSetting = transformData(setting);
            transformedSetting.id = index + 1;
            
            return transformedSetting;
        });

        // =============================================
        // Listings collection
        // =============================================
        const listings = await Listing.find({}).lean();
        
        listings.forEach((listing, index) => {
            idMappings.listings[listing._id.toString()] = index + 1;
        });
        
        const transformedListings = listings.map((listing, index) => {
            const transformedListing = transformData(listing);
            transformedListing.id = index + 1;
            
            // Replace MongoDB ObjectId references with SQLite integer IDs
            if (transformedListing.userId) {
                const mongoUserId = typeof transformedListing.userId === 'object' ? 
                transformedListing.userId.toString() : transformedListing.userId;
                transformedListing.userId = idMappings.users[mongoUserId] || null;
            }
            
            // Handle parent listing references
            if (transformedListing.parentId) {
                const mongoParentId = typeof transformedListing.parentId === 'object' ? 
                transformedListing.parentId.toString() : transformedListing.parentId;
                transformedListing.parentId = idMappings.listings[mongoParentId] || null;
            }
            
            return transformedListing;
        });

        // =============================================
        // Authenticators collection
        // =============================================
        const authenticators = await Authenticator.find({}).lean();
        
        const transformedAuthenticators = authenticators.map((authenticator, index) => {
            const transformedAuth = transformData(authenticator);
            transformedAuth.id = index + 1;
            
            if (transformedAuth.userId) {
                const mongoUserId = typeof transformedAuth.userId === 'object' ? 
                transformedAuth.userId.toString() : transformedAuth.userId;
                transformedAuth.userId = idMappings.users[mongoUserId] || null;
            }
            
            return transformedAuth;
        });

        // =============================================
        // Icons collection
        // =============================================
        const icons = await Icon.find({}).lean();
        
        const transformedIcons = icons.map((icon, index) => {
            const transformedIcon = transformData(icon);
            transformedIcon.id = index + 1;
            
            if (transformedIcon.userId) {
                const mongoUserId = typeof transformedIcon.userId === 'object' ? 
                transformedIcon.userId.toString() : transformedIcon.userId;
                transformedIcon.userId = idMappings.users[mongoUserId] || null;
            }
            
            return transformedIcon;
        });

        // =============================================
        // IconPacks collection
        // =============================================
        const iconPacks = await IconPack.find({}).lean();
        
        const transformedIconPacks = iconPacks.map((iconPack, index) => {
            const transformedIconPack = transformData(iconPack);
            transformedIconPack.id = index + 1;
            
            if (transformedIconPack.userId) {
                const mongoUserId = typeof transformedIconPack.userId === 'object' ? 
                transformedIconPack.userId.toString() : transformedIconPack.userId;
                transformedIconPack.userId = idMappings.users[mongoUserId] || null;
            }
            
            return transformedIconPack;
        });

        // =============================================
        // NetworkDevices collection
        // =============================================
        const NetworkDevice = require('../models/NetworkDevice');
        const networkDevices = await NetworkDevice.find({}).lean();
        
        const transformedNetworkDevices = networkDevices.map((device, index) => {
            const transformedDevice = transformData(device);
            transformedDevice.id = index + 1;
            
            if (transformedDevice.userId) {
                const mongoUserId = typeof transformedDevice.userId === 'object' ? 
                transformedDevice.userId.toString() : transformedDevice.userId;
                transformedDevice.userId = idMappings.users[mongoUserId] || null;
            }
            
            return transformedDevice;
        });

        // =============================================
        // Pages collection
        // =============================================
        const Page = require('../models/Page');
        const pages = await Page.find({}).lean();
        
        const transformedPages = pages.map((page, index) => {
            const transformedPage = transformData(page);
            transformedPage.id = index + 1;
            
            if (transformedPage.userId) {
                const mongoUserId = typeof transformedPage.userId === 'object' ? 
                transformedPage.userId.toString() : transformedPage.userId;
                transformedPage.userId = idMappings.users[mongoUserId] || null;
            }
            
            return transformedPage;
        });

        // =============================================
        // Snippets collection
        // =============================================
        const Snippet = require('../models/Snippet');
        const snippets = await Snippet.find({}).lean();
        
        const transformedSnippets = snippets.map((snippet, index) => {
            const transformedSnippet = transformData(snippet);
            transformedSnippet.id = index + 1;
            
            if (transformedSnippet.userId) {
                const mongoUserId = typeof transformedSnippet.userId === 'object' ? 
                transformedSnippet.userId.toString() : transformedSnippet.userId;
                transformedSnippet.userId = idMappings.users[mongoUserId] || null;
            }
            
            if (transformedSnippet.parent) {
                const mongoListingId = typeof transformedSnippet.parent === 'object' ? 
                transformedSnippet.parent.toString() : transformedSnippet.parent;
                transformedSnippet.parent = idMappings.listings[mongoListingId] || null;
            }
            
            return transformedSnippet;
        });

        // =============================================
        // Todos collection
        // =============================================
        const Todo = require('../models/Todo');
        const todos = await Todo.find({}).lean();
        
        const transformedTodos = todos.map((todo, index) => {
            const transformedTodo = transformData(todo);
            transformedTodo.id = index + 1;
            
            if (transformedTodo.userId) {
                const mongoUserId = typeof transformedTodo.userId === 'object' ? 
                transformedTodo.userId.toString() : transformedTodo.userId;
                transformedTodo.userId = idMappings.users[mongoUserId] || null;
            }
            
            if (transformedTodo.parent) {
                const mongoListingId = typeof transformedTodo.parent === 'object' ? 
                transformedTodo.parent.toString() : transformedTodo.parent;
                transformedTodo.parent = idMappings.listings[mongoListingId] || null;
            }
            
            return transformedTodo;
        });

        // Combine all transformed data into the backup object
        const backupData = {
            Secret: process.env.SECRET_KEY || "hghjkuyhsjsghjsghsjsg", // Add the secret key from environment
            Users: transformedUsers,
            Apps: transformedApps,
            GlobalSettings: transformedGlobalSettings,
            IconPacks: transformedIconPacks,
            Icons: transformedIcons,
            Listings: transformedListings,
            NetworkDevices: transformedNetworkDevices,
            Pages: transformedPages,
            Authenticators: transformedAuthenticators,
            Snippets: transformedSnippets,
            Todos: transformedTodos
        };

        //Add this json to zip file
        const backupFilePath = path.join(__dirname, '../../backup.json');
        await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2)); // Write the backup data to a file

        //Now add /storage/uploads folder and the json file to the zip file
        const uploadsPath = path.join(__dirname, '../../storage/uploads');
        zip.addLocalFolder(uploadsPath, 'uploads'); // Add the uploads folder with its path preserved
        zip.addLocalFile(backupFilePath); // Add the backup JSON file to the zip

        const zipFilePath = path.join(__dirname, '../../backup.zip');
        zip.writeZip(zipFilePath); // Write the zip file

        await fs.unlink(backupFilePath); // Delete the backup JSON file after zipping

        //Get the zip file as buffer
        const zipBuffer = await fs.readFile(zipFilePath); // Read the zip file as a buffer

        await fs.unlink(zipFilePath); // Delete the zip file after reading

        //Zip name: "Astroluma-backup-<timestamp>.zip"
        const zipName = `Astroluma-backup-${new Date().toISOString().replace(/:/g, '-')}.zip`;
        return res.status(200).json({
            error: false,
            message: {
                filename: zipName,
                fileSize: zipBuffer.length,
                contentType: 'application/zip',
                data: zipBuffer.toString('base64')
            }
        });

    } catch (error) {
        console.error('Error generating backup:', error);
        return res.status(500).json({
            error: true,
            message: "Error generating backup."
        });
    }
};
const Authenticator = require('../models/Authenticator');
const User = require('../models/User');
const Listing = require('../models/Listing');
const axios = require('axios');

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
        const [authenticators, sidebarItems, homepageItems] = await Promise.all([
            Authenticator.find({ userId }).sort({ sortOrder: 1 }), // Fetch authenticators sorted by sortOrder
            Listing.find({ userId, inSidebar: true }).sort({ listingName: 1 }), // Sidebar items sorted by listingName
            Listing.find({ userId, parentId: null }).sort({ listingName: 1 }) // Homepage items sorted by listingName
        ]);

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
            homepageItems
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
    const { siteName, authenticator, camerafeed, networkdevices, todolist, snippetmanager } = req.body;

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
            { siteName, authenticator, camerafeed, networkdevices, todolist, snippetmanager }
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
                snippetmanager: user.snippetmanager
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

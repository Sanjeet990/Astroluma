const fs = require('fs');
const path = require('path');
// Removed App model import since it's no longer used
const { Op } = require('sequelize');

/**
 * Install npm dependencies for an app
 * @param {string} appDir - Directory path containing the app
 * @returns {Promise<string>} - Success or error message
 */
const installDependencies = (appDir) => {
    return new Promise((resolve, reject) => {
        console.log(`Installing dependencies for ${appDir}...`);
        
        // Check if package.json exists
        const packageJsonPath = path.join(appDir, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            return resolve("No package.json found, skipping dependency installation");
        }
        
        // Check if node_modules already exists and has content
        const nodeModulesPath = path.join(appDir, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
            try {
                const contents = fs.readdirSync(nodeModulesPath);
                if (contents.length > 0) {
                    console.log(`Dependencies already installed in ${appDir}, skipping`);
                    return resolve("Dependencies already installed");
                }
            } catch (error) {
                console.warn(`Error checking node_modules in ${appDir}:`, error);
                // Continue with installation
            }
        }
        
        // Run npm install
        const { exec } = require('child_process');
        exec('npm install', { cwd: appDir }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error installing dependencies in ${appDir}:`, error);
                return reject(`Installation error: ${error.message}`);
            }
            
            console.log(`Successfully installed dependencies in ${appDir}`);
            resolve("Dependencies installed successfully");
        });
    });
};

/**
 * Discover all apps in the apps directory and register them in the database
 * @returns {Promise<void>}
 */
const discoverAndRegisterApps = async () => {
    console.log("Starting app discovery...");
    
    const appsDir = path.join(__dirname, '../apps');
    
    // Ensure apps directory exists
    if (!fs.existsSync(appsDir)) {
        console.log("Apps directory doesn't exist, creating it...");
        fs.mkdirSync(appsDir, { recursive: true });
    }
    
    try {
        // Get all app directories
        const appDirs = fs.readdirSync(appsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(appsDir, dirent.name));
        
        console.log(`Found ${appDirs.length} potential app directories`);
        
        // For each app directory, check for manifest.json and register the app
        for (const appDir of appDirs) {
            try {
                await registerApp(appDir, 'system');
            } catch (error) {
                console.error(`Error registering app in ${appDir}:`, error);
            }
        }
        
    } catch (error) {
        console.error("Error during app discovery:", error);
    }
};

/**
 * Register a single app in the database
 * @param {string} appDir - Directory path containing the app
 * @param {string} appType - Type of app ('system', 'user')
 * @returns {Promise<object|null>} - The registered app details or null if failed
 */
const registerApp = async (appDir, appType = 'user') => {
    console.log(`Attempting to register app in ${appDir} as ${appType} app`);
    
    try {
        const manifestPath = path.join(appDir, 'manifest.json');
        
        // Check if manifest exists
        if (!fs.existsSync(manifestPath)) {
            console.error(`No manifest.json found in ${appDir}`);
            return null;
        }
        
        // Read manifest
        const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Validate manifest
        if (!manifestData.appId || !manifestData.name || !manifestData.version || !manifestData.description) {
            console.error(`Invalid manifest.json in ${appDir}, missing required fields`);
            return null;
        }
        
        // Check if app already exists in database
        const appId = manifestData.appId;

        // Since we've removed the App model, we'll just store this information for the app
        // without saving to database
        const appData = {
            appId: appId,
            appName: manifestData.name,
            version: manifestData.version,
            description: manifestData.description,
            appIcon: manifestData.icon || 'default-app-icon.png',
            coreSettings: manifestData.coreSettings || false,
            appType: appType
        };
        
        console.log(`Registered app: ${appId}`);
        
        return appData;
    } catch (error) {
        console.error(`Error registering app in ${appDir}:`, error);
        return null;
    }
};

/**
 * Get the app directory from server/apps or storage/apps
 * @param {string} appId - The ID of the app
 * @returns {string|null} - Path to app directory or null if not found
 */
const getAppDirectory = (appId) => {
    // First check in storage/apps (user-installed apps)
    const storageAppsDir = path.join(__dirname, '../../storage/apps');
    const storageAppPath = path.join(storageAppsDir, appId);
    
    if (fs.existsSync(storageAppPath)) {
        return storageAppPath;
    }
    
    // Then check in server/apps (built-in apps)
    const serverAppsDir = path.join(__dirname, '../apps');
    const serverAppPath = path.join(serverAppsDir, appId);
    
    if (fs.existsSync(serverAppPath)) {
        return serverAppPath;
    }
    
    return null;
};

/**
 * Remove app from database and optionally from filesystem
 * @param {string} appName - ID of the app to remove
 * @param {boolean} removeFiles - Whether to remove app files
 * @returns {Promise<void>}
 */
const removeAppFromDatabase = async (appName, removeFiles = true) => {
    try {
        // Get the app directory
        const appDirectory = getAppDirectory(appName);
        
        if (removeFiles && appDirectory) {
            // Only remove files if they are in storage/apps, not in server/apps
            if (appDirectory.includes('storage/apps')) {
                try {
                    fs.rmSync(appDirectory, { recursive: true, force: true });
                    console.log(`Removed app files from ${appDirectory}`);
                } catch (error) {
                    console.error(`Error removing app files from ${appDirectory}:`, error);
                }
            }
        }
        
        try {
            // Clean up listings that reference this app
            const { Listing } = require('../models');
            const listings = await Listing.findAll();
            
            // Loop through listings and check if any use the app
            for (const listing of listings) {
                if (listing.integration && typeof listing.integration === 'string') {
                    try {
                        const integrationData = JSON.parse(listing.integration);
                        if (integrationData && integrationData.appId === appName) {
                            await listing.update({ integration: null });
                            console.log(`Removed integration for listing ${listing.id}`);
                        }
                    } catch (e) {
                        // If JSON parsing fails, it's not a valid integration object
                        console.warn(`Invalid integration data for listing ${listing.id}`);
                    }
                }
            }
            
            // We no longer delete from App table since it no longer exists
            console.log(`App ${appName} successfully removed from system`);
        } catch (error) {
            console.error(`Error removing app ${appName} from database:`, error);
            throw error;
        }
    } catch (error) {
        console.error(`Error removing app ${appName}:`, error);
        throw error;
    }
};

module.exports = {
    discoverAndRegisterApps,
    installDependencies,
    registerApp,
    getAppDirectory,
    removeAppFromDatabase
};
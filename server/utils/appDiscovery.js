const fs = require('fs');
const path = require('path');
const { App } = require('../models');
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
                console.error(`Error checking node_modules in ${appDir}:`, error);
            }
        }
        
        // Create a .npmrc file to reduce npm output
        const npmrcPath = path.join(appDir, '.npmrc');
        try {
            fs.writeFileSync(npmrcPath, 'loglevel=error\nprogress=false\n');
        } catch (error) {
            console.warn(`Could not create .npmrc file: ${error.message}`);
        }
        
        // Use --no-fund to reduce output and npm stdout redirected to a log file
        // to prevent triggering the file watcher
        const logFile = path.join(appDir, 'npm-install.log');
        const cmd = `cd "${appDir}" && npm install --production --no-fund > "${logFile}" 2>&1`;

        const { exec } = require('child_process');
        exec(cmd, (error, stdout, stderr) => {
            // Remove the temporary .npmrc file
            try {
                if (fs.existsSync(npmrcPath)) {
                    fs.unlinkSync(npmrcPath);
                }
            } catch (e) {
                console.warn(`Could not remove .npmrc file: ${e.message}`);
            }
            
            if (error) {
                reject(`Error installing dependencies: ${error.message}`);
            } else {
                resolve("Dependencies installed successfully");
            }
        });
    });
};

/**
 * Find and register apps from both server/apps and storage/apps directories
 * Synchronizes the database with available app directories
 * @param {Array<string>} [specificPaths] - Optional array of specific paths to check
 * @param {boolean} [isInitialScan=false] - Whether this is the initial scan at server startup
 * @returns {Promise<void>}
 */
const discoverAndRegisterApps = async (specificPaths = null, isInitialScan = false) => {
    try {
        // Define app directories
        const serverAppsDir = path.join(__dirname, '../apps');
        const storageAppsDir = path.join(__dirname, '../../storage/apps');
        
        // Collect all app directories
        const appDirectories = new Map(); // Use Map to handle overrides
        
        // Helper function to scan directories
        const scanDirectory = (directoryPath) => {
            if (!fs.existsSync(directoryPath)) return;
            
            fs.readdirSync(directoryPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => ({
                    name: dirent.name,
                    path: path.join(directoryPath, dirent.name)
                }))
                .forEach(app => {
                    // Only process if there's a manifest.json
                    const manifestPath = path.join(app.path, 'manifest.json');
                    if (fs.existsSync(manifestPath)) {
                        try {
                            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                            if (manifest.appId) {
                                // Use appId from manifest rather than directory name
                                appDirectories.set(manifest.appId, app.path);
                            }
                        } catch (error) {
                            console.error(`Error parsing manifest for ${app.name}:`, error);
                        }
                    }
                });
        };
        
        if (specificPaths) {
            // Process only specific paths (used by file watcher)
            for (const dirPath of specificPaths) {
                if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
                    const manifestPath = path.join(dirPath, 'manifest.json');
                    
                    if (fs.existsSync(manifestPath)) {
                        try {
                            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                            if (manifest.appId) {
                                appDirectories.set(manifest.appId, dirPath);
                            } else {
                                console.error(`No appId found in manifest at ${dirPath}`);
                            }
                        } catch (error) {
                            console.error(`Error parsing manifest at ${dirPath}:`, error);
                        }
                    }
                }
            }
        } else {
            // Scan server apps first (lower priority)
            scanDirectory(serverAppsDir);
            
            // Then scan storage apps (higher priority - will override same-named apps)
            scanDirectory(storageAppsDir);
        }
        
        console.log(`Discovered ${appDirectories.size} apps in filesystem`);
        
        // If this is the initial scan at server startup, perform full database synchronization
        if (isInitialScan) {
            await synchronizeAppDatabase(appDirectories);
        } else {
            // Process each app directory normally (for file watcher events)
            for (const [appId, appPath] of appDirectories) {
                try {
                    await registerApp(appPath);
                } catch (error) {
                    console.error(`Error registering app ${appId}:`, error);
                }
            }
        }
    } catch (error) {
        console.error('Error in app discovery:', error);
        throw error;
    }
};

/**
 * Synchronize the App database table with the apps found in the filesystem
 * @param {Map<string, string>} appDirectories - Map of appId to directory path
 * @returns {Promise<void>}
 */
const synchronizeAppDatabase = async (appDirectories) => {
    try {
        // Get all apps currently in the database
        const dbApps = await App.findAll();
        const dbAppIds = new Set(dbApps.map(app => app.appId));
        const fsAppIds = new Set(appDirectories.keys());
        
        console.log(`Found ${dbAppIds.size} apps in database and ${fsAppIds.size} apps in filesystem`);
        
        // Apps to add (in filesystem but not in db)
        const appsToAdd = [...fsAppIds].filter(appId => !dbAppIds.has(appId));
        
        // Apps to remove (in db but not in filesystem)
        const appsToRemove = [...dbAppIds].filter(appId => !fsAppIds.has(appId));
        
        // Apps to update (both in db and filesystem)
        const appsToUpdate = [...fsAppIds].filter(appId => dbAppIds.has(appId));
        
        console.log(`Apps to add: ${appsToAdd.length}, update: ${appsToUpdate.length}, remove: ${appsToRemove.length}`);
        
        // Remove apps that no longer exist in filesystem
        if (appsToRemove.length > 0) {
            console.log(`Removing ${appsToRemove.length} apps from database: ${appsToRemove.join(', ')}`);
            for (const appId of appsToRemove) {
                try {
                    // Clean up listings that reference this app
                    const { Listing } = require('../models');
                    const listings = await Listing.findAll();
                    
                    // Loop through listings and check if any use the app
                    for (const listing of listings) {
                        if (listing.integration && typeof listing.integration === 'string') {
                            try {
                                const integrationData = JSON.parse(listing.integration);
                                if (integrationData && integrationData.appId === appId) {
                                    await listing.update({ integration: null });
                                    console.log(`Removed integration for listing ${listing.id}`);
                                }
                            } catch (e) {
                                // If JSON parsing fails, it's not a valid integration object
                                console.warn(`Invalid integration data for listing ${listing.id}`);
                            }
                        }
                    }
                    
                    // Remove from App table
                    await App.destroy({ where: { appId } });
                    console.log(`Removed app ${appId} from database`);
                } catch (error) {
                    console.error(`Error removing app ${appId} from database:`, error);
                }
            }
        }
        
        // Add new apps found in filesystem
        if (appsToAdd.length > 0) {
            console.log(`Adding ${appsToAdd.length} new apps to database`);
            for (const appId of appsToAdd) {
                try {
                    const appPath = appDirectories.get(appId);
                    await registerApp(appPath);
                    console.log(`Added app ${appId} to database`);
                } catch (error) {
                    console.error(`Error adding app ${appId} to database:`, error);
                }
            }
        }
        
        // Update existing apps
        if (appsToUpdate.length > 0) {
            console.log(`Updating ${appsToUpdate.length} existing apps in database`);
            for (const appId of appsToUpdate) {
                try {
                    const appPath = appDirectories.get(appId);
                    await registerApp(appPath);
                    console.log(`Updated app ${appId} in database`);
                } catch (error) {
                    console.error(`Error updating app ${appId} in database:`, error);
                }
            }
        }
        
        console.log("Database synchronization complete");
    } catch (error) {
        console.error("Error synchronizing app database:", error);
        throw error;
    }
};

/**
 * Register or update a single app in the database
 * @param {string} appDir - Directory path containing the app
 * @returns {Promise<void>}
 */
const registerApp = async (appDir) => {
    try {
        // Read and parse manifest
        const manifestPath = path.join(appDir, 'manifest.json');
        const packageJsonPath = path.join(appDir, 'package.json');
        
        if (!fs.existsSync(manifestPath)) {
            throw new Error(`Missing manifest.json in ${appDir}`);
        }
        
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error(`Missing package.json in ${appDir}`);
        }
        
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const appId = manifest.appId;
        
        if (!appId) {
            throw new Error(`Invalid manifest.json: missing appId in ${appDir}`);
        }
        
        // Check if the app exists in system directory regardless of where we're registering it from
        const serverAppPath = path.join(__dirname, '../apps', appId);
        const systemAppExists = fs.existsSync(serverAppPath) && fs.existsSync(path.join(serverAppPath, 'manifest.json'));
        
        // Determine app type - if it exists in system directory, it's always a system app
        const appType = systemAppExists ? 'system' : 'user';
        
        // Check if app already exists in database
        const existingApp = await App.findOne({ where: { appId } });
        
        if (existingApp) {
            console.log(`App ${appId} already registered, updating...`);
            
            // Determine if this is an update to a system app
            let isUpdated = existingApp.isUpdated;
            if (existingApp.appType === 'system' && existingApp.version !== manifest.version) {
                isUpdated = 1;
            }
            
            // Update existing app record - ALWAYS preserve appType for system apps
            await App.update({
                appName: manifest.appName,
                description: manifest.description || "",
                appIcon: manifest.appIcon || "integration.png",
                version: manifest.version || "0.0.0",
                npmInstalled: existingApp.npmInstalled || 0,
                // If existing app was system type, preserve it 
                appType: (existingApp.appType === 'system') ? 'system' : appType,
                isUpdated
            }, {
                where: { appId }
            });
        } else {
            console.log(`Registering new app: ${appId}`);
            console.log(`Manifest: ${JSON.stringify(manifest)}`);
            
            // Create new app record
            await App.create({
                appId: manifest.appId,
                appName: manifest.appName,
                description: manifest.description || "",
                requiresConfiguration: manifest.config?.length > 0 ? true : false,
                config: JSON.stringify(manifest.config || []),
                npmInstalled: 0, // Set to 0 initially, will be updated after installation
                version: manifest.version || "0.0.0",
                appIcon: manifest.appIcon || "integration.png",
                coreSettings: manifest.config?.some(setting => setting.scope === "core") || false,
                configured: manifest.config?.some(setting => setting.scope === "core") ? false : true,
                appType,
                isUpdated: 0
            });
        }
        
        // Install dependencies asynchronously
        process.nextTick(async () => {
            try {
                await installDependencies(appDir);
                await App.update({ npmInstalled: 1 }, { where: { appId } });
                console.log(`Dependencies installed successfully for ${appId}`);
            } catch (error) {
                console.error(`Failed to install dependencies for ${appId}:`, error);
                await App.update({ npmInstalled: -1 }, { where: { appId } });
            }
        });
    } catch (error) {
        console.error(`Error registering app from ${appDir}:`, error);
        throw error;
    }
};

/**
 * Get the effective app directory for a given app ID
 * Prioritizes storage/apps over server/apps
 * @param {string} appId - The app identifier
 * @returns {string|null} - Path to the app directory or null if not found
 */
const getAppDirectory = (appId) => {
    // First check storage/apps (higher priority)
    const storageAppPath = path.join(__dirname, '../../storage/apps', appId);
    if (fs.existsSync(storageAppPath) && fs.existsSync(path.join(storageAppPath, 'manifest.json'))) {
        return storageAppPath;
    }
    
    // Then fall back to server/apps
    const serverAppPath = path.join(__dirname, '../apps', appId);
    if (fs.existsSync(serverAppPath) && fs.existsSync(path.join(serverAppPath, 'manifest.json'))) {
        return serverAppPath;
    }
    
    return null;
};

/**
 * Remove an app from the database when its directory is deleted
 * @param {string} appName - The name of the app directory (not necessarily the appId)
 * @returns {Promise<void>}
 */
const removeAppFromDatabase = async (appName) => {
    try {
        // Check if app still exists in the server/apps directory
        // If so, we don't want to remove it from the database
        const serverAppPath = path.join(__dirname, '../apps', appName);
        if (fs.existsSync(serverAppPath) && fs.existsSync(path.join(serverAppPath, 'manifest.json'))) {
            console.log(`App ${appName} still exists in server/apps directory, not removing from database`);
            return;
        }
        
        // Try to find the app by directory name first
        let app = await App.findOne({ where: { appId: appName } });
        
        if (!app) {
            console.log(`No app with ID ${appName} found in database, nothing to remove`);
            return;
        }
        
        console.log(`Removing app ${appName} from database`);
        
        // Update listings that use this app to remove the integration
        // We need to handle this differently since SQLite doesn't support direct JSON operations
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
        
        // Remove the app from the database
        await App.destroy({ where: { appId: appName } });
        
        console.log(`App ${appName} successfully removed from database`);
    } catch (error) {
        console.error(`Error removing app ${appName} from database:`, error);
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
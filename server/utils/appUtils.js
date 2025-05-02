const fs = require('fs');
const path = require('path');
// Remove App model import since we're no longer using it
const { Listing } = require('../models');

// In-memory cache for app details
const appDetailsCache = new Map();

/**
 * Get the directory path for an app
 * @param {string} appId - The ID of the app
 * @returns {string|null} - Path to the app directory or null if not found
 */
const getAppDirectory = (appId) => {
    // First check in storage/apps (user-installed or updated apps)
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
 * Get all installed apps from the filesystem
 * @returns {Array} - Array of app objects
 */
const getAllInstalledApps = async () => {
    // Clear the cache
    appDetailsCache.clear();
    
    // Get apps from both server/apps and storage/apps
    const appList = [];
    const serverAppsDir = path.join(__dirname, '../apps');
    const storageAppsDir = path.join(__dirname, '../../storage/apps');
    
    // Ensure directories exist
    if (!fs.existsSync(serverAppsDir)) {
        fs.mkdirSync(serverAppsDir, { recursive: true });
    }
    if (!fs.existsSync(storageAppsDir)) {
        fs.mkdirSync(storageAppsDir, { recursive: true });
    }
    
    // Get all apps from server/apps
    const systemApps = fs.readdirSync(serverAppsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
            try {
                const appDir = path.join(serverAppsDir, dirent.name);
                const manifestPath = path.join(appDir, 'manifest.json');
                
                if (fs.existsSync(manifestPath)) {
                    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    
                    // Check if app is also in storage/apps (meaning it has an update)
                    const storageAppPath = path.join(storageAppsDir, dirent.name);
                    const isUpdated = fs.existsSync(storageAppPath);
                    
                    // If the app is updated, we should use the manifest from storage/apps
                    // but keep the appType as "system"
                    let appManifest = manifest;
                    let appDirectory = appDir;
                    
                    if (isUpdated) {
                        const updatedManifestPath = path.join(storageAppPath, 'manifest.json');
                        if (fs.existsSync(updatedManifestPath)) {
                            try {
                                appManifest = JSON.parse(fs.readFileSync(updatedManifestPath, 'utf8'));
                                appDirectory = storageAppPath;
                            } catch (error) {
                                console.error(`Error reading updated manifest for ${dirent.name}:`, error);
                                // Fall back to original manifest
                                appManifest = manifest;
                                appDirectory = appDir;
                            }
                        }
                    }
                    
                    //Check if node_modules exists
                    const nodeModulesPath = path.join(appDirectory, 'node_modules');
                    const hasDependencies = fs.existsSync(nodeModulesPath) && fs.readdirSync(nodeModulesPath).length > 0;

                    const app = {
                        appId: appManifest.appId,
                        appName: appManifest.name,
                        version: appManifest.version,
                        description: appManifest.description || '',
                        icon: appManifest.icon || 'app-default-icon.png',
                        appType: 'system',
                        npmInstalled: hasDependencies,
                        isUpdated: isUpdated ? true : false
                    };
                    
                    // Cache the app details
                    appDetailsCache.set(appManifest.appId, app);
                    
                    return app;
                }
            } catch (error) {
                console.error(`Error reading system app ${dirent.name}:`, error);
            }
            
            return null;
        })
        .filter(Boolean);
    
    appList.push(...systemApps);
    
    // Get all apps from storage/apps that aren't updates to system apps
    const userApps = fs.readdirSync(storageAppsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => {
            // Skip if this is an update to a system app (already included above)
            if (appList.some(app => app.appId === dirent.name)) {
                return null;
            }
            
            try {
                const appDir = path.join(storageAppsDir, dirent.name);
                const manifestPath = path.join(appDir, 'manifest.json');
                
                if (fs.existsSync(manifestPath)) {
                    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                    
                    //Check if node_modules exists
                    const nodeModulesPath = path.join(appDir, 'node_modules');
                    const hasDependencies = fs.existsSync(nodeModulesPath) && fs.readdirSync(nodeModulesPath).length > 0;

                    const app = {
                        appId: manifest.appId,
                        appName: manifest.name,
                        version: manifest.version,
                        description: manifest.description || '',
                        icon: manifest.icon || 'app-default-icon.png',
                        appType: 'user',
                        npmInstalled: hasDependencies,
                        isUpdated: false
                    };
                    
                    // Cache the app details
                    appDetailsCache.set(manifest.appId, app);
                    
                    return app;
                }
            } catch (error) {
                console.error(`Error reading user app ${dirent.name}:`, error);
            }
            
            return null;
        })
        .filter(Boolean);
    
    appList.push(...userApps);
    
    return appList;
};

/**
 * Get details of a specific app from the app cache or filesystem
 * @param {string} appId - The ID of the app
 * @returns {object|null} - App details or null if not found
 */
const getAppDetails = (appId) => {
    // Check cache first
    if (appDetailsCache.has(appId)) {
        return appDetailsCache.get(appId);
    }
    
    // Try to get from filesystem
    // First check storage/apps (user apps or updates)
    const storageAppsDir = path.join(__dirname, '../../storage/apps');
    const storageAppPath = path.join(storageAppsDir, appId);
    
    if (fs.existsSync(storageAppPath)) {
        try {
            const manifestPath = path.join(storageAppPath, 'manifest.json');
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                
                // Check if there's also a system version
                const serverAppsDir = path.join(__dirname, '../apps');
                const serverAppPath = path.join(serverAppsDir, appId);
                const isSystemApp = fs.existsSync(serverAppPath);
                
                const app = {
                    appId: manifest.appId,
                    appName: manifest.name,
                    version: manifest.version,
                    description: manifest.description || '',
                    icon: manifest.icon || 'app-default-icon.png',
                    appType: isSystemApp ? 'system' : 'user',
                    isUpdated: isSystemApp
                };
                
                // Cache the app details
                appDetailsCache.set(appId, app);
                
                return app;
            }
        } catch (error) {
            console.error(`Error reading app ${appId} from storage:`, error);
        }
    }
    
    // Then check server/apps (built-in apps)
    const serverAppsDir = path.join(__dirname, '../apps');
    const serverAppPath = path.join(serverAppsDir, appId);
    
    if (fs.existsSync(serverAppPath)) {
        try {
            const manifestPath = path.join(serverAppPath, 'manifest.json');
            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                
                const app = {
                    appId: manifest.appId,
                    appName: manifest.name,
                    version: manifest.version,
                    description: manifest.description || '',
                    icon: manifest.icon || 'app-default-icon.png',
                    appType: 'system',
                    isUpdated: false
                };
                
                // Cache the app details
                appDetailsCache.set(appId, app);
                
                return app;
            }
        } catch (error) {
            console.error(`Error reading app ${appId} from server:`, error);
        }
    }
    
    return null;
};

/**
 * Remove an app from the filesystem and update listings
 * @param {string} appId - ID of the app to remove
 * @returns {Promise<void>}
 */
const removeApp = async (appId) => {
    // Get app details
    const app = getAppDetails(appId);
    if (!app) {
        throw new Error(`App ${appId} not found.`);
    }
    
    // Check app type
    if (app.appType === 'system' && !app.isUpdated) {
        throw new Error("System apps cannot be removed.");
    }
    
    // First update any listings that reference this app
    try {
        const listings = await Listing.findAll();
        
        for (const listing of listings) {
            if (listing.integration) {
                // Check if integration references this app
                if (listing.integration.appId === appId) {
                    // Remove integration from listing
                    await listing.update({ integration: null });
                    console.log(`Removed integration for listing ${listing.id}`);
                }
            }
        }
    } catch (error) {
        console.error(`Error updating listings for app ${appId}:`, error);
        // Continue with removal even if listing update fails
    }
    
    // Remove app files
    if (app.isUpdated) {
        // Only remove the updated version in storage/apps
        const storageAppPath = path.join(__dirname, `../../storage/apps/${appId}`);
        if (fs.existsSync(storageAppPath)) {
            fs.rmSync(storageAppPath, { recursive: true, force: true });
            console.log(`Removed app update files from ${storageAppPath}`);
        }
    } else if (app.appType === 'user') {
        // Remove the user app files
        const appPath = path.join(__dirname, `../../storage/apps/${appId}`);
        if (fs.existsSync(appPath)) {
            fs.rmSync(appPath, { recursive: true, force: true });
            console.log(`Removed app files from ${appPath}`);
        }
    }
    
    // Remove from cache
    appDetailsCache.delete(appId);
    
    console.log(`Successfully removed app ${appId}`);
};

/**
 * Install app dependencies
 * @param {string} appDir - Path to app directory
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
 * Paginate apps list
 * @param {Array} apps - List of apps
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} - Paginated apps object
 */
const paginateApps = (apps, page = 1, limit = 10) => {

    const startIndex = (page - 1) * limit;
    let endIndex = page * limit;
    const total = apps.length;
    const totalPages = Math.ceil(total / limit);

    if(endIndex > total) {
        endIndex = total;
    }

    const paginatedApps = apps.slice(startIndex, endIndex);

    return {
        appList: paginatedApps,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasMore: page < totalPages
        }
    };
};

module.exports = {
    getAppDirectory,
    getAllInstalledApps,
    getAppDetails,
    removeApp,
    installDependencies,
    paginateApps
};
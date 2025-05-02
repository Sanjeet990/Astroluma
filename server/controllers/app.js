const path = require('path');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const AdmZip = require('adm-zip');
const rimraf = require('rimraf');
const vm = require('vm');
const { Listing } = require('../models');
const allowedModules = require('../utils/allowedModules');
const { 
    getAppDirectory, 
    getAllInstalledApps, 
    getAppDetails,
    removeApp,
    installDependencies,
    paginateApps
} = require('../utils/appUtils');

// Helper functions - no changes needed to these utility functions
const validateUser = (user) => {
    if (!user || !user.isSuperAdmin) {
        throw new Error("Unauthorized: Admin access required.");
    }
};

const cleanupFiles = (filePaths) => {
    for (const filePath of filePaths) {
        if (fs.existsSync(filePath)) {
            if (fs.statSync(filePath).isDirectory()) {
                rimraf.sync(filePath);
            } else {
                fs.unlinkSync(filePath);
            }
        }
    }
};

// Handler for app installation
const handleAppInstallation = async (zipPath, extractPath) => {
    try {
        validateUser({ isSuperAdmin: true }); // Simplified validation for helper function

        if (!fs.existsSync(zipPath)) {
            throw new Error("ZIP file not found.");
        }

        const zip = new AdmZip(zipPath);

        // Extract the ZIP file to the temporary path (using timestamp)
        zip.extractAllTo(extractPath, true);

        const manifestPath = path.join(extractPath, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
            throw new Error("Invalid app package: missing manifest.json");
        }

        // Read the manifest.json to get the actual appId
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        if (!manifest.appId) {
            throw new Error("Invalid app package: missing appId in manifest.json");
        }

        // Get the proper destination path based on the appId from manifest
        const storageAppsDir = path.dirname(extractPath);
        const properDestPath = path.join(storageAppsDir, manifest.appId);

        // If there's already an app with this ID, remove it first
        if (fs.existsSync(properDestPath)) {
            rimraf.sync(properDestPath);
        }

        // Rename the folder to match the appId
        fs.renameSync(extractPath, properDestPath);

        // Optionally install dependencies right away
        try {
            await installDependencies(properDestPath);
            console.log(`Dependencies installed for ${manifest.appId}`);
        } catch (err) {
            console.error(`Error installing dependencies for ${manifest.appId}:`, err);
            // Continue despite dependency installation errors
        }

        // Return success response
        return {
            error: false,
            message: "The integration has been installed successfully."
        };

    } catch (error) {
        // Clean up the extract path if there was an error
        if (fs.existsSync(extractPath)) {
            rimraf.sync(extractPath);
        }
        throw error;
    } finally {
        // Clean up the zip file
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }
    }
};

// Main controller functions
exports.installFromZip = async (req, res) => {
    try {
        validateUser(req.user);

        if (!req.file) {
            throw new Error("No file uploaded.");
        }

        const zipPath = req.file.path;
        const storageAppsDir = path.join(__dirname, '../../storage/apps');
        
        // Ensure storage/apps directory exists
        if (!fs.existsSync(storageAppsDir)) {
            fs.mkdirSync(storageAppsDir, { recursive: true });
        }
        
        // Use the timestamp from multer as the temporary folder name
        const extractPath = path.join(storageAppsDir, req.file.filename.split('.')[0]);

        console.log("Extracting to:", zipPath, extractPath);

        const result = await handleAppInstallation(zipPath, extractPath);
        return res.status(200).json(result);

    } catch (error) {
        return res.status(400).json({
            error: true,
            message: error.message || "Error in installing app."
        });
    }
};

const downloadFile = async (url, zipPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });

            const writer = fs.createWriteStream(zipPath);

            response.data.pipe(writer);

            writer.on('finish', () => {
                resolve();
            });

            writer.on('error', (err) => {
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};

exports.installRemoteApp = async (req, res) => {
    try {
        validateUser(req.user);

        const appId = req.params.appId;
        if (!appId) {
            throw new Error("No application id provided.");
        }

        // Create a temporary extraction directory with timestamp
        const tempDirName = `temp_${Date.now()}`;
        const zipPath = path.join(__dirname, '../public/uploads/integrations', `${appId}`);
        const storageAppsDir = path.join(__dirname, '../../storage/apps');
        const tempExtractPath = path.join(storageAppsDir, tempDirName);
        
        // Ensure storage/apps directory exists
        if (!fs.existsSync(storageAppsDir)) {
            fs.mkdirSync(storageAppsDir, { recursive: true });
        }

        const appUrl = `https://cdn.jsdelivr.net/gh/Sanjeet990/AstrolumaApps/apps/${appId}.zip`;

        // Download file first
        await downloadFile(appUrl, zipPath);

        // Install the app using the temporary path
        const result = await handleAppInstallation(zipPath, tempExtractPath);
        return res.status(200).json(result);

    } catch (error) {
        return res.status(400).json({
            error: true,
            message: error.message || "Error in installing app."
        });
    }
};

exports.updateRemoteApp = async (req, res) => {
    try {
        validateUser(req.user);

        const appId = req.params.appId;
        if (!appId) {
            throw new Error("No application id provided.");
        }

        // Check if app exists
        const appDetails = getAppDetails(appId);
        if (!appDetails) {
            throw new Error("App not found.");
        }

        // Create a temporary extraction directory with timestamp
        const tempDirName = `temp_${Date.now()}`;
        const zipPath = path.join(__dirname, '../public/uploads/integrations', `${appId}`);
        const storageAppsDir = path.join(__dirname, '../../storage/apps');
        const tempExtractPath = path.join(storageAppsDir, tempDirName);
        
        const appUrl = `https://cdn.jsdelivr.net/gh/Sanjeet990/AstrolumaApps/apps/${appId}.zip`;

        // Download new version
        await downloadFile(appUrl, zipPath);

        // Extract to temporary directory
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(tempExtractPath, true);

        const manifestPath = path.join(tempExtractPath, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
            cleanupFiles([zipPath, tempExtractPath]);
            throw new Error("Invalid app package: missing manifest.json");
        }

        // Read the manifest.json to get the actual appId
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        
        if (!manifest.appId) {
            cleanupFiles([zipPath, tempExtractPath]);
            throw new Error("Invalid app package: missing appId in manifest.json");
        }

        // Make sure the manifest appId matches the requested appId
        if (manifest.appId !== appId) {
            cleanupFiles([zipPath, tempExtractPath]);
            throw new Error(`Manifest appId (${manifest.appId}) doesn't match expected appId (${appId})`);
        }

        // Get the proper destination path based on the appId from manifest
        const properDestPath = path.join(storageAppsDir, manifest.appId);

        // If there's already an app with this ID, remove it first
        if (fs.existsSync(properDestPath)) {
            fs.rmSync(properDestPath, { recursive: true });
        }

        // Rename the folder to match the appId
        fs.renameSync(tempExtractPath, properDestPath);

        // Optionally install dependencies right away
        try {
            await installDependencies(properDestPath);
            console.log(`Dependencies installed for ${manifest.appId}`);
        } catch (err) {
            console.error(`Error installing dependencies for ${manifest.appId}:`, err);
            // Continue despite dependency installation errors
        }

        // Cleanup the zip file since we don't need it anymore
        cleanupFiles([zipPath]);

        return res.status(200).json({
            error: false,
            message: "The integration has been updated successfully."
        });

    } catch (error) {
        // Clean up files in case of any error
        cleanupFiles([
            path.join(__dirname, `../public/uploads/integrations/${req.params.appId}`),
            path.join(__dirname, `../../storage/apps/temp_*`)
        ]);

        return res.status(400).json({
            error: true,
            message: error.message || "Error in updating app."
        });
    }
};

exports.removeInstalledApp = async (req, res) => {
    try {
        validateUser(req.user);
        const appId = req.params.appId;

        // Get app details from filesystem
        const appDetails = getAppDetails(appId);
        
        if (!appDetails) {
            throw new Error("App not found.");
        }

        // Check if this is a system app without updates
        if (appDetails.appType === 'system' && !appDetails.isUpdated) {
            throw new Error("System apps cannot be removed. They are part of the core system.");
        }

        // For system apps with updates, we only want to remove the update, not the app itself
        if (appDetails.appType === 'system' && appDetails.isUpdated) {
            // Only remove the version in storage/apps, not in server/apps
            const storageAppPath = path.join(__dirname, `../../storage/apps/${appId}`);
            
            // Update any listings that use this app to reference the original app
            const listings = await Listing.findAll();
            let updatedListings = 0;
            
            for (const listing of listings) {
                if (listing.integration && typeof listing.integration === 'string') {
                    try {
                        const integrationData = JSON.parse(listing.integration);
                        if (integrationData && integrationData.appId === appId) {
                            // No need to update the integration as it will still work with the system app
                            updatedListings++;
                        }
                    } catch (e) {
                        console.warn(`Invalid integration data for listing ${listing.id}`);
                    }
                }
            }
            
            if (fs.existsSync(storageAppPath)) {
                fs.rmSync(storageAppPath, { recursive: true });
            }
            
            return res.status(200).json({
                error: false,
                message: "App updates removed successfully."
            });
        }
        
        // For user apps, proceed with normal removal via the removeApp utility
        const result = await removeApp(appId);
        
        return res.status(200).json({
            error: false,
            message: "App removed successfully."
        });

    } catch (error) {
        return res.status(400).json({
            error: true,
            message: error.message || "Error in removing app."
        });
    }
};

exports.serveLogo = (req, res) => {
    try {
        const appId = req.params.appId;

        // Get the effective app directory (prioritizing storage/apps)
        const appDirectory = getAppDirectory(appId);
        if (!appDirectory) {
            return res.status(404).send('App not found');
        }

        // Check manifest
        const manifestPath = path.join(appDirectory, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
            return res.status(404).send('Manifest not found');
        }

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const appIcon = manifest.appIcon || "integration.png";

        // Check if icon exists
        const iconPath = path.join(appDirectory, 'public', appIcon);
        if (fs.existsSync(iconPath)) {
            return res.sendFile(iconPath);
        }

        // Default icon
        const defaultIconPath = path.join(__dirname, '../public/uploads/apps.png');
        if (fs.existsSync(defaultIconPath)) {
            return res.sendFile(defaultIconPath);
        }

        return res.status(404).send('Icon not found');

    } catch (error) {
        return res.status(500).send('Error serving app logo');
    }
};

exports.allInstalledApps = async (req, res) => {
    try {
        // Get apps directly from filesystem
        const apps = await getAllInstalledApps();

        return res.status(200).json({
            error: false,
            message: apps
        });

    } catch (error) {
        return res.status(400).json({
            error: true,
            message: error.message || "Error fetching installed apps."
        });
    }
};

exports.installedApps = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 20;
        
        // Get all apps directly from filesystem
        const apps = await getAllInstalledApps();

        // Paginate the apps array
        const paginatedResult = paginateApps(apps, page, limit);

        return res.status(200).json({
            error: false,
            message: paginatedResult
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: true,
            message: "Error in retrieving installed apps."
        });
    }
};

const getAxiosInstance = () => {
    return axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });
};

exports.connectTest = async (req, res) => {
    const { appId, localUrl, linkURL, config } = req.body;

    if (!appId) {
        return res.status(400).json({
            error: true,
            message: "No application id provided."
        });
    }

    try {
        // Check if app exists
        const appDetails = getAppDetails(appId);
        
        if (!appDetails) {
            return res.status(400).json({
                error: true,
                message: "Application not found."
            });
        }

        let appUrl = localUrl || linkURL;
        if (config.overrideurl) appUrl = config.overrideurl;

        appUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;

        // Get the effective app directory (prioritizing storage/apps)
        const appDirectory = getAppDirectory(appId);
        if (!appDirectory) {
            return res.status(400).json({
                error: true,
                message: "Application files not found."
            });
        }

        const modulePath = path.join(appDirectory, 'app.js');
        if (!fs.existsSync(modulePath)) {
            return res.status(400).json({
                error: true,
                message: "Application module not found."
            });
        }

        const moduleCode = fs.readFileSync(modulePath, 'utf8');

        let hasResponded = false;

        const connectionSuccess = async () => {
            if (hasResponded) return;
            hasResponded = true;
            return res.status(200).send("Connected!");
        };

        const connectionFailed = async (errorText) => {
            if (hasResponded) return;
            hasResponded = true;

            if (typeof errorText === 'string') {
                return res.status(400).send(errorText);
            } else if (errorText.response) {
                return res.status(400).send({
                    status: errorText.response.status,
                    response: errorText.response.data
                });
            } else {
                return res.status(400).send(errorText);
            }
        };

        // Create a proxy to wrap the testerInstance
        const testerInstanceProxy = new Proxy({
            config: config,
            payload: null,
            appUrl: appUrl,
            req,
            axios: getAxiosInstance(),
            connectionSuccess,
            connectionFailed
        }, {
            get: (target, prop) => {
                if (prop === 'connectionSuccess' || prop === 'connectionFailed') {
                    // Return a wrapped version of the function that checks hasResponded
                    return async (...args) => {
                        if (hasResponded) return;
                        return target[prop](...args);
                    };
                }
                return target[prop];
            }
        });

        const pluginNodeModulesPath = path.join(appDirectory, 'node_modules');

        const sandbox = {
            require: (module) => {
                if (!allowedModules.includes(module)) {
                    throw new Error(`Importing of module '${module}' is not allowed.`);
                }

                try {
                    const resolvedPath = require.resolve(module, { paths: [pluginNodeModulesPath] });
                    return require(resolvedPath);
                } catch (error) {
                    throw new Error(`Failed to load module '${module}' from plugin's node_modules: ${error.message}`);
                }
            },
            console,
            setTimeout,
            setInterval,
            clearTimeout,
            clearInterval,
            global: {
                eval: undefined,
                Function: undefined,
            }
        };

        try {
            const script = new vm.Script(moduleCode);
            const context = vm.createContext(sandbox);
            script.runInContext(context);
            if (typeof sandbox.global.connectionTest === 'function') {
                await sandbox.global.connectionTest(testerInstanceProxy);

                // If no response has been sent after the connectionTest completes,
                // we should fail the connection
                if (!hasResponded) {
                    await connectionFailed("Connection test completed without a response");
                }
            } else {
                return res.status(400).send("No connection test function found.");
            }
        } catch (error) {
            console.log(error);
            if (!hasResponded) {
                return res.status(400).send(error.stack);
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(400).send(err.stack);
    }
};

exports.runIntegratedApp = async (req, res) => {
    const userId = req.user?.id;
    let appId = req.params.appId;
    let listingId = req.params.listingId;

    if (appId === 'undefined') appId = null;
    if (listingId === 'undefined') listingId = null;

    if (!appId || !listingId) {
        return res.status(400).send("AppId or ListingId not provided.");
    }

    try {
        const listing = await Listing.findOne({
            where: {
                id: listingId,
                userId
            }
        });

        if (!listing) {
            return res.status(400).send("Listing not found.");
        }

        // Get the effective app directory (prioritizing storage/apps)
        const appDirectory = getAppDirectory(listing.integration.appId);
        if (!appDirectory) {
            return res.status(400).send("Application files not found.");
        }

        const modulePath = path.join(appDirectory, 'app.js');
        if (!fs.existsSync(modulePath)) {
            return res.status(400).send("Application module not found.");
        }
        
        const moduleCode = fs.readFileSync(modulePath, 'utf8');

        const decryptedConfig = listing.integration.config;

        req.config = decryptedConfig;
        req.payload = listing;

        let appUrl = listing.localUrl || listing.listingUrl;
        if (decryptedConfig.overrideurl) appUrl = decryptedConfig.overrideurl;

        appUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;

        let hasResponded = false;

        const sendResponse = async (template, responseCode, variables, background = null) => {
            if (hasResponded) return;
            hasResponded = true;

            // Look for templates in the app directory
            const templatesDir = path.join(appDirectory, 'templates');
            const templatePath = path.join(templatesDir, template);

            if (!fs.existsSync(templatePath)) {
                return res.status(400).send(`Template ${template} not found`);
            }

            let templateFromDisk = fs.readFileSync(templatePath, 'utf8');
            let mtemplateFromDisk = null;

            // Try to load mobile template
            const mTemplatePath = path.join(templatesDir, `m-${template}`);
            try {
                if (fs.existsSync(mTemplatePath)) {
                    mtemplateFromDisk = fs.readFileSync(mTemplatePath, 'utf8');
                }
            } catch (e) {
                mtemplateFromDisk = null;
            }

            if (variables) {
                variables.forEach(variable => {
                    if (mtemplateFromDisk) {
                        mtemplateFromDisk = mtemplateFromDisk.replace(variable.key, variable.value);
                    }
                    templateFromDisk = templateFromDisk.replace(variable.key, variable.value);
                });
            }

            const returnData = {
                fullHtml: mtemplateFromDisk,
                alwaysShowDetailedView: listing.integration.alwaysShowDetailedView || false,
                html: templateFromDisk,
                background
            };

            return res.status(responseCode).send(returnData);
        };

        const sendError = (error) => {
            if (hasResponded) return;
            hasResponded = true;

            if (typeof error === 'string') {
                return res.status(400).send(error);
            } else if (error.response) {
                return res.status(400).send({
                    status: error.response.status,
                    response: error.response.data
                });
            } else {
                return res.status(400).send(error);
            }
        };

        const application = {
            config: decryptedConfig,
            payload: listing,
            appUrl: appUrl,
            axios: getAxiosInstance(),
            req,
            sendResponse,
            sendError
        };

        const pluginNodeModulesPath = path.join(appDirectory, 'node_modules');

        const sandbox = {
            application,
            require: (module) => {
                if (!allowedModules.includes(module)) {
                    throw new Error(`Importing of module '${module}' is not allowed.`);
                }

                try {
                    // Resolve the module relative to the plugin's node_modules
                    const resolvedPath = require.resolve(module, { paths: [pluginNodeModulesPath] });
                    return require(resolvedPath);
                } catch (error) {
                    throw new Error(`Failed to load module '${module}' from plugin's node_modules: ${error.message}`);
                }
            },
            console,
            setTimeout,
            setInterval,
            clearTimeout,
            clearInterval,
            global: {
                eval: undefined,
                Function: undefined,
            }
        };

        try {
            const script = new vm.Script(moduleCode);
            const context = vm.createContext(sandbox);
            script.runInContext(context);
            if (typeof sandbox.global.initialize === 'function') {
                await sandbox.global.initialize(application);
            } else {
                console.log("No initialize function found.");
                return res.status(400).send();
            }
        } catch (error) {
            console.log(appId, error);
            return res.status(400).send();
        }
    } catch (err) {
        //console.log(err);
        return res.status(400).send();
    }
};

exports.reinstallNpmDependencies = async (req, res) => {
    try {
        console.log("Reinstalling npm dependencies for appId:", req.params.appId);
        validateUser(req.user);
        const appId = req.params.appId;

        if (!appId) {
            throw new Error("No application id provided.");
        }

        // Get app details from filesystem
        const appDetails = getAppDetails(appId);
        
        if (!appDetails) {
            throw new Error("App not found.");
        }

        // Get the effective app directory
        const appDirectory = getAppDirectory(appId);
        if (!appDirectory) {
            throw new Error("Application directory not found.");
        }

        console.log("App directory:", appDirectory);

        // Remove existing node_modules folder if it exists
        const nodeModulesPath = path.join(appDirectory, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
            fs.rmSync(nodeModulesPath, { recursive: true, force: true });
            console.log(`Removed existing node_modules for ${appId}`);
        }

        // Reinstall dependencies
        const result = await installDependencies(appDirectory);
        console.log(`Dependencies reinstalled for ${appId}: ${result}`);

        return res.status(200).json({
            error: false,
            message: "Dependencies reinstalled successfully",
            result
        });

    } catch (error) {
        console.error(`Error reinstalling dependencies:`, error);
        return res.status(400).json({
            error: true,
            message: error.message || "Error in reinstalling dependencies."
        });
    }
};
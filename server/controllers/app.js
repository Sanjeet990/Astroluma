const path = require('path');
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const AdmZip = require('adm-zip');
const rimraf = require('rimraf');
const vm = require('vm');
const { Op } = require('sequelize');
const { App, Listing, User } = require('../models');

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

// Install NPM dependencies for an app
const installDependencies = async (appDir) => {
    return new Promise((resolve, reject) => {
        const { exec } = require('child_process');
        const cmd = `cd ${appDir} && npm install --production`;
        
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(`Error installing dependencies: ${error.message}`);
            } else {
                resolve("Dependencies installed successfully");
            }
        });
    });
};

// Handler for app installation
const handleAppInstallation = async (zipPath, extractPath) => {
    try {
        validateUser({ isSuperAdmin: true }); // Simplified validation for helper function

        if (!fs.existsSync(zipPath)) {
            throw new Error("ZIP file not found.");
        }

        const zip = new AdmZip(zipPath);
        
        // Extract the ZIP file
        zip.extractAllTo(extractPath, true);

        if (!fs.existsSync(path.join(extractPath, 'manifest.json'))) {
            throw new Error("Invalid app package: missing manifest.json");
        }

        const manifest = JSON.parse(fs.readFileSync(path.join(extractPath, 'manifest.json'), 'utf8'));
        const package = JSON.parse(fs.readFileSync(path.join(extractPath, 'package.json'), 'utf8'));

        // Check if app already exists
        const existingApp = await App.findOne({
            where: {
                appId: manifest.appId
            }
        });

        if (existingApp) {
            throw new Error("App already exists.");
        }

        // Create a new app entry in the database
        const app = await App.create({
            appId: manifest.appId,
            appName: manifest.appName,
            appDescription: manifest.appDescription,
            category: manifest.category || "others",
            supportedThemes: JSON.stringify(manifest.supportedThemes || ["light", "dark"]),
            supportedViewportSize: manifest.supportedViewportSize || "default",
            requiresConfiguration: manifest.config?.length > 0 ? true : false,
            config: JSON.stringify(manifest.config || []),
            remoteVersion: manifest.version || "0.0.0",
            installedVersion: manifest.version || "0.0.0",
            npmInstalled: 0,
            appIcon: manifest.appIcon || "integration.png",
            coreSettings: manifest.config?.some(setting => setting.scope === "core") || false,
            configured: manifest.config?.some(setting => setting.scope === "core") ? false : true
        });

        // Start npm installation process
        process.nextTick(() => {
            installDependencies(extractPath)
                .then(async (msg) => {
                    console.log(msg);
                    await App.update(
                        { npmInstalled: 1 },
                        { where: { id: app.id } }
                    );
                    cleanupFiles([zipPath]);
                })
                .catch(async (error) => {
                    await App.update(
                        { npmInstalled: -1 },
                        { where: { id: app.id } }
                    );
                    cleanupFiles([zipPath, extractPath]);
                });
        });

        return {
            error: false,
            message: "The integration is added."
        };

    } catch (error) {
        throw error;
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
        const extractPath = path.join(
            __dirname,
            '../../storage/apps',
            req.file.filename.split('.').slice(0, -1).join('.')
        );

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
        const remoteInfo = await axios.get(`https://storage.reimaginedapps.com/app/${appId}/info`);
        
        if (!remoteInfo?.data?.zip) {
            throw new Error("App not found on remote server.");
        }

        const zipUrl = remoteInfo.data.zip;
        const zipPath = path.join(__dirname, `../../storage/uploads/${appId}.zip`);
        const extractPath = path.join(__dirname, `../../storage/apps/${appId}`);

        // Download the remote ZIP file
        await downloadFile(zipUrl, zipPath);

        // Install the app
        const result = await handleAppInstallation(zipPath, extractPath);
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
        const existingApp = await App.findOne({
            where: { appId }
        });

        if (!existingApp) {
            throw new Error("App not found.");
        }

        const remoteInfo = await axios.get(`https://storage.reimaginedapps.com/app/${appId}/info`);
        
        if (!remoteInfo?.data?.zip) {
            throw new Error("App not found on remote server.");
        }

        if (remoteInfo.data.version === existingApp.installedVersion) {
            return res.status(200).json({
                error: false,
                message: "App is already up to date."
            });
        }

        const zipUrl = remoteInfo.data.zip;
        const zipPath = path.join(__dirname, `../../storage/uploads/${appId}.zip`);
        const extractPath = path.join(__dirname, `../../storage/apps/${appId}`);

        // Download the remote ZIP file
        await downloadFile(zipUrl, zipPath);

        // Extract and check manifest
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        const manifestPath = path.join(extractPath, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
            cleanupFiles([zipPath, extractPath]);
            throw new Error("Invalid app package: missing manifest.json");
        }

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Update app information
        await App.update({
            appName: manifest.appName,
            appDescription: manifest.appDescription,
            category: manifest.category || existingApp.category,
            supportedThemes: JSON.stringify(manifest.supportedThemes || ["light", "dark"]),
            supportedViewportSize: manifest.supportedViewportSize || "default",
            requiresConfiguration: manifest.config?.length > 0 ? true : false,
            config: JSON.stringify(manifest.config || []),
            remoteVersion: manifest.version,
            installedVersion: manifest.version,
            npmInstalled: 0,
            coreSettings: manifest.config?.some(setting => setting.scope === "core") || false,
            configured: manifest.config?.some(setting => setting.scope === "core") ? false : true,
            appIcon: manifest.appIcon || "integration.png"
        }, {
            where: { id: existingApp.id }
        });

        // Start npm installation process
        process.nextTick(() => {
            installDependencies(extractPath)
                .then(async (msg) => {
                    console.log(msg);
                    await App.update(
                        { npmInstalled: 1 },
                        { where: { id: existingApp.id } }
                    );
                    cleanupFiles([zipPath]);
                })
                .catch(async (error) => {
                    await App.update(
                        { npmInstalled: -1 },
                        { where: { id: existingApp.id } }
                    );
                    cleanupFiles([zipPath, extractPath]);
                });
        });

        return res.status(200).json({
            error: false,
            message: "The integration has been updated."
        });

    } catch (error) {
        // Clean up files in case of any error
        cleanupFiles([
            path.join(__dirname, `../../storage/uploads/${req.params.appId}.zip`),
            path.join(__dirname, `../../storage/apps/${req.params.appId}`)
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
        
        // Check if app exists
        const app = await App.findOne({
            where: { appId }
        });

        if (!app) {
            throw new Error("App not found.");
        }

        // Update listings that use this app
        await Listing.update(
            { integration: null },
            { 
                where: {
                    integration: {
                        [Op.ne]: null
                    }
                }
            }
        );

        // Delete the app
        await App.destroy({
            where: { appId }
        });

        // Remove app directory
        const appPath = path.join(__dirname, `../../storage/apps/${appId}`);
        cleanupFiles([appPath]);

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

exports.syncFromDisk = async (req, res) => {
    try {
        validateUser(req.user);

        const appsDir = path.join(__dirname, '../../storage/apps');
        
        if (!fs.existsSync(appsDir)) {
            fs.mkdirSync(appsDir, { recursive: true });
            return res.status(200).json({
                error: false,
                message: "Apps directory created. No apps found to sync."
            });
        }

        const appsInFolder = fs.readdirSync(appsDir)
            .filter(folder => fs.statSync(path.join(appsDir, folder)).isDirectory());

        // Get apps from database
        const appsInDatabase = await App.findAll();
        const appsInDatabaseMap = new Map(appsInDatabase.map(app => [app.appId, app]));

        const appsToDelete = [];
        const appsToAdd = [];

        appsInFolder.forEach(appId => {
            if (!appsInDatabaseMap.has(appId)) {
                appsToAdd.push(appId);
            }
        });

        appsInDatabase.forEach(app => {
            if (!appsInFolder.includes(app.appId)) {
                appsToDelete.push(app.appId);
            }
        });

        // Delete apps that don't exist in folder
        for (const appId of appsToDelete) {
            await App.destroy({ where: { appId } });
            // Update listings with this integration
            await Listing.update(
                { integration: null },
                { 
                    where: {
                        integration: {
                            [Op.ne]: null
                        }
                    }
                }
            );
        }

        // Add apps from folder that don't exist in database
        for (const appId of appsToAdd) {
            const manifestPath = path.join(appsDir, appId, 'manifest.json');
            const packagePath = path.join(appsDir, appId, 'package.json');

            if (!fs.existsSync(manifestPath) || !fs.existsSync(packagePath)) {
                continue;
            }

            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

            await App.create({
                appId: manifest.appId,
                appName: manifest.appName,
                appDescription: manifest.appDescription,
                category: manifest.category || "others",
                supportedThemes: JSON.stringify(manifest.supportedThemes || ["light", "dark"]),
                supportedViewportSize: manifest.supportedViewportSize || "default",
                requiresConfiguration: manifest.config?.length > 0 ? true : false,
                config: JSON.stringify(manifest.config || []),
                remoteVersion: manifest.version || "0.0.0",
                installedVersion: manifest.version || "0.0.0",
                npmInstalled: fs.existsSync(path.join(appsDir, appId, 'node_modules')) ? 1 : 0,
                appIcon: manifest.appIcon || "integration.png",
                coreSettings: manifest.config?.some(setting => setting.scope === "core") || false,
                configured: manifest.config?.some(setting => setting.scope === "core") ? false : true
            });
        }

        return res.status(200).json({
            error: false,
            message: `Apps synced successfully. Added: ${appsToAdd.length}, Removed: ${appsToDelete.length}`
        });

    } catch (error) {
        return res.status(400).json({
            error: true,
            message: error.message || "Error syncing apps from disk."
        });
    }
};

exports.serveLogo = (req, res) => {
    try {
        const appId = req.params.appId;
        const appsDir = path.join(__dirname, '../../storage/apps');
        
        // Check app directory
        const appDir = path.join(appsDir, appId);
        if (!fs.existsSync(appDir)) {
            return res.status(404).send('App not found');
        }

        // Check manifest
        const manifestPath = path.join(appDir, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
            return res.status(404).send('Manifest not found');
        }

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const appIcon = manifest.appIcon || "integration.png";

        // Check if icon exists
        const iconPath = path.join(appDir, 'icons', appIcon);
        if (fs.existsSync(iconPath)) {
            return res.sendFile(iconPath);
        }

        // Default icon
        const defaultIconPath = path.join(__dirname, '../../public/uploads/apps.png');
        if (fs.existsSync(defaultIconPath)) {
            return res.sendFile(defaultIconPath);
        }

        return res.status(404).send('Icon not found');

    } catch (error) {
        return res.status(500).send('Error serving app logo');
    }
};

exports.installedApps = async (req, res) => {
    try {
        // Get apps from database
        const apps = await App.findAll({
            where: {
                npmInstalled: 1
            },
            order: [['appName', 'ASC']]
        });

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

exports.allInstalledApps = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        // Get apps from database with pagination
        const { count, rows } = await App.findAndCountAll({
            order: [['appName', 'ASC']],
            limit,
            offset
        });

        return res.status(200).json({
            error: false,
            message: {
                appList: rows,
                total: count,
                page,
                pages: Math.ceil(count / limit)
            }
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
        const app = await App.findOne({
            where: { appId }
        });

        if (!app) {
            return res.status(400).json({
                error: true,
                message: "Application not found."
            });
        }

        let appUrl = localUrl || linkURL;
        if (config.overrideurl) appUrl = config.overrideurl;

        appUrl = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;

        const modulePath = path.join(__dirname, `../../storage/apps/${appId}/app.js`);
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

        const pluginNodeModulesPath = path.join(__dirname, `../../storage/apps/${appId}/node_modules`);

        const allowedModules = ['axios', 'lodash', 'moment', 'crypto-js'];

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

        const modulePath = path.join(__dirname, `../../storage/apps/${listing.integration.appId}/app.js`);
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

            let templateFromDisk = fs.readFileSync(path.join(__dirname, `../../storage/apps/${listing.integration.appId}/templates/${template}`), 'utf8');
            let mtemplateFromDisk = null;

            try {
                mtemplateFromDisk = fs.readFileSync(path.join(__dirname, `../../storage/apps/${listing.integration.appId}/templates/m-${template}`), 'utf8');
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

        const allowedModules = ['axios', 'lodash', 'moment', 'crypto-js'];

        const pluginNodeModulesPath = path.join(__dirname, `../../storage/apps/${listing.integration.appId}/node_modules`);

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
                eval: undefined,   // Disable eval
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
        console.log(err);
        return res.status(400).send();
    }
};
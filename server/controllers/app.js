const fs = require('fs');
const vm = require('vm');
const path = require('path');
const extract = require('extract-zip');
const Listing = require('../models/Listing');
const App = require('../models/App');
const axios = require('axios');
const allowedModules = require('../utils/allowedModules');
const { spawn } = require('child_process');

// Common utility functions
const validateUser = (user) => {
    if (!user || user.isSuperAdmin === false) {
        throw new Error("You are not authorized to install apps.");
    }
};

const validateAppFiles = async (extractPath) => {
    const packagePath = path.join(extractPath, 'package.json');
    const manifestPath = path.join(extractPath, 'manifest.json');

    if (!fs.existsSync(packagePath) || !fs.existsSync(manifestPath)) {
        throw new Error("Required files (package.json or manifest.json) are missing.");
    }

    const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    if (!package.name || !manifest.appId) {
        throw new Error("Invalid package.json or manifest.json structure.");
    }

    if (package.name !== manifest.appId) {
        throw new Error("App name in package.json and manifest.json do not match.");
    }

    return { package, manifest };
};

const cleanupFiles = (paths) => {
    paths.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            if (fs.lstatSync(filePath).isDirectory()) {
                fs.rmSync(filePath, { recursive: true });
            } else {
                fs.unlinkSync(filePath);
            }
        }
    });
};

const saveApp = async (manifest, package) => {
    const hasCoreSettings = manifest.config?.some(setting => setting.scope === "core");

    const app = new App({
        appId: manifest.appId,
        appName: manifest.appName || manifest.appId,
        description: package.description || manifest.appId,
        version: package.version || "1.0.0",
        npmInstalled: 0,
        coreSettings: hasCoreSettings || false,
        configured: hasCoreSettings ? false : true,
        appIcon: manifest.appIcon || "integration.png"
    });

    await app.save();

    return app;
};

const installDependencies = (targetDir) => {
    return new Promise((resolve, reject) => {
        const installProcess = spawn('npm', ['install --silent'], {
            cwd: path.resolve(targetDir), // Set the target directory as the working directory
            stdio: 'inherit', // Pipe output to the parent process (optional)
            shell: true, // For better cross-platform compatibility
        });

        installProcess.on('close', (code) => {
            if (code === 0) {
                resolve(`Dependencies installed successfully in ${targetDir}`);
            } else {
                reject(new Error(`npm install failed with exit code ${code}`));
            }
        });

        installProcess.on('error', (err) => {
            reject(err);
        });
    });
}

const handleAppInstallation = async (zipPath, extractPath) => {
    try {
        await extract(zipPath, { dir: extractPath });
        const { package, manifest } = await validateAppFiles(extractPath);

        const appExists = await App.findOne({ appId: manifest.appId });
        if (appExists) {
            throw new Error(`${manifest.appName} already exists`);
        }

        // For zip installations, move to final location
        const finalPath = path.join(__dirname, '../../storage/apps', manifest.appId);
        if (extractPath !== finalPath) {
            if (fs.existsSync(finalPath)) {
                fs.rmSync(finalPath, { recursive: true });
            }
            fs.renameSync(extractPath, finalPath);
        }

        const app = await saveApp(manifest, package);

        // Start npm installation process
        process.nextTick(() => {
            installDependencies(finalPath)
                .then(async (msg) => {
                    console.log(msg);
                    app.npmInstalled = 1;
                    await app.save();
                    cleanupFiles([zipPath]);
                })
                .catch(async (error) => {
                    app.npmInstalled = -1;
                    await app.save();
                    cleanupFiles([zipPath, extractPath]);
                });
        });

        return {
            error: false,
            message: "The integration is added."
        };

    } catch (error) {
        cleanupFiles([zipPath, extractPath]);
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
            const writer = fs.createWriteStream(zipPath);
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream'
            });

            response.data.pipe(writer);

            writer.on('finish', () => {
                writer.close();
                resolve();
            });

            writer.on('error', (error) => {
                writer.close();
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};

exports.installRemoteApp = async (req, res) => {
    const zipPath = path.join(__dirname, '../public/uploads/integrations', `${req.params.appId}`);
    const extractPath = path.join(__dirname, '../../storage/apps', req.params.appId);

    try {
        validateUser(req.user);

        const appId = req.params.appId;
        if (!appId) {
            throw new Error("No application id provided.");
        }

        const appUrl = `https://cdn.jsdelivr.net/gh/Sanjeet990/AstrolumaApps/apps/${appId}.zip`;

        // Download file first
        await downloadFile(appUrl, zipPath);

        // Then handle installation
        const result = await handleAppInstallation(zipPath, extractPath);

        return res.status(200).json(result);

    } catch (error) {
        // Clean up files in case of any error
        cleanupFiles([zipPath, extractPath]);

        return res.status(400).json({
            error: true,
            message: error.message || "Error in installing app."
        });
    }
};

exports.syncFromDisk = async (req, res) => {
    const loggedinuser = req.user;

    if (!loggedinuser || loggedinuser.isSuperAdmin === false) {
        return res.status(400).json({
            error: true,
            message: "You are not authorized to install apps."
        });
    }

    const appDir = path.join(__dirname, '../../storage/apps');

    const appsInFolder = fs.readdirSync(appDir);

    const appsInDatabase = await App.find({});
    const appsInDatabaseMap = new Map();

    appsInDatabase.forEach(app => {
        appsInDatabaseMap.set(app.appId, app);
    });

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

    appsToDelete.forEach(async appId => {
        await App.deleteOne({ appId });
        //Update the listing with the integration -> integration = null
        await Listing.updateMany({ "integration.appId": appId }, { $set: { integration: null } });
    });

    appsToAdd.forEach(async appId => {
        const manifestPath = path.join(appDir, appId, 'manifest.json');
        const packagePath = path.join(appDir, appId, 'package.json');

        if (!fs.existsSync(manifestPath) || !fs.existsSync(packagePath)) {
            return;
        }

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        const app = new App({
            appId: manifest.appId,
            appName: manifest.appName || manifest.appId,
            description: package.description || manifest.appId,
            version: package.version || "1.0.0",
            npmInstalled: 1,
            coreSettings: manifest.config?.some(setting => setting.scope === "core") || false,
            configured: manifest.config?.some(setting => setting.scope === "core") ? false : true,
            appIcon: manifest.appIcon || "integration.png"
        });

        await app.save();

    });

    return res.status(200).json({
        error: false,
        message: "Synced from disk."
    });
}

exports.removeInstalledApp = async (req, res) => {
    const loggedinuser = req.user;

    if (!loggedinuser || loggedinuser.isSuperAdmin === false) {
        return res.status(400).json({
            error: true,
            message: "You are not authorized to remove apps."
        });
    }

    const appId = req.params.appId;

    if (!appId) {
        return res.status(400).json({
            error: true,
            message: "No application id provided."
        });
    }

    try {
        const app = await App.findOne({ appId });

        if (!app) {
            return res.status(400).json({
                error: true,
                message: "App not found."
            });
        }

        const appPath = path.join(__dirname, `../../storage/apps/${appId}`);

        if (fs.existsSync(appPath)) {
            fs.rmSync(appPath, { recursive: true });
        }

        await App.deleteOne({ appId });
        //Update the listing with the integration -> integration = null
        await Listing.updateMany({ "integration.appId": appId }, { $set: { integration: null } });

        return res.status(200).json({
            error: false,
            message: "The integration is removed."
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: true,
            message: "Error in removing app."
        });
    }
}

exports.serveLogo = async (req, res) => {
    const appId = req.params.appId;
    const defaultLogoPath = path.join(__dirname, '../public/images/integration.png');

    try {
        if (!appId) {
            throw new Error("No application id provided.");
        }

        const appPath = path.join(__dirname, `../../storage/apps/${appId}`);

        if (!fs.existsSync(appPath)) {
            throw new Error("App not found.");
        }

        const manifestPath = path.join(appPath, 'manifest.json');
        if (!fs.existsSync(manifestPath)) {
            throw new Error("Manifest not found.");
        }

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const appIcon = manifest.appIcon || "logo.png";

        const appIconPath = path.join(appPath, "public", appIcon);

        if (!fs.existsSync(appIconPath)) {
            throw new Error("Icon not found.");
        }

        //serve the icon as image
        res.sendFile(appIconPath);
    } catch (error) {
        res.sendFile(defaultLogoPath);
    }
}

exports.allInstalledApps = async (req, res) => {
    try {
        const apps = await App.find({}).select('appId');

        const onlyAppIds = apps?.map(app => app.appId);

        return res.status(200).json({
            error: false,
            message: onlyAppIds || []
        });

    } catch (error) {
        return res.status(400).json({
            error: true,
            message: "Error in retrieving installed apps."
        });
    }
}

exports.installedApps = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const appList = await App.find({})
            .skip(skip)
            .limit(limit);

        const total = await App.countDocuments({});

        return res.status(200).json({
            error: false,
            message: {
                appList,
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: true,
            message: "Error in retrieving installed apps."
        });
    }
}

exports.connectTest = async (req, res) => {
    const { appId, localUrl, linkURL, config } = req.body;

    if (!appId) {
        return res.status(400).json({
            error: true,
            message: "No application id provided."
        });
    }

    try {
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
        }

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
        }

        // Create a proxy to wrap the testerInstance
        const testerInstanceProxy = new Proxy({
            config: config,
            payload: null,
            appUrl: appUrl,
            req,
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
            const context = new vm.createContext(sandbox);
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
}

exports.runIntegratedApp = async (req, res) => {

    const userId = req.user?._id;
    let appId = req.params.appId;
    let listingId = req.params.listingId;

    if (appId === 'undefined') appId = null;
    if (listingId === 'undefined') listingId = null;

    if (!appId || !listingId) {
        return res.status(400).send("AppId or ListingId not provided.");
    }

    try {
        const listing = await Listing.findOne({ userId, _id: listingId });

        if (!listing) {
            return res.status(400).send("Listing not found.");
        }

        const modulePath = path.join(__dirname, `../../storage/apps/${listing.integration.appId}/app.js`);
        const moduleCode = fs.readFileSync(modulePath, 'utf8');

        //const decryptedBytes = CryptoJS.AES.decrypt(integration.config, getSecretKey());
        //const decryptedConfig = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));
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
            }

            return res.status(responseCode).send(returnData);
        }

        const sendError = (error) => {
            if (hasResponded) return;
            hasResponded = true;

            if (typeof error === 'string') {
                return res.status(400).send(errorText);
            } else if (error.response) {
                return res.status(400).send({
                    status: error.response.status,
                    response: error.response.data
                });
            } else {
                return res.status(400).send(error);
            }
        }


        const application = {
            config: decryptedConfig,
            payload: listing,
            appUrl: appUrl,
            req,
            sendResponse,
            sendError
        }

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
            const context = new vm.createContext(sandbox);
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
}
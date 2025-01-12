const fs = require('fs');
const vm = require('vm');
const path = require('path');
const Listing = require('../models/Listing');
const App = require('../models/App');
const allowedModules = require('../utils/allowedModules');


exports.installedApps = async (req, res) => {
    
    //find all installed apps
    try {
        const appList = await App.find({});

        return res.status(200).json({
            error: false,
            message: appList
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
        return res.status(400).send("zxc");
    }

    try {
        const listing = await Listing.findOne({ userId, _id: listingId });

        if (!listing) {
            return res.status(400).send("vv");
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
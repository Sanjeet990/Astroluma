const fs = require('fs');
const path = require('path');
const Integration = require('../models/Integration');
const Listing = require('../models/Listing');
const CryptoJS = require('crypto-js');

exports.listInstalledApps = (req, res) => {
    const userId = req.user?._id;

    Integration.find({ userId })
        .then(data => {
            //make the config in each item as null
            data = data.map(item => { item.config = null; return item; });

            return res.status(200).json({
                error: false,
                message: data
            });
        })
        .catch(() => {
            return res.status(400).json({
                error: true,
                message: "Error in fetching installed apps."
            });
        });
}

exports.listAllApps = (req, res) => {

    const appsDir = path.join(__dirname, '../apps'); // Path to the apps directory
    const appDirs = fs.readdirSync(appsDir); // Read the apps directory

    const apps = [];

    for (const appDir of appDirs) {
        const manifestPath = path.join(appsDir, appDir, 'manifest.json'); // Path to the manifest.json file

        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); // Read and parse the manifest.json file

            // Only add the app to the list if the folder name matches the appId
            if (appDir === manifest.appId) {
                apps.push(manifest);
            }
        }
    }

    return res.status(200).json({
        error: false,
        message: apps
    });

}

exports.activateIntegration = async (req, res) => {
    //Get form data from req object
    const userId = req.user?._id;

    const { config, integrationName, appId } = req.body;
    // Return error if intergration name and appId is not provided
    if (!integrationName || !appId) {
        return res.status(400).json({
            error: true,
            message: "Integration name and appId is required."
        });
    }

    //find the appIcon from apps folders manifest.json
    const appsDir = path.join(__dirname, '../apps'); // Path to the apps directory
    const appDirs = fs.readdirSync(appsDir); // Read the apps directory

    let appIcon = '';
    let autoRefreshAfter = 0;
    let alwaysShowDetailedView = false;

    for (const appDir of appDirs) {
        const manifestPath = path.join(appsDir, appDir, 'manifest.json'); // Path to the manifest.json file

        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); // Read and parse the manifest.json file

            if (manifest.appId === appId) {
                appIcon = manifest.appIcon;
                autoRefreshAfter = manifest.autoRefreshAfterSeconds;
                alwaysShowDetailedView = manifest.alwaysShowDetailedView;
                break;
            }
        }
    }

    try {

        const encryptedConfig = CryptoJS.AES.encrypt(JSON.stringify(config), process.env.SECRET_KEY).toString();

        const integration = await new Integration({
            integrationName,
            appId,
            autoRefreshAfter,
            appIcon,
            config: encryptedConfig,
            alwaysShowDetailedView,
            userId
        }).save();

        return res.status(200).json({
            error: false,
            message: "Integration activated.",
            data: integration
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            error: true,
            message: "Error in activating integration."
        });
    }

}

exports.removeApp = async (req, res) => {
    const userId = req.user?._id;
    let appId = req.params.appId;

    if (appId === 'undefined') appId = null;

    //put a validation
    if (!appId) {
        return res.status(400).json({
            error: true,
            message: "AppId is required."
        });
    }

    try {
        const integration = await Integration
            .findOneAndDelete({ userId, _id: appId });

        if (!integration) {
            return res.status(400).json({
                error: true,
                message: "Integration not found."
            });
        } else {
            //also remove association from listing
            await Listing.updateMany({ integration: appId }, { integration: null });

            return res.status(200).json({
                error: false,
                message: "Integration removed."
            });
        }
    }
    catch (err) {
        return res.status(400).json({
            error: true,
            message: "Error in removing integration."
        });
    }

}

exports.runIntegratedApp = async (req, res) => {
    const userId = req.user?._id;
    let appId = req.params.appId;
    let listingId = req.params.listingId;

    if (appId === 'undefined') appId = null;
    if (listingId === 'undefined') listingId = null;

    //put a validation
    if (!appId || !listingId) {
        return res.status(400).send();
    }

    //find listing info
    try {
        const [integration, listing] = await Promise.all([
            Integration.findOne({ userId, _id: appId }),
            Listing.findOne({ userId, _id: listingId })
        ]);

        //if any of these empty
        if (!integration || !listing) {
            return res.status(400).send();
        }

        if (listing.integration.toString() !== appId) {
            return res.status(400).send();
        }

        const modulePath = `../apps/${integration.appId}/app.js`;

        // Dynamically require the module
        let appModule;
        try {
            appModule = require(modulePath);
        } catch (error) {
            return res.status(401).send();
        }

        // Ensure the module has the initialize function
        if (typeof appModule.initialize !== 'function') {
            return res.status(402).send();
        }

        const decryptedBytes = CryptoJS.AES.decrypt(integration.config, process.env.SECRET_KEY);
        const decryptedConfig = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

        // Put the config in the req object
        req.config = decryptedConfig;
        req.payload = listing;

        const sendResponse = async (template, responseCode, variables, background = null) => {
            let templateFromDisk = fs.readFileSync(path.join(__dirname, `../apps/${integration.appId}/templates/${template}`), 'utf8');
            let mtemplateFromDisk = null;

            try {
                mtemplateFromDisk = fs.readFileSync(path.join(__dirname, `../apps/${integration.appId}/templates/m-${template}`), 'utf8');
            } catch (e) {
                mtemplateFromDisk = null;
            }

            if (variables) {
                variables.forEach(variable => {
                    if(mtemplateFromDisk) {
                        mtemplateFromDisk = mtemplateFromDisk.replace(variable.key, variable.value);
                    }
                    templateFromDisk = templateFromDisk.replace(variable.key, variable.value);
                });
            }

            const returnData = {
                fullHtml: mtemplateFromDisk,
                alwaysShowDetailedView: integration.alwaysShowDetailedView || false,
                html: templateFromDisk,
                background
            }

            return res.status(responseCode).send(returnData);
        }

        const sendError = (errorCode, errorMessage) => {
            return res.status(errorCode).send(errorMessage);
        }

        const application = {
            config: decryptedConfig,
            payload: listing,
            req,
            sendResponse,
            sendError
        }

        try {
            await appModule.initialize(application);
        } catch (error) {
            console.log(error);
            return res.status(400).send();
        }
    }
    catch (err) {
        //console.log(err);
        return res.status(400).send();
    }
}
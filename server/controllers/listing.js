const { Listing, App, Page } = require("../models");
const stream = require('stream');
const { spawn } = require('child_process');
const { Op } = require('sequelize');
const { isValidStream } = require("../utils/apiutils");
const fs = require('fs');
const path = require('path');
const { getAllInstalledApps } = require("../utils/appUtils");

exports.saveFolder = async (req, res) => {
    const userId = req.user.id;
    let { parentId, listingId, folderName, folderIcon, folderURL, showInSidebar, showOnFeatured } = req.body;

    if (listingId === 'undefined') listingId = null;

    // Check validations
    if (!folderName || !folderIcon) {
        return res.status(400).json({
            error: true,
            message: "All fields are required"
        });
    }

    try {
        if (listingId) {
            // If folder exists, update the folder
            const [updatedCount] = await Listing.update({
                listingName: folderName,
                listingIcon: folderIcon,
                listingUrl: folderURL,
                inSidebar: showInSidebar,
                onFeatured: showOnFeatured
            }, {
                where: {
                    id: listingId,
                    userId
                }
            });

            if (updatedCount > 0) {
                return res.status(200).json({
                    error: false,
                    message: "Folder updated"
                });
            } else {
                return res.status(400).json({
                    error: true,
                    message: "Folder not found"
                });
            }
        } else {
            // Add the new folder
            const newFolder = await Listing.create({
                listingName: folderName,
                listingIcon: folderIcon,
                listingUrl: folderURL,
                listingType: "category",
                parentId,
                onFeatured: showOnFeatured,
                inSidebar: showInSidebar,
                userId
            });

            return res.status(200).json({
                error: false,
                message: "Folder saved",
                data: newFolder
            });
        }
    } catch (error) {
        console.error("Error saving folder:", error);
        return res.status(400).json({
            error: true,
            message: "Error saving folder"
        });
    }
};

exports.listingDetails = async (req, res) => {
    const userId = req.user.id;
    let listingId = req.params.listingId;

    if (!listingId || listingId === 'undefined') listingId = null;

    try {
        let listing = null;

        if (listingId) {
            // Fetch listing details
            listing = await Listing.findOne({
                where: {
                    id: listingId,
                    userId
                }
            });
        }

        // Find pages
        const pages = await Page.findAll({
            where: {
                userId,
                isPublished: true
            },
            attributes: { exclude: ['pageContent'] } // Exclude pageContent field
        });

        //select apps from the db
        const appList = await getAllInstalledApps(userId);

        const appsDir = path.join(__dirname, '../apps'); // Path to the apps directory

        const apps = [];

        for (const app of appList) {
            const manifestPath = path.join(appsDir, app.appId, 'manifest.json'); // Path to the manifest.json file

            if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); // Read and parse the manifest.json file

                // Only add the app to the list if the folder name matches the appId
                if (app.appId === manifest.appId) {
                    apps.push(manifest);
                }
            }
        }

        // Return details
        return res.status(200).json({
            error: false,
            message: {
                integrations: apps,
                pages,
                listing
            }
        });

    } catch (error) {
        console.error('Error fetching listing details:', error);
        return res.status(400).json({
            error: true,
            message: "Error fetching listing details"
        });
    }
};

exports.generatePreview = async (req, res) => {
    const listingId = req.params.listingId;

    if (!listingId || listingId === 'undefined') {
        return res.status(400).json({
            error: true,
            message: "Preview Id must be supplied."
        });
    }

    try {
        // Fetch listing details
        const listing = await Listing.findByPk(listingId);

        if (!listing) {
            return res.status(404).json({
                error: true,
                message: "Listing not found."
            });
        }

        // Setup ffmpeg process
        const ffmpeg = spawn('ffmpeg', [
            '-rtsp_transport', 'tcp',
            '-analyzeduration', '1000',
            '-probesize', '1000',
            '-i', listing.listingUrl,
            '-frames:v', '1',
            '-vf', 'scale=320:180',
            '-preset', 'ultrafast',
            '-f', 'image2',
            '-'
        ]);

        // Setup pass-through stream
        const passthrough = new stream.PassThrough();

        // Pipe ffmpeg output to pass-through stream
        ffmpeg.stdout.pipe(passthrough);

        // Handle ffmpeg errors
        ffmpeg.on('error', (err) => {
            console.error('Error capturing frame:', err);
            return res.status(400).json({
                error: true,
                message: "Error capturing frame"
            });
        });

        // Handle ffmpeg process close
        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                console.error(`FFmpeg process exited with code ${code}`);
            }
        });

        // Set response headers and pipe pass-through stream to response
        res.setHeader('Content-Type', 'image/jpeg');
        passthrough.pipe(res);

    } catch (error) {
        console.error('Error fetching listing:', error);
        return res.status(500).json({
            error: true,
            message: "Error fetching listing details."
        });
    }
};

const getBreadcrumb = async (listingId, userId) => {
    try {
        // Initialize breadcrumb array
        const breadcrumb = [];
        
        // If no listing ID, return empty breadcrumb
        if (!listingId) {
            return breadcrumb;
        }

        // Fetch initial listing details
        const listing = await Listing.findOne({
            where: {
                id: listingId,
                userId
            }
        });

        if (!listing) {
            return breadcrumb; // Return empty array if listing not found
        }
        
        // Recursive function to fetch breadcrumb
        const fetchBreadcrumb = async (currentId) => {
            if (!currentId) return;
            
            const parentListing = await Listing.findOne({
                where: {
                    id: currentId,
                    userId
                }
            });

            if (parentListing) {
                breadcrumb.unshift({ 
                    id: parentListing.id, 
                    listingName: parentListing.listingName 
                });
                
                if (parentListing.parentId) {
                    await fetchBreadcrumb(parentListing.parentId); // Recursively fetch parent breadcrumb
                }
            }
        }

        // Start fetching breadcrumb from current listing's parent
        if (listing.parentId) {
            await fetchBreadcrumb(listing.parentId);
        }

        return breadcrumb;
    } catch (error) {
        console.error("Error fetching breadcrumb:", error);
        return []; // Return empty array on error
    }
}

exports.listItems = async (req, res) => {
    const userId = req.user.id;
    let listingId = req.params.listingId;

    if (!listingId || listingId === 'undefined') listingId = null;

    try {
        let query;
        if (!listingId) {
            // If parentId is null, select records where parentId=null, onFeatured is true, and userId is userId
            query = {
                parentId: null,
                onFeatured: true,
                userId,
                listingType: {
                    [Op.ne]: "stream"
                }
            };
        } else {
            // If parentId is not null, select records where parentId=parentId and userId is userId
            query = {
                parentId: listingId,
                userId,
                listingType: {
                    [Op.ne]: "stream"
                }
            };
        }

        // Get items, parent folder and breadcrumb in parallel
        const [items, parentFolder, breadcrumb] = await Promise.all([
            // list all items of this listing id
            Listing.findAll({
                where: query,
                order: [['sortOrder', 'ASC']]
            }),

            // find listing details
            listingId ? Listing.findOne({
                where: {
                    id: listingId,
                    userId
                }
            }) : null,
            
            getBreadcrumb(listingId, userId)
        ]);

        //return details
        return res.status(200).json({
            error: false,
            message: {
                items,
                parentFolder,
                breadcrumb
            }
        });
    } catch (error) {
        console.error('Error listing items:', error);
        return res.status(400).json({
            error: true,
            message: "Error listing items"
        });
    }
};

exports.listStreams = async (req, res) => {
    const userId = req.user.id;

    try {
        const items = await Listing.findAll({
            where: {
                parentId: null,
                userId,
                listingType: 'stream'
            },
            order: [['sortOrder', 'ASC']]
        });

        const breadcrumb = await getBreadcrumb(null, userId);

        return res.status(200).json({
            error: false,
            message: {
                items,
                parentFolder: null,
                breadcrumb
            }
        });
    } catch (error) {
        console.error('Error fetching stream list:', error);
        return res.status(500).json({
            error: true,
            message: "Failed to fetch stream list."
        });
    }
};

exports.manageListItems = async (req, res) => {
    const userId = req.user.id;
    let listingId = req.params.listingId;
    const type = req.params.type || 'listing';

    if (!listingId || listingId === 'undefined') listingId = null;

    try {
        const query = {
            parentId: listingId,
            userId
        };
        
        // Handle streaming vs non-streaming types
        if (type === 'streaming') {
            query.listingType = 'stream';
        } else {
            query.listingType = {
                [Op.ne]: 'stream'
            };
        }

        const items = await Listing.findAll({
            where: query,
            order: [['sortOrder', 'ASC']]
        });

        const parentFolder = await Listing.findOne({
            where: {
                id: listingId,
                userId
            }
        });

        const breadcrumb = await getBreadcrumb(listingId, userId);

        return res.status(200).json({
            error: false,
            message: {
                items,
                parentFolder,
                breadcrumb
            }
        });
    } catch (error) {
        console.error('Error fetching list items:', error);
        return res.status(500).json({
            error: true,
            message: "Failed to fetch list items."
        });
    }
};

exports.saveLink = async (req, res) => {
    const userId = req.user.id;
    const { parentId, listingId, linkName, linkIcon, linkURL, localUrl, description, showInSidebar, showOnFeatured } = req.body;
    let integration = req.body.integration;

    if (!integration || integration === 'undefined' || integration === 'null') integration = null;

    if (!linkName || !linkIcon || (!linkURL && !localUrl)) {
        return res.status(400).json({
            error: true,
            message: "All fields are required"
        });
    }

    let integrationData = null;

    if (integration) {
        //try to load integration manifest
        const appsDir = path.join(__dirname, '../apps');
        const manifestPath = path.join(appsDir, integration.package, 'manifest.json');

        if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

            if (manifest?.appId === integration.package) {
                integrationData = {
                    appId: integration?.package,
                    alwaysShowDetailedView: manifest?.alwaysShowDetailedView || false,
                    autoRefreshAfter: manifest?.autoRefreshAfterSeconds || 0,
                    config: integration?.config
                }
            }
        }
    }

    try {
        if (listingId) {
            // Update existing link
            const [updatedRowCount] = await Listing.update({
                listingName: linkName,
                listingIcon: linkIcon,
                listingUrl: linkURL,
                localUrl,
                description,
                onFeatured: showOnFeatured,
                inSidebar: showInSidebar,
                integration: integrationData
            }, {
                where: { 
                    id: listingId, 
                    userId 
                }
            });

            if (updatedRowCount > 0) {
                return res.status(200).json({
                    error: false,
                    message: "Link updated"
                });
            } else {
                return res.status(404).json({
                    error: true,
                    message: "Link not found"
                });
            }
        } else {
            // Create new link
            await Listing.create({
                listingName: linkName,
                listingIcon: linkIcon,
                listingUrl: linkURL,
                localUrl,
                description,
                listingType: 'link',
                parentId,
                onFeatured: showOnFeatured,
                inSidebar: showInSidebar,
                userId,
                integration: integrationData
            });

            return res.status(200).json({
                error: false,
                message: "Link saved"
            });
        }
    } catch (error) {
        console.error('Error saving or updating link:', error);
        return res.status(400).json({
            error: true,
            message: "Error saving or updating link"
        });
    }
};

exports.reOrder = async (req, res) => {
    const items = req.body.items;

    try {
        await Promise.all(items.map(async (itemId, index) => {
            await Listing.update(
                { sortOrder: index },
                { 
                    where: { id: itemId }
                }
            );
        }));

        return res.status(200).json({
            error: false,
            message: "Items reordered successfully"
        });
    } catch (error) {
        console.error('Error reordering items:', error);
        return res.status(400).json({
            error: true,
            message: "Error reordering items"
        });
    }
};

exports.deleteListing = async (req, res) => {
    const userId = req.user.id;
    const listingId = req.params.listingId;

    if (!listingId || listingId === 'undefined' || listingId === 'null') {
        return res.status(400).json({
            error: true,
            message: "Listing ID is required"
        });
    }

    try {
        const listingInfo = await Listing.findOne({ 
            where: { 
                id: listingId, 
                userId 
            } 
        });

        if (!listingInfo) {
            return res.status(404).json({
                error: true,
                message: "Listing not found"
            });
        }

        // Recursive function to delete children
        const deleteChildren = async (parentId) => {
            const children = await Listing.findAll({
                where: { parentId }
            });
            
            for (const child of children) {
                // Recursively delete this child's children
                await deleteChildren(child.id);
                // Then delete the child itself
                await child.destroy();
            }
        };
        
        // Delete all children first
        await deleteChildren(listingId);
        
        // Then delete the parent listing
        await listingInfo.destroy();

        return res.status(200).json({
            error: false,
            message: "Listing deleted"
        });
    } catch (error) {
        console.error('Error deleting listing:', error);
        return res.status(400).json({
            error: true,
            message: "Error deleting listing"
        });
    }
};

exports.saveTodo = async (req, res) => {
    const userId = req.user.id;
    const { parentId, listingId, todoName, todoIcon, showInSidebar, showOnFeatured } = req.body;

    try {
        // Check validations
        if (!todoName || !todoIcon) {
            return res.status(400).json({
                error: true,
                message: "All fields are required"
            });
        }

        if (listingId) {
            // Update existing todo
            const [updatedRowCount] = await Listing.update({
                listingName: todoName,
                listingIcon: todoIcon,
                inSidebar: showInSidebar,
                onFeatured: showOnFeatured
            }, {
                where: { 
                    id: listingId, 
                    userId 
                }
            });

            if (updatedRowCount > 0) {
                return res.status(200).json({
                    error: false,
                    message: "Todo updated"
                });
            } else {
                return res.status(404).json({
                    error: true,
                    message: "Todo not found"
                });
            }
        } else {
            // Add new todo
            await Listing.create({
                listingName: todoName,
                listingIcon: todoIcon,
                listingType: "todo",
                parentId,
                onFeatured: showOnFeatured,
                inSidebar: showInSidebar,
                userId
            });

            return res.status(200).json({
                error: false,
                message: "Todo saved"
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error saving todo"
        });
    }
};

exports.saveSnippet = async (req, res) => {
    const userId = req.user.id;
    const { parentId, listingId, snippetName, snippetIcon, showInSidebar, showOnFeatured } = req.body;

    try {
        // Check validations
        if (!snippetName || !snippetIcon) {
            return res.status(400).json({
                error: true,
                message: "All fields are required"
            });
        }

        if (listingId) {
            // Update existing snippet
            const [updatedRowCount] = await Listing.update({
                listingName: snippetName,
                listingIcon: snippetIcon,
                inSidebar: showInSidebar,
                onFeatured: showOnFeatured
            }, {
                where: { 
                    id: listingId, 
                    userId 
                }
            });

            if (updatedRowCount > 0) {
                return res.status(200).json({
                    error: false,
                    message: "Snippet list updated"
                });
            } else {
                return res.status(404).json({
                    error: true,
                    message: "Snippet list not found"
                });
            }
        } else {
            // Add new snippet
            await Listing.create({
                listingName: snippetName,
                listingIcon: snippetIcon,
                listingType: "snippet",
                parentId,
                onFeatured: showOnFeatured,
                inSidebar: showInSidebar,
                userId
            });

            return res.status(200).json({
                error: false,
                message: "Snippet list saved"
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error saving snippet list"
        });
    }
};

exports.saveStream = async (req, res) => {
    const userId = req.user.id;
    let { parentId, listingId, linkName, linkURL } = req.body;

    if (!listingId || listingId === 'undefined') listingId = null;
    if (!parentId || parentId === 'undefined') parentId = null;

    try {
        // Check validations
        if (!linkName || !linkURL) {
            return res.status(400).json({
                error: true,
                message: "All fields are required"
            });
        }

        //check if link is a valid streaming URL
        if (await isValidStream(linkURL) === false) {
            return res.status(400).json({
                error: true,
                message: "Invalid streaming URL"
            });
        }

        if (listingId) {
            // Update existing stream
            const [updatedRowCount] = await Listing.update({
                listingName: linkName,
                listingUrl: linkURL
            }, {
                where: { 
                    id: listingId, 
                    userId 
                }
            });

            if (updatedRowCount > 0) {
                return res.status(200).json({
                    error: false,
                    message: "Stream updated"
                });
            } else {
                return res.status(404).json({
                    error: true,
                    message: "Stream not found"
                });
            }
        } else {
            // Add new stream
            await Listing.create({
                listingName: linkName,
                listingUrl: linkURL,
                listingType: "stream",
                parentId,
                userId
            });

            return res.status(200).json({
                error: false,
                message: "Stream saved"
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error saving stream"
        });
    }
};

exports.moveListingTo = async (req, res) => {
    const userId = req.user.id;
    const listingId = req.params.listingId;
    let parentId = req.params.parentId;

    if (parentId === 'undefined' || parentId === 'null') {
        parentId = null;
    }

    // Return error if listingId is not provided
    if (!listingId) {
        return res.status(400).json({
            error: true,
            message: "Listing ID is required"
        });
    }

    try {
        // First verify that the listing exists and belongs to the user
        const sourceListing = await Listing.findOne({ 
            where: { 
                id: listingId, 
                userId 
            } 
        });
        
        if (!sourceListing) {
            return res.status(404).json({
                error: true,
                message: "Listing not found or access denied"
            });
        }

        // If parentId is provided, verify it exists and belongs to the user
        if (parentId) {
            const parentListing = await Listing.findOne({ 
                where: { 
                    id: parentId, 
                    userId 
                } 
            });
            
            if (!parentListing) {
                return res.status(404).json({
                    error: true,
                    message: "Parent listing not found or access denied"
                });
            }
        }

        // Check recursively if the target parent is a descendant of the listing being moved
        const isListingInParentTree = async (currentId, targetParentId) => {
            // Base cases
            if (!currentId || !targetParentId) return false;
            if (currentId === targetParentId) return true;

            // Get all direct children of the current listing
            const children = await Listing.findAll({ 
                where: { 
                    parentId: currentId, 
                    userId 
                } 
            });

            // Recursively check each child
            for (const child of children) {
                if (await isListingInParentTree(child.id, targetParentId)) {
                    return true;
                }
            }

            return false;
        };

        // Check if the move would create a circular reference
        if (parentId && await isListingInParentTree(listingId, parentId)) {
            return res.status(400).json({
                error: true,
                message: "Cannot move a listing to one of its descendants"
            });
        }

        // Perform the move
        const [updatedRowCount] = await Listing.update(
            { parentId },
            { 
                where: { 
                    id: listingId, 
                    userId 
                } 
            }
        );

        if (updatedRowCount === 0) {
            return res.status(404).json({
                error: true,
                message: "Failed to update listing"
            });
        }

        // Get the updated listing to return
        const updatedListing = await Listing.findByPk(listingId);

        return res.status(200).json({
            error: false,
            message: "Listing moved successfully",
            listing: updatedListing
        });
    } catch (error) {
        console.error('Error moving listing:', error);
        return res.status(500).json({
            error: true,
            message: "Internal server error while moving listing"
        });
    }
};


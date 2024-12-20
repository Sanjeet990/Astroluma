const Integration = require("../models/Integration");
const Listing = require("../models/Listing");
const stream = require('stream');
const { spawn } = require('child_process');
const Page = require("../models/Page");
const mongoose = require('mongoose');
const { isValidStream } = require("../utils/apiutils");

exports.saveFolder = async (req, res) => {
    const userId = req.user._id;
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
            const parentFolder = await Listing.findOne({
                _id: listingId,
                userId
            });

            if (parentFolder) {
                parentFolder.listingName = folderName;
                parentFolder.listingIcon = folderIcon;
                parentFolder.listingUrl = folderURL;
                parentFolder.inSidebar = showInSidebar;
                parentFolder.onFeatured = showOnFeatured;

                await parentFolder.save();
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
            const newFolder = new Listing({
                listingName: folderName,
                listingIcon: folderIcon,
                listingUrl: folderURL,
                listingType: "category",
                parentId,
                onFeatured: showOnFeatured,
                inSidebar: showInSidebar,
                userId
            });

            await newFolder.save();

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
    const userId = req.user._id;
    let listingId = req.params.listingId;

    if (!listingId || listingId === 'undefined') listingId = null;

    try {
        let listing = null;

        if (listingId) {
            // Fetch listing details
            listing = await Listing.findOne({
                _id: listingId,
                userId
            });
        }

        // Fetch integrations associated with the user
        const integrations = await Integration.find({
            userId
        }).select('integrationName _id'); // Specify attributes to fetch

        // Find pages
        const pages = await Page.find({
            userId,
            isPublished: true
        }).select('-pageContent'); // Exclude pageContent field

        // Return details
        return res.status(200).json({
            error: false,
            message: {
                integrations,
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
        const listing = await Listing.findOne({
            _id: listingId
        });

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
        // Fetch initial listing details
        const listing = await Listing.findOne({
            _id: listingId,
            userId
        });

        if (!listing) {
            return []; // Return empty array if listing not found
        }

        // Initialize breadcrumb array
        const breadcrumb = [];

        // Recursive function to fetch breadcrumb
        const fetchBreadcrumb = async (currentId) => {
            const parentListing = await Listing.findOne({
                _id: currentId,
                userId
            });

            if (parentListing) {
                breadcrumb.unshift({ id: parentListing._id, listingName: parentListing.listingName });
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
    const userId = req.user._id;
    let listingId = req.params.listingId;

    if (!listingId || listingId === 'undefined') listingId = null;

    let query;
    if (!listingId) {
        // If parentId is null, select records where parentId=null, onFeatured is true, and userId is userId
        query = {
            parent: null,
            onFeatured: true,
            userId,
            listingType: { $ne: "stream" }
        };
    } else {
        listingId = new mongoose.Types.ObjectId(req.params.listingId);
        // If parentId is not null, select records where parentId=parentId and userId is userId
        query = {
            parentId: listingId,
            userId,
            listingType: { $ne: "stream" }
        };
    }

    const [items, parentFolder, breadcrumb] = await Promise.all([
        // list all items of this listing id
        Listing.find(query).sort({ sortOrder: 'asc' }).populate("integration", "_id autoRefreshAfter"),

        // find listing details
        Listing.findOne({
            _id: listingId,
            userId
        }),
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
}

exports.listStreams = async (req, res) => {
    const userId = req.user._id;

    try {
        const items = await Listing.find({
            parentId: null,
            userId,
            listingType: 'stream'
        }).sort({ sortOrder: 1 }).populate('_id');

        const parentFolder = await Listing.findOne({
            _id: null,
            userId
        });

        const breadcrumb = await getBreadcrumb(null, userId);

        return res.status(200).json({
            error: false,
            message: {
                items,
                parentFolder,
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
    const userId = req.user._id;
    let listingId = req.params.listingId;
    const type = req.params.type || 'listing';

    if (!listingId || listingId === 'undefined') listingId = null;

    try {
        const query = {
            parentId: listingId,
            userId,
            listingType: type === 'streaming' ? 'stream' : { $ne: 'stream' }
        };

        const items = await Listing.find(query).sort({ sortOrder: 1 });

        const parentFolder = await Listing.findOne({
            _id: listingId,
            userId
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
    const userId = req.user._id;
    const { parentId, listingId, linkName, linkIcon, linkURL, localUrl, showInSidebar, showOnFeatured } = req.body;
    let integration = req.body.integration;

    if (!integration || integration === 'undefined') integration = null;

    if (!linkName || !linkIcon || (!linkURL && !localUrl)) {
        return res.status(400).json({
            error: true,
            message: "All fields are required"
        });
    }

    try {
        if (listingId) {
            const updatedLink = await Listing.findOneAndUpdate(
                { _id: listingId, userId },
                {
                    listingName: linkName,
                    listingIcon: linkIcon,
                    listingUrl: linkURL,
                    localUrl,
                    onFeatured: showOnFeatured,
                    inSidebar: showInSidebar,
                    integration
                },
                { new: true }
            );

            if (updatedLink) {
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
            await Listing.create({
                listingName: linkName,
                listingIcon: linkIcon,
                listingUrl: linkURL,
                localUrl,
                listingType: 'link',
                parentId,
                onFeatured: showOnFeatured,
                inSidebar: showInSidebar,
                userId,
                integration
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
            await Listing.findByIdAndUpdate(
                itemId,
                { sortOrder: index },
                { new: true, runValidators: true }
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
    const userId = req.user._id;
    const listingId = req.params.listingId;

    if (!listingId) {
        return res.status(400).json({
            error: true,
            message: "Listing ID is required"
        });
    }

    try {
        await Promise.all([
            Listing.findByIdAndDelete({ _id: listingId, userId }),
            Listing.updateMany(
                { parentId: listingId, userId },
                { $set: { parentId: null } }
            )
        ]);

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
    const userId = req.user._id;
    const { parentId, listingId, todoName, todoIcon, showInSidebar, showOnFeatured } = req.body;

    try {
        // Check validations
        if (!todoName || !todoIcon) {
            return res.status(400).json({
                error: true,
                message: "All fields are required"
            });
        }

        let todo;

        if (listingId) {
            // Update existing todo
            const updatedTodo = await Listing.findOneAndUpdate(
                { _id: listingId, userId },
                {
                    listingName: todoName,
                    listingIcon: todoIcon,
                    inSidebar: showInSidebar,
                    onFeatured: showOnFeatured
                },
                { new: true } // Return the updated document
            );

            if (updatedTodo) {
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
            todo = new Listing({
                listingName: todoName,
                listingIcon: todoIcon,
                listingType: "todo",
                parentId,
                onFeatured: showOnFeatured,
                inSidebar: showInSidebar,
                userId
            });

            await todo.save();

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
    const userId = req.user._id;
    const { parentId, listingId, snippetName, snippetIcon, showInSidebar, showOnFeatured } = req.body;

    try {
        // Check validations
        if (!snippetName || !snippetIcon) {
            return res.status(400).json({
                error: true,
                message: "All fields are required"
            });
        }

        let snippet;

        if (listingId) {
            // Update existing snippet
            const updatedSnippet = await Listing.findOneAndUpdate(
                { _id: listingId, userId },
                {
                    listingName: snippetName,
                    listingIcon: snippetIcon,
                    inSidebar: showInSidebar,
                    onFeatured: showOnFeatured
                },
                { new: true } // Return the updated document
            );

            if (updatedSnippet) {
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
            snippet = new Listing({
                listingName: snippetName,
                listingIcon: snippetIcon,
                listingType: "snippet",
                parentId,
                onFeatured: showOnFeatured,
                inSidebar: showInSidebar,
                userId
            });

            await snippet.save();

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
    const userId = req.user._id;
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
            const updatedStream = await Listing.findOneAndUpdate(
                { _id: listingId, userId },
                {
                    listingName: linkName,
                    listingUrl: linkURL
                },
                { new: true } // Return the updated document
            );

            if (updatedStream) {
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
            const streamListing = new Listing({
                listingName: linkName,
                listingUrl: linkURL,
                listingType: "stream",
                parentId,
                userId
            });

            await streamListing.save();

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
    const userId = req.user._id;
    const listingId = req.params.listingId;
    let parentId = req.params.parentId;

    if (parentId === 'undefined') parentId = null;

    // Return error if listingId or parentId is not provided
    if (!listingId) {
        return res.status(400).json({
            error: true,
            message: "Listing ID is required"
        });
    }

    // Check recursively if listingId is in the parent tree
    const isListingInParentTree = async (lid, pid, uid) => {
        if (lid == null) return false;
        if (lid?.toString() === pid?.toString()) return true;

        const listing = await Listing.findOne({ _id: pid, userId: uid });

        if (listing?.pid?.toString() === lid?.toString()) {
            return true;
        }

        return isListingInParentTree(listing?.parentId, pid, uid);
    };

    const isListingInTree = await isListingInParentTree(listingId, parentId, userId);

    if (isListingInTree) {
        return res.status(400).json({
            error: true,
            message: "Listing cannot be moved to its own child"
        });
    }

    try {
        await Listing.findOneAndUpdate(
            { _id: listingId, userId },
            { parentId },
            { new: true } // Return the updated document
        );

        return res.status(200).json({
            error: false,
            message: "Listing moved"
        });
    } catch (error) {
        console.error('Error moving listing:', error);
        return res.status(400).json({
            error: true,
            message: "Error moving listing"
        });
    }
};


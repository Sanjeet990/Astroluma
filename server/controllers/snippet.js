const { Listing, Snippet } = require("../models");
const { Op } = require("sequelize");

exports.saveSnippet = async (req, res) => {
    const userId = req.user?.id; // Get user ID from the authenticated user
    const { listingId, snippetCode, snippetTitle, snippetId, language, snippetFilename } = req.body; // Destructure request body

    // Validate that snippetTitle exists
    if (!snippetTitle) {
        return res.status(400).json({
            error: true,
            message: "Invalid data. Snippet title is required."
        });
    }

    try {
        let snippet;

        // If snippetId is provided, update the existing snippet
        if (snippetId) {
            snippet = await Snippet.findOne({
                where: {
                    id: snippetId,
                    userId // Ensure the snippet belongs to the current user
                }
            });

            // If snippet is not found, return 404
            if (!snippet) {
                return res.status(404).json({
                    error: true,
                    message: "Snippet not found."
                });
            }

            // Update the snippet fields
            await snippet.update({
                snippetLanguage: language,
                snippetTitle: snippetTitle
            });

            return res.status(200).json({
                error: false,
                message: snippet
            });

        } else {
            // Create a new snippet if snippetId is not provided
            const initialSnippetItems = [{
                snippetCode, // Add code to snippetItems array
                snippetLanguage: language,
                snippetFilename
            }];

            // Create the new snippet with Sequelize
            snippet = await Snippet.create({
                parent: listingId, // Set the listing ID as the parent
                snippetLanguage: language,
                snippetTitle,
                userId,
                snippetItems: initialSnippetItems
            });

            return res.status(200).json({
                error: false,
                message: snippet
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error saving snippet."
        });
    }
};

const getBreadcrumb = async(listingId, userId) => {
    try {
        // Initialize breadcrumb array
        const breadcrumb = [];
        
        // If no listing ID, return empty breadcrumb
        if (!listingId) {
            return breadcrumb;
        }

        // Find the listing with the given listingId and userId
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
                    listingName: parentListing.listingName,
                    depth: breadcrumb.length + 1
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
        console.error('Error fetching breadcrumb:', error);
        return [];
    }
};

exports.listSnippet = async (req, res) => {
    const userId = req.user?.id; // Get user ID from the authenticated user
    let snippetId = req.params.snippetId;
    const query = req.params.query;

    if (snippetId === "undefined") snippetId = null;

    const page = Number(req.params.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Prepare the where clause for Sequelize
    const where = {
        userId
    };

    if (snippetId) {
        where.parent = snippetId;
    }

    // Handle search query if provided
    if (query) {
        where[Op.or] = [
            { snippetTitle: { [Op.like]: `%${query}%` } },
            // For searching in JSON data (snippetItems)
            Snippet.sequelize.literal(`snippetItems LIKE '%${query}%'`)
        ];
    }

    try {
        // Fetch the snippet for the breadcrumb if necessary
        const snippet = snippetId ? await Listing.findOne({
            where: {
                id: snippetId,
                userId
            }
        }) : null;

        // Fetch snippets with pagination and include parentListing
        const { count, rows: snippets } = await Snippet.findAndCountAll({
            where,
            include: [{
                model: Listing,
                as: 'parentListing'
            }],
            offset,
            limit,
            order: [['updatedAt', 'DESC']]
        });

        // Fetch breadcrumb data if necessary
        const breadcrumb = snippetId ? await getBreadcrumb(snippetId, userId) : null;

        // Create the response object
        const totalPages = Math.ceil(count / limit);
        const dataToReturn = {
            snippet, // Snippet for breadcrumb
            snippets, // List of snippets
            totalItems: count,
            totalPages,
            breadcrumb, // Breadcrumb data
            currentPage: page
        };

        return res.status(200).json({
            error: false,
            message: dataToReturn
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error fetching snippet list."
        });
    }
};

exports.listFilesInSnippet = async (req, res) => {
    const snippetId = req.params.snippetId;
    const userId = req.user?.id;

    if (!snippetId) {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    try {
        // Find the snippet by its ID and userId using Sequelize
        const snippet = await Snippet.findOne({
            where: {
                id: snippetId,
                userId
            }
        });

        if (!snippet) {
            return res.status(404).json({
                error: true,
                message: "Snippet not found."
            });
        }

        // Get snippetItems from the getter which automatically parses the JSON
        const snippetItems = snippet.snippetItems;

        return res.status(200).json({
            error: false,
            message: {
                snippet,
                snippetItems
            }
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error fetching snippet items."
        });
    }
};

exports.saveCodeToSnippet = async (req, res) => {
    const snippetId = req.params.snippetId;
    const userId = req.user?.id;
    const { snippetCode, snippetFilename, language, codeId } = req.body;

    if (!snippetId || !snippetCode || !language) {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    try {
        // Find the snippet by snippetId and userId using Sequelize
        const snippet = await Snippet.findOne({
            where: {
                id: snippetId,
                userId
            }
        });

        if (!snippet) {
            return res.status(404).json({
                error: true,
                message: "Snippet not found."
            });
        }

        // Get current snippetItems
        const snippetItems = snippet.snippetItems;

        if (codeId) {
            // Update existing snippet item
            const itemIndex = snippetItems.findIndex(item => item.id === codeId);

            if (itemIndex === -1) {
                return res.status(404).json({
                    error: true,
                    message: "Snippet item not found."
                });
            }

            // Update the fields in the array
            snippetItems[itemIndex] = {
                ...snippetItems[itemIndex],
                snippetCode,
                snippetFilename,
                snippetLanguage: language
            };

            // Save the updated snippetItems back to the database
            await snippet.update({ snippetItems });

            return res.status(200).json({
                error: false,
                message: snippetItems[itemIndex]
            });
        } else {
            // Add a new snippet item
            const newItem = {
                id: Date.now().toString(), // Generate a simple unique ID
                snippetCode,
                snippetFilename,
                snippetLanguage: language
            };

            snippetItems.push(newItem);

            // Save the updated snippetItems back to the database
            await snippet.update({ snippetItems });

            return res.status(200).json({
                error: false,
                message: snippet
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error saving snippet item."
        });
    }
};

exports.deleteSnippet = async (req, res) => {
    const snippetId = req.params.snippetId;
    const userId = req.user?.id;

    if (!snippetId) {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    try {
        // Delete the snippet using Sequelize destroy method
        const deletedCount = await Snippet.destroy({
            where: {
                id: snippetId,
                userId
            }
        });

        if (deletedCount === 0) {
            return res.status(404).json({
                error: true,
                message: "Snippet not found."
            });
        }

        return res.status(200).json({
            error: false,
            message: "Snippet deleted."
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error deleting snippet."
        });
    }
};

exports.deleteCodeFromSnippet = async (req, res) => {
    const snippetId = req.params.snippetId;
    const codeId = req.params.codeId;
    const userId = req.user?.id;

    if (!snippetId || !codeId) {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    try {
        // Find the snippet by snippetId and userId
        const snippet = await Snippet.findOne({
            where: {
                id: snippetId,
                userId
            }
        });

        if (!snippet) {
            return res.status(404).json({
                error: true,
                message: "Snippet not found."
            });
        }

        // Get current snippetItems
        const snippetItems = snippet.snippetItems;
        
        // Remove the item with matching codeId
        const updatedItems = snippetItems.filter(item => item.id !== codeId);
        
        // If lengths are the same, the item wasn't found
        if (updatedItems.length === snippetItems.length) {
            return res.status(404).json({
                error: true,
                message: "Snippet item not found."
            });
        }

        // Update the snippet with the filtered items
        await snippet.update({ snippetItems: updatedItems });

        return res.status(200).json({
            error: false,
            message: "Snippet item deleted."
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error deleting snippet item."
        });
    }
};
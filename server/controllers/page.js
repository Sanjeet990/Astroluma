const { Page } = require('../models');

exports.savePage = async (req, res) => {
    const loggedinuser = req.user;
    const { pageId, pageTitle, pageContent, publish } = req.body;

    if (!pageTitle) {
        return res.status(400).json({
            error: true,
            message: "Page title must not be empty."
        });
    }

    try {
        if (!pageId) {
            // Create a new page
            await Page.create({
                pageTitle,
                pageContent,
                isPublished: publish,
                userId: loggedinuser?.id
            });
            return res.status(200).json({
                error: false,
                message: "Page created successfully."
            });
        } else {
            // Update an existing page
            const [updatedRows] = await Page.update(
                { 
                    pageTitle, 
                    pageContent, 
                    isPublished: publish 
                },
                {
                    where: { 
                        id: pageId, 
                        userId: loggedinuser?.id 
                    }
                }
            );
            
            if (updatedRows === 0) {
                return res.status(400).json({
                    error: true,
                    message: "Page not found or no changes made."
                });
            }

            return res.status(200).json({
                error: false,
                message: "Page updated successfully."
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: true,
            message: "Error in adding or updating page."
        });
    }
}

exports.pageList = async (req, res) => {
    const loggedinuser = req.user;
    const active = req.params.active;

    const where = { userId: loggedinuser?.id };
    if (active) {
        where.isPublished = true;
    }

    try {
        const pages = await Page.findAll({
            where,
            attributes: ['id', 'pageTitle', 'isPublished', 'createdAt', 'updatedAt'] // Exclude pageContent
        });
        return res.status(200).json({
            error: false,
            message: pages
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: true,
            message: "Error fetching pages."
        });
    }
}

exports.pageInfo = async (req, res) => {
    const loggedinuser = req.user;
    const pageId = req.params.pageId;
    const active = req.params.active;

    const where = {
        id: pageId,
        userId: loggedinuser?.id
    };
    
    // Add isPublished: true if active is truthy
    if (active) {
        where.isPublished = true;
    }

    try {
        const page = await Page.findOne({ where });
        if (!page) {
            return res.status(400).json({
                error: true,
                message: "Page not found."
            });
        }
        return res.status(200).json({
            error: false,
            message: page
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: true,
            message: "Error fetching page information."
        });
    }
}

exports.deletePage = async (req, res) => {
    const loggedinuser = req.user;
    const pageId = req.params.pageId;

    try {
        const deletedRows = await Page.destroy({
            where: {
                id: pageId,
                userId: loggedinuser?.id
            }
        });

        if (deletedRows === 0) {
            return res.status(400).json({
                error: true,
                message: "Page not found."
            });
        }

        return res.status(200).json({
            error: false,
            message: "Page deleted successfully."
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: true,
            message: "Error in deleting page."
        });
    }
}

exports.managePage = async (req, res) => {
    const loggedinuser = req.user;
    const pageId = req.params.pageId;
    const action = req.params.action;

    if (!pageId) {
        return res.status(400).json({
            error: true,
            message: "Page id not supplied."
        });
    }

    try {
        const [updatedRows] = await Page.update(
            { isPublished: action === "publish" },
            { 
                where: { 
                    id: pageId, 
                    userId: loggedinuser?.id 
                }
            }
        );

        if (updatedRows === 0) {
            return res.status(400).json({
                error: true,
                message: "Page not found or no changes made."
            });
        }

        return res.status(200).json({
            error: false,
            message: "Page status changed successfully."
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(400).json({
            error: true,
            message: "Error in changing page status."
        });
    }
}

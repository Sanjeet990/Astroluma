const { Listing, Todo } = require("../models");
const { Op } = require("sequelize");

// Save or update a Todo
exports.saveTodo = async (req, res) => {
    const userId = req.user?.id;
    const { listingId, todoName, dueDate, todoId, priority } = req.body;

    if (!todoName || !userId) {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    try {
        if (todoId) {
            // Update existing todo
            const updatedRowCount = await Todo.update({
                todoItem: todoName,
                dueDate,
                priority
            }, {
                where: {
                    id: todoId,
                    userId
                }
            });

            if (updatedRowCount === 0) {
                return res.status(404).json({
                    error: true,
                    message: "Todo not found."
                });
            }

            // Get the updated todo to return
            const todo = await Todo.findByPk(todoId);

            return res.status(200).json({
                error: false,
                message: todo
            });
        } else {
            // Add new todo
            const todo = await Todo.create({
                parent: listingId,
                todoItem: todoName,
                dueDate,
                priority,
                userId
            });

            return res.status(200).json({
                error: false,
                message: todo
            });
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error saving todo."
        });
    }
};

// Get breadcrumb for a listing
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
            return breadcrumb; // Return empty array if listing is not found
        }

        // Start with the current listing
        let currentListing = listing;

        // Perform a loop to fetch parent listings until we reach the top-level parent or no more parents
        while (currentListing.parentId) {
            // Fetch parent listing
            const parentListing = await Listing.findOne({
                where: {
                    id: currentListing.parentId,
                    userId
                }
            });

            // If parent listing is found, add it to breadcrumb
            if (parentListing) {
                breadcrumb.push({
                    id: parentListing.id,
                    listingName: parentListing.listingName,
                    depth: breadcrumb.length + 1 // Calculate depth based on position in breadcrumb
                });

                // Move to the parent listing for the next iteration
                currentListing = parentListing;
            } else {
                break; // Exit loop if parent listing is not found
            }
        }

        // Reverse the breadcrumb array to start from the top-level parent to the current listing
        breadcrumb.reverse();

        return breadcrumb;
    } catch (error) {
        console.error('Error fetching breadcrumb:', error);
        return []; // Return empty array in case of error
    }
}

// List todos
exports.listTodo = async (req, res) => {
    const userId = req.user?.id;
    const todoId = req.params.todoId;

    if (todoId && todoId === "undefined") {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    const page = Number(req.params.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // Get the selected filters
    const completion = req.params.completion;
    const filter = req.params.filter;

    // Prepare a filter object
    const where = {
        userId
    };

    if (todoId) {
        where.parent = todoId;
    }

    if (completion === "completed") {
        where.completed = true;
    } else if (completion === "pending") {
        where.completed = false;
    }

    // Prepare order options
    let order = [];
    if (filter === "highToLow") {
        order.push(['priority', 'ASC']); // Lower number = higher priority
    } else if (filter === "lowToHigh") {
        order.push(['priority', 'DESC']); // Higher number = lower priority
    } else if (filter === "dueDate") {
        order.push(['dueDate', 'ASC']); // Sort by due date ascending
    } else {
        order.push(['createdAt', 'DESC']); // Sort by creation date descending
    }

    try {
        // Get todo list, count, and breadcrumb in parallel
        const [todo, todoItems, totalItems, breadcrumb] = await Promise.all([
            // Get the todo listing if todoId is provided
            todoId ? Listing.findOne({
                where: {
                    id: todoId,
                    userId
                }
            }) : null,
            
            // Get todo items with pagination and sorting
            Todo.findAll({
                where,
                order,
                limit,
                offset,
                include: [{
                    model: Listing,
                    as: 'parentListing'
                }]
            }),
            
            // Count total items for pagination
            Todo.count({ where }),
            
            // Get breadcrumb if todoId is provided
            todoId ? getBreadcrumb(todoId, userId) : []
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        const dataToReturn = {
            todo,
            todoItems,
            totalItems,
            totalPages,
            breadcrumb,
            currentPage: page,
        };

        return res.status(200).json({
            error: false,
            message: dataToReturn
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error fetching todo list."
        });
    }
};

// Complete or uncomplete a todo
exports.completeTodo = async (req, res) => {
    const userId = req?.user?.id;
    const todoId = req.params.todoId;

    if (!todoId) {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    try {
        // Find the todo item
        const todo = await Todo.findOne({
            where: {
                id: todoId,
                userId
            },
            include: [{
                model: Listing,
                as: 'parentListing'
            }]
        });

        if (!todo) {
            return res.status(404).json({
                error: true,
                message: "Todo not found."
            });
        }

        // Toggle completion status
        const completed = !todo.completed;
        
        // Update the todo item
        await Todo.update({
            completed
        }, {
            where: {
                id: todoId,
                userId
            }
        });
        
        // Get the updated todo to return
        const updatedTodo = await Todo.findOne({
            where: {
                id: todoId,
                userId
            },
            include: [{
                model: Listing,
                as: 'parentListing'
            }]
        });

        // Respond with the updated status of the todo
        return res.status(200).json({
            error: false,
            message: updatedTodo
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error updating todo status."
        });
    }
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
    const userId = req?.user?.id;
    const itemId = req.params.itemId;

    if (!itemId) {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    try {
        // Check if todo exists
        const todo = await Todo.findOne({
            where: {
                id: itemId,
                userId
            }
        });

        if (!todo) {
            return res.status(404).json({
                error: true,
                message: "Todo not found."
            });
        }

        // Delete the todo
        await Todo.destroy({
            where: {
                id: itemId,
                userId
            }
        });

        // Respond with a success message
        return res.status(200).json({
            error: false,
            message: "Todo deleted."
        });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({
            error: true,
            message: "Error deleting todo."
        });
    }
};

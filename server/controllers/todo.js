const Listing = require("../models/Listing");
const Todo = require("../models/Todo");

// Save or update a Todo
exports.saveTodo = async (req, res) => {
    const userId = req.user?._id;
    const { listingId, todoName, dueDate, todoId, priority } = req.body;

    if (!todoName || !userId) {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    try {
        let todo;

        if (todoId) {
            // Update existing todo
            todo = await Todo.findOne({
                _id: todoId,
                userId
            });

            if (!todo) {
                return res.status(404).json({
                    error: true,
                    message: "Todo not found."
                });
            }

            todo.todoItem = todoName;
            todo.dueDate = dueDate;
            todo.priority = priority;

            await todo.save();

            return res.status(200).json({
                error: false,
                message: todo
            });
        } else {
            // Add new todo
            todo = await Todo.create({
                listingId,
                todoItem: todoName,
                dueDate,
                parent: listingId,
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
        // Find the listing with the given listingId and userId
        const listing = await Listing.findOne({
            _id: listingId,
            userId
        });

        if (!listing) {
            return []; // Return empty array if listing is not found
        }

        // Initialize an array to store the breadcrumb
        const breadcrumb = [];

        // Start with the current listing
        let currentListing = listing;

        // Perform a loop to fetch parent listings until we reach the top-level parent or no more parents
        while (currentListing.parentId) {
            // Fetch parent listing
            const parentListing = await Listing.findOne({
                _id: currentListing.parentId,
                userId
            });

            // If parent listing is found, add it to breadcrumb
            if (parentListing) {
                breadcrumb.push({
                    id: parentListing._id,
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
    const userId = req.user?._id;
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

    // Prepare a sort object
    const order = {};
    if (filter === "highToLow") {
        order.priority = 1; // descending
    } else if (filter === "lowToHigh") {
        order.priority = -1; // ascending
    } else if (filter === "dueDate") {
        order.dueDate = -1; // descending
    } else {
        order.createdAt = -1; // descending
    }

    try {
        const todo = todoId ? await Listing.findOne({ _id: todoId, userId }) : null;
        const todoItems = await Todo.find(where)
            .populate('parent')
            .sort(order)
            .skip(offset)
            .limit(limit);
        const totalItems = await Todo.countDocuments(where);
        const breadcrumb = todoId ? await getBreadcrumb(todoId, userId) : [];

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
    const userId = req?.user?._id;
    const todoId = req.params.todoId;

    if (!todoId) {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    try {
        // Find out the current status of the todo
        const todo = await Todo.findOne({
            _id: todoId,
            userId
        });

        if (!todo) {
            return res.status(404).json({
                error: true,
                message: "Todo not found."
            });
        }

        todo.completed = !todo.completed;
        await todo.save();

        // Respond with the updated status of the todo
        return res.status(200).json({
            error: false,
            message: todo
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
    const userId = req?.user?._id;
    const itemId = req.params.itemId;

    if (!itemId) {
        return res.status(400).json({
            error: true,
            message: "Invalid data."
        });
    }

    try {
        // Find out the current status of the todo
        const todo = await Todo.findOne({
            _id: itemId,
            userId
        });

        if (!todo) {
            return res.status(404).json({
                error: true,
                message: "Todo not found."
            });
        }

        // Delete the todo
        await Todo.deleteOne({
            _id: itemId,
            userId
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

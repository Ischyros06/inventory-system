const { itemCollection } = require('../models/ItemCollectionModel');
const { changeLog } = require('../models/ChangeLogModel');

// Function to fetch items and render admin home page
const renderAdminHome = async (req, res) => {
    try {
        const items = await itemCollection.find({}, { product: 1, _id: 0, quantity: 1, maxQuantity: 1, unit: 1, picture: 1}).sort({ product: 1 });
        res.render("adminHome", { itemCollection: items });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Function to get quantity of selected product
const getQuantity = async (req, res) => {
    const selectedProduct = req.query.product;
    try {
        const item = await itemCollection.findOne({ product: selectedProduct });
        res.json({ quantity: item ? item.quantity : 0 });
    } catch (error) {
        console.error(`Error fetching quantity: ${error}`);
        res.status(500).json({ error: 'An error occurred while fetching quantity' });
    }
};

// Function to add quantity of selected product
const addQuantity = async (req, res) => {
    const selectedProduct = req.query.product;
    const quantityToAdd = parseInt(req.query.quantity) || 1; // Get the quantity to add from the query parameter, default to 1 if not provided
    const adminName = res.locals.admin.name;
    try {
        const { quantity, maxQuantity } = await itemCollection.findOne({ product: selectedProduct });

        if (quantity + quantityToAdd <= maxQuantity) { // Check if adding the quantity exceeds the maximum quantity
            // Check if there's an existing log entry within the last 5 seconds with the same userName and product
            const existingLog = await changeLog.findOne({
                userName: adminName,
                product: selectedProduct,
                action: 'added',
                createdAt: { $gte: new Date(new Date() - 5 * 1000) } // Check if createdAt is within the last 5 seconds
            });

            if (existingLog) {
                // If an existing log entry exists within the last 5 seconds, update the count
                await changeLog.updateOne({ _id: existingLog._id }, { $inc: { count: quantityToAdd } });
            } else {
                // Create a new log entry
                await changeLog.create({
                    userName: adminName,
                    role: 'admin',
                    action: 'added',
                    product: selectedProduct,
                    count: quantityToAdd, // Increment count by the input quantity
                    createdAt: new Date() // Set the current date
                });
            }

            await itemCollection.updateOne({ product: selectedProduct }, { $inc: { quantity: quantityToAdd } });
            await itemCollection.updateOne({ product: selectedProduct }, { $set: { lastUpdatedBy: { admin: adminName } } });
            
            res.json({ success: true, quantity: quantity + quantityToAdd, maxQuantity });
        } else {
            res.json({ success: false, message: 'Adding the provided quantity exceeds the maximum quantity', maxQuantity });
        }
    } catch (error) {
        console.error(`Error adding quantity: ${error}`);
        res.status(500).json({ error: 'An error occurred while adding quantity' });
    }
};

// Function to fetch items by category
const getItemsByCategory = async (req, res) => {
    const category = req.params.category;
    try {
        // Query the database for items with the specified category
        const items = await itemCollection.find({ category: category }, { product: 1, _id: 0, quantity: 1, unit:1,  maxQuantity: 1, picture: 1 }).sort({ product: 1 });
        res.json(items); // Send JSON response containing the items
    } catch (error) {
        console.error(`Error fetching items by category: ${error}`);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    renderAdminHome,
    getQuantity,
    addQuantity,
    getItemsByCategory
};

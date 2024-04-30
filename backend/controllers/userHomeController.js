const { reportCollection } = require('../models/ReportCollectionModel');
const { itemCollection } = require('../models/ItemCollectionModel');
const { changeLog } = require('../models/ChangeLogModel');

// Function to fetch items and render the user home page
const fetchItemsAndRenderHome = async (req, res) => {
    try {
        const items = await itemCollection.find({}, { product: 1, _id: 0, quantity: 1, maxQuantity: 1, unit: 1, picture: 1 }).sort({ product: 1 });
        res.render("userHome", { itemCollection: items });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Function to get the quantity of the selected item
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

// Function to subtract quantity of the selected item
const subtractQuantity = async (req, res) => {
    const selectedProduct = req.query.product;
    const quantityToDeduct = parseInt(req.query.quantity) || 1; // Get the quantity to add from the query parameter, default to 1 if not provided
    const userName = res.locals.user.name;
    const userId = req.user.id;
    const unitInfo = req.query.unit;
    try {
        const { quantity, maxQuantity } = await itemCollection.findOne({ product: selectedProduct });
        if (quantity - quantityToDeduct >= 0) { // Check if adding the quantity exceeds the maximum quantity
            // Check if there's an existing log entry within the last 5 seconds with the same userName and product
            const existingLog = await changeLog.findOne({
                userName: userName,
                product: selectedProduct,
                action: 'deducted',
                createdAt: { $gte: new Date(new Date() - 5 * 1000).toISOString() } // Check if createdAt is within the last 5 seconds
            });

            if (existingLog) {
                // If an existing log entry exists within the last 5 seconds, update the count
                await changeLog.updateOne({ _id: existingLog._id }, { $inc: { count: quantityToDeduct } });
            } else {
                // Create a new log entry
                await changeLog.create({
                    userName,
                    role: 'user', // Set role to 'user'
                    action: 'deducted', // Set action to 'subtracted'
                    product: selectedProduct,
                    count: quantityToDeduct, // Increment count by one
                    createdAt: new Date().toISOString() // Set the current date
                });
            }

            //Update report collection
            const existingUser = await reportCollection.findOne({ userId: userId });
            if (!existingUser) {
                await reportCollection.create({
                    userId: userId,
                    userName: userName,
                    productAccessed: [{ product: selectedProduct, quantitySubtracted: quantityToDeduct, unit: unitInfo }]
                });
            } else {
                const existingProduct = existingUser.productAccessed.find(prod => prod.product === selectedProduct);
                if (existingProduct) {
                    await reportCollection.updateOne(
                        { userId: userId, userName: userName, "productAccessed.product": selectedProduct },
                        { $inc: { "productAccessed.$.quantitySubtracted": quantityToDeduct } }
                    );
                } else {
                    await reportCollection.updateOne(
                        { userId: userId },
                        { $push: { productAccessed: { product: selectedProduct, quantitySubtracted: quantityToDeduct, unit: unitInfo } } }
                    );
                }
            }

            await itemCollection.updateOne({ product: selectedProduct }, { $inc: { quantity: -quantityToDeduct } });
            await itemCollection.updateOne({ product: selectedProduct }, { $set: { lastUpdatedBy: { user: userName } } });

            res.json({ success: true, quantity: quantity - quantityToDeduct, maxQuantity });
        } else {
            res.json({ success: false, message: 'Zero quantity value reached. Cannot subtract items', maxQuantity });
        }
    } catch (error) {
        console.error(`Error subtract quantity: ${error}`);
        res.status(500).json({ error: 'An error occurred while subtracting quantity' });
    }
};

// Function to fetch items by category
const getItemsByCategory = async (req, res) => {
    const category = req.params.category;
    try {
        // Query the database for items with the specified category
        const items = await itemCollection.find({ category: category }, { product: 1, _id: 0, quantity: 1, maxQuantity: 1, picture: 1 }).sort({ product: 1 });
        res.json(items); // Send JSON response containing the items
    } catch (error) {
        console.error(`Error fetching items by category: ${error}`);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    fetchItemsAndRenderHome,
    getQuantity,
    subtractQuantity,
    getItemsByCategory
};

const { itemCollection } = require('../models/ItemCollectionModel');

// Function to fetch items and render admin home page
const renderAdminHome = async (req, res) => {
    try {
        const items = await itemCollection.find({}, { product: 1, _id: 0, quantity: 1, maxQuantity: 1, picture: 1 }).sort({ product: 1 });
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
    const adminName = res.locals.admin.name;

    try {
        const { quantity, maxQuantity } = await itemCollection.findOne({ product: selectedProduct });

        if (quantity < maxQuantity) {
            await itemCollection.updateOne({ product: selectedProduct }, { $inc: { quantity: 1 } });
            await itemCollection.updateOne({ product: selectedProduct }, { $set: { lastUpdatedBy: { admin: adminName } } });
            res.json({ success: true, quantity: quantity + 1, maxQuantity });
        } else {
            res.json({ success: false, message: 'Max quantity reached. Cannot add more items', maxQuantity });
        }

    } catch (error) {
        console.error(`Error adding quantity: ${error}`);
        res.status(500).json({ error: 'An error occurred while adding quantity' });
    }
};

module.exports = {
    renderAdminHome,
    getQuantity,
    addQuantity
};

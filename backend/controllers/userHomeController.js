const { reportCollection } = require('../models/ReportCollectionModel');
const { itemCollection } = require('../models/ItemCollectionModel');

// Function to fetch items and render the user home page
const fetchItemsAndRenderHome = async (req, res) => {
    try {
        const items = await itemCollection.find({}, { product: 1, _id: 0, quantity: 1, maxQuantity: 1, picture: 1 }).sort({ product: 1 });
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
    const userName = res.locals.user.name;
    const userId = req.user.id;
    try {
        const { quantity, maxQuantity } = await itemCollection.findOne({ product: selectedProduct });
        if (quantity > 0) {
            await itemCollection.updateOne({ product: selectedProduct }, { $inc: { quantity: -1 } });
            await itemCollection.updateOne({ product: selectedProduct }, { $set: { lastUpdatedBy: { user: userName } } });

            const existingUser = await reportCollection.findOne({ userId: userId });
            if (!existingUser) {
                await reportCollection.create({
                    userId: userId,
                    userName: userName,
                    productAccessed: [{ product: selectedProduct, quantitySubtracted: 1 }]
                });
            } else {
                const existingProduct = existingUser.productAccessed.find(prod => prod.product === selectedProduct);
                if (existingProduct) {
                    await reportCollection.updateOne(
                        { userId: userId, userName: userName, "productAccessed.product": selectedProduct },
                        { $inc: { "productAccessed.$.quantitySubtracted": 1 } }
                    );
                } else {
                    await reportCollection.updateOne(
                        { userId: userId },
                        { $push: { productAccessed: { product: selectedProduct, quantitySubtracted: 1 } } }
                    );
                }
            }

            res.json({ success: true, quantity: quantity - 1, maxQuantity });
        } else {
            res.json({ success: false, message: 'Zero quantity value reached. Cannot subtract items', maxQuantity });
        }
    } catch (error) {
        console.error(`Error subtract quantity: ${error}`);
        res.status(500).json({ error: 'An error occurred while subtracting quantity' });
    }
};

module.exports = {
    fetchItemsAndRenderHome,
    getQuantity,
    subtractQuantity
};

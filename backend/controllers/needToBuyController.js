const { itemCollection } = require('../models/ItemCollectionModel');

exports.renderNeedToBuyPage = async (req, res) => {
    try {
        const items = await itemCollection.find();
        const reportData = items.map(item => ({
            product: item.product,
            unit: item.unit,
            difference: item.maxQuantity - item.quantity
        }));

        reportData.sort((a, b) => b.difference - a.difference);
        const filteredItems = reportData.filter(item => item.difference > 0);

        res.render('needToBuy', { reportData: filteredItems });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: error.message });
    }
};

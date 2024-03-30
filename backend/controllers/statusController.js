const { itemCollection } = require('../models/ItemCollectionModel');
const multer = require("multer");
const path = require('path');

const itemPics = path.join(__dirname, '../../frontend/uploads');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: itemPics,
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

//Format the date of the database and not include the GMT
const formatDate = (date) => {
    const formattedDate = new Date(date).toString().split('GMT')[0].trim();
    return formattedDate;
};

const getAllItems = async () => {
    const items = await itemCollection.find().sort({ product: 1 });
    return items.map(item => ({
        ...item._doc,
        createdAt: formatDate(item.createdAt),
        updatedAt: formatDate(item.updatedAt),
    }));
};

const createItem = async (reqBody, file) => {
    const fileUrl = `${file.filename}`;
    const newItem = {
        product: reqBody.product,
        quantity: reqBody.quantity,
        maxQuantity: reqBody.maxQuantity,
        picture: fileUrl,
    };
    return await itemCollection.create(newItem);
};

const getItemById = async (itemId) => {
    return await itemCollection.findById(itemId);
};

const updateItem = async (itemId, updateData) => {
    return await itemCollection.findByIdAndUpdate(itemId, updateData);
};

module.exports = { getAllItems, createItem, getItemById, updateItem, upload };

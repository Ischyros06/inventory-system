const mongoose=require("mongoose");

const ItemsModel = new mongoose.Schema({
    product: {
        type: String,
        required: [true, 'Please enter an item'],
    },
    quantity: {
        type: Number,
        required: [true, 'Please enter the quantity'],
    },
    maxQuantity: {
        type: Number,
        required: [true, 'Please enter a the maximum quantity']
    },
    picture: {
        type: String, // Store the URL of the image
        required: [true, 'Please upload an image'], // Require the picture URL
    },
    lastUpdatedBy: {
        type: Object,
        default: {} // Default to an empty object for last account updated
    },
},
{
    timestamps: true, // date created
});

const itemCollection = new mongoose.model("itemCollection", ItemsModel);

module.exports = { itemCollection };
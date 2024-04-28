//define collections
const { reportCollection } = require('../models/ReportCollectionModel');
const { adminLogInRequests } = require('../models/AdminLoginModel');
const { changeLog } = require('../models/ChangeLogModel');
const { submittedReports } = require('../models/SubmittedReportsModel');
const { userCollection } = require('../models/UserLoginModel');
const { itemCollection } = require('../models/ItemCollectionModel');

const multer = require("multer");
const path = require('path');
const fs = require('fs'); //required for data backup

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
        unit: reqBody.unit,
        category: reqBody.category,
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

// Backup function
const backup = async () => {
    try {
        // Array of collections to transfer
        const collections = [
            { name: 'adminloginrequests', model: adminLogInRequests},
            { name: 'changelogs', model: changeLog },
            { name: 'itemcollections', model: itemCollection },
            { name: 'reportcollections', model: reportCollection },
            { name: 'submittedreports', model: submittedReports },
            { name: 'userlogincollections', model: userCollection}
            // Add other collections here
        ];

        // Iterate over each collection
        for (const { name, model } of collections) {
            const data = await model.find({}).maxTimeMS(30000);
            const filePath = path.join(__dirname, '../data_backup', `${name}.json`);

            // Check if the file exists
            if (fs.existsSync(filePath)) {
                const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                // Check if there are changes in the data
                if (JSON.stringify(data) !== JSON.stringify(existingData)) {
                    // Write updated data to the backup file
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                    console.log(`Backup of collection '${name}' completed successfully.`);
                } else {
                    console.log(`No changes detected in collection '${name}', skipping backup.`);
                }
            } else {
                // Create a new file and write data to it
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                console.log(`New backup file created for collection '${name}'.`);
            }
        }

        console.log('Backup completed successfully.');
    } catch (error) {
        console.error('Backup failed:', error);
    }
}

module.exports = { getAllItems, createItem, getItemById, updateItem, upload, backup };

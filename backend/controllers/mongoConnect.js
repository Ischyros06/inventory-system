const { reportCollection } = require("../models/ReportCollectionModel");
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const connectToMongoDB = async () => {
    try {
        // First, attempt to connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log('MongoDB Atlas connected');
        importDataToMongoDB();
        deleteOldData();
    } catch (atlasErr) {
        console.error('Failed to connect to MongoDB Atlas:', atlasErr);
        // If Atlas connection fails, attempt to connect to the local MongoDB instance
        try {
            await mongoose.connect(process.env.MONGO_LOCAL, { useNewUrlParser: true, useUnifiedTopology: true })
            console.log('Local MongoDB connected');
            importDataToMongoDB();
            deleteOldData();
        } catch (localErr) {
            console.error('Failed to connect to local MongoDB:', localErr);
        }
    }
};

// Import data from JSON files into local MongoDB
async function importDataToMongoDB() {
    try {
        const backupDirectory = path.join(__dirname, '../data_backup');
        const files = fs.readdirSync(backupDirectory);// checked the json files inside the data_backup folder
        
        // Iterate over each JSON file in the backup directory
        for (const file of files) {
            const filePath = path.join(backupDirectory, file); // Path ex D:\INVENTORY SYSTEM PROJECT\backend\data_backup\adminloginrequests.json
            const collectionName = path.basename(file, '.json'); // path's basename  ex adminloginrequests.json
            const fileContent = fs.readFileSync(filePath, 'utf8');// the content't of the currently file on the loop ex the contents of adminloginrequests.json
            
            // Parse JSON data
            const data = JSON.parse(fileContent); // converting the string in the file into JSON file

            // Check if the data array is empty
            if (Array.isArray(data) && data.length === 0) {
                console.log(`Skipping import for collection '${collectionName}' as the file contains no data.`);
                continue; // Skip to the next iteration if the data array is empty
            }

            // Iterate over each document in the transformed data
            const transformedData = data.map(doc => {
                // Convert _id and date fields back to correct types
                const transformedDoc = {
                    ...doc,
                    _id: new mongoose.Types.ObjectId(doc._id)
                };

                // Convert createdAt and updatedAt fields to Date objects
                if (doc.createdAt && !isNaN(Date.parse(doc.createdAt))) {
                    transformedDoc.createdAt = new Date(doc.createdAt);
                }

                if (doc.updatedAt && !isNaN(Date.parse(doc.updatedAt))) {
                    transformedDoc.updatedAt = new Date(doc.updatedAt);
                }

                // Convert userId to ObjectId if present
                if (doc.userId) {
                    transformedDoc.userId = new mongoose.Types.ObjectId(doc.userId);
                }

                return transformedDoc;
            });

            // Iterate over each transformed document
            for (const doc of transformedData) {
                // Check if a document with the same _id already exists in the collection
                const existingDoc = await mongoose.connection.db.collection(collectionName).findOne({ _id: doc._id });

                if (existingDoc) {
                    // Document with the same _id exists, check if the data is different
                    if (JSON.stringify(existingDoc) !== JSON.stringify(doc)) {
                        // Data is different, update the existing document
                        await mongoose.connection.db.collection(collectionName).updateOne({ _id: doc._id }, { $set: doc });
                        console.log(`Document with _id '${doc._id}' updated in collection '${collectionName}'.`);
                    } else {
                        // Data is the same, skip insertion
                        console.log(`Document with _id '${doc._id}' already exists in collection '${collectionName}', skipping insertion.`);
                    }
                } else {
                    // Document with _id does not exist, insert it into the collection
                    await mongoose.connection.db.collection(collectionName).insertOne(doc);
                    console.log(`Document with _id '${doc._id}' inserted into collection '${collectionName}'.`);
                }
            }
        }

        console.log('Data import completed successfully.');
    } catch (error) {
        console.error('Data import failed:', error);
    }
};

// Function to delete old data from report collection - ORIGINAL CODE
const deleteOldData = async () => {
    try {
        // Get the current date
        const today = new Date();
        
        // Find and delete documents created before today
        await reportCollection.deleteMany({ createdAt: { $lt: today.setHours(0, 0, 0, 0) } });
        
        console.log('Old data deleted successfully');
    } catch (error) {
        console.error('Error deleting old data:', error);
    }
};

module.exports = { connectToMongoDB };
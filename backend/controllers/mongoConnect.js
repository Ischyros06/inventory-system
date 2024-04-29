const { reportCollection } = require("../models/ReportCollectionModel");
const { changeLog } = require("../models/ChangeLogModel");
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const connectToMongoDB = async () => {
    try {
        // First, attempt to connect to MongoDB Atlas
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log('MongoDB Atlas connected');
        deleteChangeLogsOldData();
        deleteOldData();
    } catch (atlasErr) {
        console.error('Failed to connect to MongoDB Atlas:', atlasErr);
        // If Atlas connection fails, attempt to connect to the local MongoDB instance
        try {
            await mongoose.connect(process.env.MONGO_LOCAL, { useNewUrlParser: true, useUnifiedTopology: true })
            console.log('Local MongoDB connected');
            deleteChangeLogsOldData();
            deleteOldData();
        } catch (localErr) {
            console.error('Failed to connect to local MongoDB:', localErr);
        }
    }
};

// Function to delete old data from report collection - ORIGINAL CODE
const deleteOldData = async () => {
    try {
        // Get the current date
        const today = new Date();
        
        // Find and delete documents created before today
        await reportCollection.deleteMany({ createdAt: { $lt: today.setHours(0, 0, 0, 0) } });
        
        console.log('Yesterday\'s data from daily report is deleted successfully');
    } catch (error) {
        console.error('Error deleting old data of daily report:', error);
    }
};

// Function to delete old data from changeLogs collection
const deleteChangeLogsOldData = async () => {
    try {
        // Get the current date
        const today = new Date();
        
        // Calculate the date one year ago
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        // Find and delete documents created before one year ago
        await changeLog.deleteMany({ createdAt: { $lt: oneYearAgo } });
        
        console.log('Old data from changeLogs collection deleted successfully');
    } catch (error) {
        console.error('Error deleting old data from changeLogs collection:', error);
    }
};
module.exports = { connectToMongoDB };
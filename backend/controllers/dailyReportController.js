const { submittedReports } = require('../models/SubmittedReportsModel');
const { reportCollection } = require('../models/ReportCollectionModel');
const { itemCollection } = require('../models/ItemCollectionModel');

// Generate daily report dynamically based on user actions
const getDailyReport = async (req, res) => {
    const userId = req.user.id;

    try {
        const report = await reportCollection.findOne({ userId: userId });
        const reportData = report ? report.productAccessed : [];

        res.render('dailyReport', { reportData });
    } catch (error) {
        console.error(`Error fetching report data: ${error}`);
        res.status(500).json({ error: 'An error occurred while fetching report data' });
    }
};

/* Route for decrementing the reportCollection and
at the same time returning the decremented values 
to the itemCollection*/
const editSubtractedQuantity = async (req, res) => {
    const userId = req.user.id;
    const productName = req.body.productName; 

    try {
        const report = await reportCollection.findOne({ userId: userId });
        // Find the index of the product in the report
        const productIndex = report.productAccessed.findIndex(product => product.product === productName);
        
        if (productIndex !== -1) {
            const quantitySubtracted = --report.productAccessed[productIndex].quantitySubtracted;

            if (quantitySubtracted === 0) {
                report.productAccessed.splice(productIndex, 1); 
            }

            await report.save();

            await itemCollection.updateOne(
                { product: productName },
                {$inc: {quantity: 1}} 
            )

            res.status(200).send('Quantity subtracted successfully');
        } else {
            res.status(404).send('Product not found in report');
        }
    } catch (error) {
        console.error(`Error subtracting quantity: ${error}`);
        res.status(500).send('An error occurred while subtracting quantity');
    }
};

//Handle sending the report
const sendReport = async (req, res) => {
    const userId = req.user.id;
    const userName = req.body.userName;
    const reportData = req.body.reportData; 

    try {
        if (!reportData || reportData.length === 0) {
            return res.status(400).send('Report data is empty');
        }

        const currentDate = new Date().toISOString().split('T')[0]; 
        let report = await submittedReports.findOneAndUpdate(
            { userId: userId, createdAt: { $gte: new Date(currentDate), $lt: new Date(new Date(currentDate).setDate(new Date(currentDate).getDate() + 1)) } },
            { $setOnInsert: { userId: userId, userName: userName }, $inc: {} },
            { upsert: true, new: true }
        );

        for (const item of reportData) {
            const existingItem = report.reportData.find(data => data.product === item.product);
            if (existingItem) {
                existingItem.quantitySubtracted += item.quantitySubtracted;
            } else {
                report.reportData.push(item);
            }
        }

        await report.save();

        await reportCollection.deleteOne({ userId: userId });

        res.status(200).send('Report sent successfully');
    } catch (error) {
        console.error(`Error sending report: ${error}`);
        res.status(500).send('An error occurred while sending report');
    }
};

module.exports = { getDailyReport, editSubtractedQuantity, sendReport };

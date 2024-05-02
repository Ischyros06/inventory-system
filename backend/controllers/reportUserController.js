const { submittedReports } = require('../models/SubmittedReportsModel');

const renderReportPageUser = async (req, res) => {
    try {
        const reports = await submittedReports.find().sort({ createdAt: -1 });
        // Format the createdAt date in each report
        const formattedReports = reports.map(report => {
            const date = new Date(report.createdAt);
            const formattedDate = date.toLocaleString('en-US', {
                timeZone: 'Asia/Singapore', // Change the timezone to your desired Asia timezone
                hour12: true, // Use 12-hour format
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            return { ...report.toObject(), createdAt: formattedDate };
        });
        res.render('reportUser', { reportData: formattedReports });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: error.message });
    }
};


const getDownloadTemp = async (req, res) => {
    try {
        // Fetch the report data from the database
        const reports = await submittedReports.find().sort({ createdAt: -1 });
        // Format the createdAt date in each report
        const formattedReports = reports.map(report => ({
            ...report.toObject(), // Convert Mongoose document to plain JavaScript object
            createdAt: report.createdAt.toLocaleString() // Format createdAt date
        }));
        
        // Prepare the report template content
        const reportContent = `
            Account: ${formattedReports[0].userName}
            Date: ${formattedReports[0].createdAt}
            Items:
            Product
            Quantity
            Unit

            ${formattedReports[0].reportData.map(item => `
            ${item.product}
            ${item.quantitySubtracted}
            ${item.unit}
            
            `).join('')}`;

        // Construct the filename
        const filename = `${formattedReports[0].userName}_${formattedReports[0].createdAt}_report_template.txt`;
        // Send the prepared report template content as a response
        res.setHeader('Content-disposition', `attachment; filename="${filename}".txt`);
        res.setHeader('Content-type', 'text/plain');
        res.send({ reportContent, filename });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: error.message });
    }
};

module.exports = { renderReportPageUser, getDownloadTemp };
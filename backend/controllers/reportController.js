const { submittedReports } = require('../models/SubmittedReportsModel');

exports.renderReportPage = async (req, res) => {
    try {
        const reports = await submittedReports.find().sort({ createdAt: -1 });
        //Format the createdAt date in each report
        const formattedReports = reports.map(report => ({
            ...report.toObject(), //Convert Mongoose document to plain JavaScript object
            createdAt: report.createdAt.toLocaleString() //Format createdAt date
        }));
        res.render('report', { reportData: formattedReports });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: error.message });
    }
};

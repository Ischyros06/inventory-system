const { changeLog } = require('../models/ChangeLogModel');

const renderChangeLog = async (req, res) => {
    try {
        const logs = await changeLog.find().sort({ createdAt: -1 });

        // Convert createdAt date to GMT+08:00 (Asia timezone) and format in 12-hour format with AM/PM indicator
        const formattedLogs = logs.map(log => {
            const date = new Date(log.createdAt);
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
            return { ...log.toObject(), createdAt: formattedDate };
        });

        res.render("changeLogs", { changeLogs: formattedLogs });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = { renderChangeLog };
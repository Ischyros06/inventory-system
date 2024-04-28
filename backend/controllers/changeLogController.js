const { changeLog } = require('../models/ChangeLogModel');

const renderChangeLog = async (req, res) => {
    try {
        const logs = await changeLog.find().sort({ createdAt: -1 });

        res.render("changeLogs", { changeLogs: logs });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).send("Internal Server Error");
    }
}

const renderChangeLogUser = async (req, res) => {
    try {
        const logs = await changeLog.find().sort({ createdAt: -1 });

        res.render("changeLogsUser", { changeLogs: logs });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = { renderChangeLog, renderChangeLogUser };
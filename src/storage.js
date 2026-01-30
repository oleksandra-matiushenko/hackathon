const fs = require('fs');
const path = require('path');

const REPORTS_FILE = path.join(__dirname, '../reports.json');

let reports = {}; // userId → { name, text }

function loadReports() {
    if (fs.existsSync(REPORTS_FILE)) {
        try {
            const data = fs.readFileSync(REPORTS_FILE, 'utf8');
            reports = JSON.parse(data);
            console.log('Reports loaded from file');
        } catch (err) {
            console.error('Failed to load reports.json:', err);
        }
    }
}

function saveReports() {
    try {
        fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
        console.log('Reports saved to file');
    } catch (err) {
        console.error('Failed to save reports:', err);
    }
}

function addToReport(userId, name, newText) {
    if (!reports[userId]) {
        reports[userId] = { name, text: '' };
    }
    reports[userId].text += `\n\n${newText.trim()}`;
}

function clearReports() {
    reports = {};
    if (fs.existsSync(REPORTS_FILE)) {
        fs.unlinkSync(REPORTS_FILE);
    }
}

function getAllReports() {
    return reports;
}

module.exports = {
    loadReports,
    saveReports,
    addToReport,
    clearReports,
    getAllReports,
};
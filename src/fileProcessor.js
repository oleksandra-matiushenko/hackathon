const axios = require('axios');
const pdfParse = require('pdf-parse');
const config = require('./config');

async function extractTextFromFile(file, slackBotToken) {
    if (!file.url_private_download) {
        throw new Error('No download URL');
    }

    const response = await axios.get(file.url_private_download, {
        headers: { Authorization: `Bearer ${slackBotToken}` },
        responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(response.data);

    if (file.mimetype === 'application/pdf') {
        const data = await pdfParse(buffer);
        return data.text.trim();
    } else if (file.mimetype.startsWith('text/') || file.name.endsWith('.txt')) {
        return buffer.toString('utf-8').trim();
    }

    throw new Error(`Unsupported file: ${file.mimetype || file.name}`);
}

module.exports = { extractTextFromFile };
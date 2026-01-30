const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');
const config = require('./config');

async function createPdfFromMarkdown(markdown) {
    const pdfPath = config.pdfOutputPath;

    return new Promise((resolve, reject) => {
        markdownpdf()
            .from.string(markdown)
            .to(pdfPath, (err) => {
                if (err) return reject(err);
                resolve(pdfPath);
            });
    });
}

function deletePdf(pdfPath) {
    if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
    }
}

module.exports = { createPdfFromMarkdown, deletePdf };
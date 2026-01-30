const nodemailer = require('nodemailer');
const config = require('./config');

async function sendEmailWithPdf(pdfPath, summaryText) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email.from,
            pass: config.email.appPassword,
        },
    });

    await transporter.sendMail({
        from: `"Weekly Report Bot" <${config.email.from}>`,
        to: config.email.to,
        subject: 'Weekly Team Report Summary',
        text: 'Please see the attached PDF for the consolidated weekly team report.',
        attachments: [
            {
                filename: 'Weekly_Team_Report.pdf',
                path: pdfPath,
                contentType: 'application/pdf'
            }
        ]
    });
}

module.exports = { sendEmailWithPdf };
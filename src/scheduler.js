const cron = require('node-cron');
const config = require('./config');
const { sendDM } = require('./slack');
const { getAllReports, clearReports, saveReports } = require('./storage');
const { generateSummary } = require('./summarizer');
const { createPdfFromMarkdown, deletePdf } = require('./pdfGenerator');
const { sendEmailWithPdf } = require('./emailSender');

function setupSchedulers() {
    // TODO: the correct ping timezone: Friday 16:00 ping
    // cron.schedule('0 16 * * 5', async () => {
    //     console.log('[SCHED] Friday ping');
    //     for (const userId of config.teamUserIds) {
    //         await sendDM(
    //             userId,
    //             "Hey! It's Friday 4 PM — please reply with your weekly report (text or PDF/TXT).\n\n" +
    //             "*Achievements:*\n*Blockers:*\n*Next week:*"
    //         );
    //     }
    //     saveReports();
    // }, { timezone: config.timezone });

    // Friday ping – change to run every minute for testing
    // cron.schedule('* * * * *', async () => {   // every minute
    //     console.log('[TEST] Friday ping triggered at ' + new Date().toLocaleTimeString());
    //         console.log('[SCHED] Friday ping');
    //         for (const userId of config.teamUserIds) {
    //             await sendDM(
    //                 userId,
    //                 "Hey! It's Friday 4 PM — please reply with your weekly report (text or PDF/TXT).\n\n" +
    //                 "*Achievements:*\n*Blockers:*\n*Next week:*"
    //             );
    //         }
    //         saveReports();
    // }, { timezone: config.timezone });

    // TODO: the correct summary timezone: Monday 09:00 summary + email
    // cron.schedule('0 9 * * 1', async () => {
    //     console.log('[SCHED] Monday summary');
    //     const reports = getAllReports();
    //     if (Object.keys(reports).length === 0) return;
    //
    //     try {
    //         const markdown = await generateSummary(reports);
    //         const pdfPath = await createPdfFromMarkdown(markdown);
    //         await sendEmailWithPdf(pdfPath, markdown);
    //         console.log('Email with PDF sent successfully');
    //         deletePdf(pdfPath);
    //         clearReports();
    //         saveReports();
    //     } catch (err) {
    //         console.error('Monday job failed:', err);
    //     }
    // }, { timezone: config.timezone });

    // Monday summary – 1 minute interval for testing
    // cron.schedule('* * * * *', async () => {   //every minute
    //     console.log('[TEST] Monday summary triggered at ' + new Date().toLocaleTimeString());
    //         console.log('[SCHED] Monday summary');
    //         const reports = getAllReports();
    //         if (Object.keys(reports).length === 0) return;
    //
    //         try {
    //             const markdown = await generateSummary(reports);
    //             const pdfPath = await createPdfFromMarkdown(markdown);
    //             await sendEmailWithPdf(pdfPath, markdown);
    //             console.log('Email with PDF sent successfully');
    //             deletePdf(pdfPath);
    //             clearReports();
    //             saveReports();
    //         } catch (err) {
    //             console.error('Monday job failed:', err);
    //         }
    // }, { timezone: config.timezone });
}

module.exports = { setupSchedulers };
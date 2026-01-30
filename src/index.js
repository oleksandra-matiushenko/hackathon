// src/index.js
const { app } = require('./slack');
const { loadReports } = require('./storage');
const { extractTextFromFile } = require('./fileProcessor');
const { addToReport, saveReports, getAllReports, clearReports } = require('./storage');
const { getUserName } = require('./slack');
const config = require('./config');
const { setupSchedulers } = require('./scheduler');
const { generateSummary } = require('./summarizer');
const { createPdfFromMarkdown, deletePdf } = require('./pdfGenerator');
const { sendEmailWithPdf } = require('./emailSender');

loadReports();

// handle messages (text or file uploads)
app.message(async ({ message, say }) => {
    console.log('[DEBUG] Received message:', message);

    const userId = message.user;
    let reportText = (message.text || '').trim(); // Start with any text in the message

    // File attachments – support multiple
    if (message.files && message.files.length > 0) {
        console.log('[DEBUG] Message has files:', message.files);
        let filesProcessed = 0;
        let totalChars = 0;

        for (const file of message.files) {
            try {
                console.log(`[DEBUG] Trying to process file: ${file.name}, mime: ${file.mimetype}, size: ${file.size}`);

                const fileText = await extractTextFromFile(file, config.slack.botToken);
                console.log(`[DEBUG] Extracted ${fileText.length} chars from ${file.name}`);

                reportText += `\n\n=== From file: ${file.name} ===\n${fileText.trim()}`;
                filesProcessed++;
                totalChars += fileText.length;

                await say(`Extracted **${file.name}** (${fileText.length} chars)`);
            } catch (err) {
                console.error(`[ERROR] Failed to extract ${file.name}:`, err.message || err);
                await say(`Error processing **${file.name}**: ${err.message || 'Unknown error'}. Try plain text instead.`);
            }
        }

        if (filesProcessed > 0) {
            await say(`Processed ${filesProcessed} file(s) (${totalChars} chars total).`);
        }
    }

    // If we have any content (text or from files), append to report
    if (reportText) {
        const name = await getUserName(userId);
        addToReport(userId, name, reportText);

        const userReport = getAllReports()[userId] || { text: '' };
        await say(
            `Report updated (~${userReport.text.split(/\n\s*\n/).filter(Boolean).length} sections). ` +
            'Reply more or type "done".'
        );

        saveReports();
    } else {
        await say('No content detected in your message. Reply with text or attach PDF/TXT.');
    }
});

// Handle the real Slack slash command /summarize
app.command('/summarize', async ({ ack, respond, logger }) => {
    await ack();

    const reports = getAllReports();

    if (Object.keys(reports).length === 0) {
        await respond({
            response_type: 'ephemeral',
            text: 'No reports collected yet. Ask team members to submit first.'
        });
        return;
    }

    try {
        await respond({
            response_type: 'ephemeral',
            text: 'Generating weekly summary and sending PDF to manager... (may take 10–30 seconds)'
        });

        const markdown = await generateSummary(reports);
        const pdfPath = await createPdfFromMarkdown(markdown);
        await sendEmailWithPdf(pdfPath, markdown);

        await respond({
            response_type: 'ephemeral',
            text: '✅ Summary generated and emailed to the manager!'
        });

        deletePdf(pdfPath);
        clearReports();
        saveReports();
    } catch (err) {
        logger.error('Slash /summarize failed:', err);
        await respond({
            response_type: 'ephemeral',
            text: 'Error generating summary. Check bot logs for details.'
        });
    }
});

setupSchedulers();

(async () => {
    await app.start();
    console.log('⚡️ Slack Weekly Report Bot is running!');
})();
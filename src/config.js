require('dotenv').config();

const config = {
    slack: {
        botToken: process.env.SLACK_BOT_TOKEN,
        appToken: process.env.SLACK_APP_TOKEN,
    },
    openai: {
        apiKey: process.env.GROQ_API_KEY,
    },
    email: {
        from: process.env.GMAIL_EMAIL,
        appPassword: process.env.GMAIL_APP_PASSWORD,
        to: process.env.MANAGER_EMAIL,
    },
    timezone: process.env.BOT_TIMEZONE || 'America/Toronto',
    teamUserIds: [
        'U0ACG2EGLMP', // TODO:add more Slack User IDs
        'U0ACDD95ADB',
        'U0ACGRRE4M8',
        'U0ADB59677A',
        'U0ACAEAFD9R',
        'U0ACS1GGWUX',
    ],
    pdfOutputPath: './weekly-summary.pdf',
};

if (!config.slack.botToken || !config.slack.appToken) {
    throw new Error('Missing Slack tokens in .env');
}
if (!config.openai.apiKey) {
    throw new Error('Missing OPENAI_API_KEY in .env');
}
if (!config.email.from || !config.email.appPassword || !config.email.to) {
    throw new Error('Missing email configuration in .env');
}

module.exports = config;
const { App } = require('@slack/bolt');
const config = require('./config');

const app = new App({
    token: config.slack.botToken,
    appToken: config.slack.appToken,
    socketMode: true,
});

async function getUserName(userId) {
    try {
        const info = await app.client.users.info({ user: userId });
        return info.user.real_name || info.user.name || userId;
    } catch (err) {
        console.error('users.info failed:', err);
        return userId;
    }
}

async function sendDM(userId, text) {
    try {
        await app.client.chat.postMessage({ channel: userId, text });
    } catch (err) {
        console.error(`Failed to send DM to ${userId}:`, err);
    }
}

module.exports = { app, getUserName, sendDM };
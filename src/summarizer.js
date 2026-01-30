// src/summarizer.js
const { OpenAI } = require('openai');  // Keep this import — it works with Groq too
const config = require('./config');

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,          // ← use GROQ_API_KEY from .env
    baseURL: 'https://api.groq.com/openai/v1', // ← this is the magic line
});

async function generateSummary(allReports) {
    let fullContent = '';
    for (const [userId, data] of Object.entries(allReports)) {
        fullContent += `=== ${data.name} ===\n${data.text.trim()}\n\n`;
    }

    const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'system',
                content: 'You are an executive assistant. Produce a clean, professional weekly summary in **Markdown** format. Use headings, bullets, bold for risks/blockers, tables for metrics if present.'
            },
            { role: 'user', content: `Summarize these weekly reports:\n\n${fullContent}` },
        ],
        temperature: 0.7,
        max_tokens: 1500,  // adjust based on expected summary length
    });

    return completion.choices[0].message.content.trim();
}

module.exports = { generateSummary };
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
                content: `
                You are an executive assistant preparing a clean, professional weekly team summary.

                Rules:
                - Output in **Markdown** format only
                - Use clear section headings (##) for: Key Achievements, Blockers & Risks, Metrics & Progress, Next Steps, Overall Status
                - Each section should be separate with its own ## heading
                - Use bullets for list items within each section
                - **Bold** important items, especially risks and blockers
                - Use tables for any metrics or numerical data
                - Add status emojis: ✅ for positive, ⚠️ for warnings, ❌ for serious blockers
                - When you see trends or numbers (sales, bugs, progress %), create a simple **text-based bar chart** or progress bar using Markdown
                  Example:
                  Sales: 120k / 150k target
                  [██████████░░] 80%
                - Keep it concise, scannable, executive-friendly (1 page feel)
                - Do NOT mix sections - keep achievements separate from blockers, etc.
                - Structure your output with these exact section headings:
                  ## Key Achievements
                  ## Blockers & Risks
                  ## Metrics & Progress
                  ## Next Steps
                  ## Overall Status
                `.trim()
            },
            { role: 'user', content: `Summarize these weekly reports:\n\n${fullContent}` },
        ],
        temperature: 0.7,
        max_tokens: 1500,  // adjust based on expected summary length
    });

    return completion.choices[0].message.content.trim();
}

module.exports = { generateSummary };
# Slack Weekly Report Bot

Collects weekly reports via Slack DM (text or PDF), summarizes with AI, emails PDF to manager.

## Setup

1. Copy `.env.example` → `.env` and fill values
2. `npm install`
3. Add real Slack user IDs to `config.js`
4. `npm start`

## Development

`npm run dev` (with nodemon)

## Features

- Friday 4 PM ping (timezone-aware)
- Supports text + PDF/TXT attachments
- Monday 9 AM: AI summary → PDF → email
- Simple file persistence (reports.json)
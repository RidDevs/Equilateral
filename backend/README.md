# Finance Backend

API proxy for the AI Advisor. Keeps the Gemini API key server-side.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and add your Gemini API key:
   ```
   cp .env.example .env
   ```
   Get a key from: https://aistudio.google.com/apikey

3. Start the server:
   ```
   npm run dev
   ```
   Runs at http://localhost:3001

## Running full app

- **Terminal 1:** `cd backend && npm run dev`
- **Terminal 2:** `cd finance-app && npm run dev`

The Vite dev server proxies `/api` to the backend.

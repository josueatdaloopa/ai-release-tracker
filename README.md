# AI Release Intelligence

> A live tracker for frontier AI model releases, updates, and industry news — built for financial analysts.

🔗 **[Live Site →](https://ai-release-tracker.vercel.app/)**

---

## What It Does

The AI landscape moves fast. New models drop, capabilities shift, and the tools your competitors are using today weren't available last quarter. This dashboard gives you a single, always-current view of what's changed — and what it means for financial workflows.

**Tracks releases across:**
- **Anthropic** (Claude family)
- **OpenAI** (GPT, o-series)
- **Google Gemini**
- **xAI / Grok**
- **Perplexity**

---

## Features

### 📋 Release Log
Every model release, update, partnership, and feature launch — sorted by recency or filtered by company, type, or finance impact. Each entry includes what changed, why it matters, and links directly to the original source.

### ⚡ Compare Mode
Side-by-side model comparisons across any two releases. See exactly how capabilities evolved: context window, reasoning depth, hallucination rate, tool use, and finance-specific implications. Covers both version-to-version upgrades (e.g. Sonnet 4.5 → 4.6) and cross-model comparisons (e.g. Claude Opus 4.6 vs GPT-5).

### 📅 Timeline View
A chronological view of the frontier model race — see how the competitive landscape has shifted over time.

### 💰 Finance Spotlight
Every release is tagged with a finance impact score (High / Medium / Low). High-impact releases include a dedicated breakdown of which analyst workflows they affect and what they automate — with concrete workflow examples.

### 📣 Social Signal Tracking
Captures the highest-engagement posts on X (Twitter) and LinkedIn tied to each release. Useful for gauging market reaction, identifying key voices, and tracking what's generating buzz in the industry.

### 🔗 Full Source Auditability
Every data point links back to its primary source — official blogs, API docs, press releases, and third-party coverage. Nothing is unverifiable.

### 🔄 Auto-Refresh Every 10 Minutes
The site automatically pulls the latest releases and news without requiring a manual refresh. Always current.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js (`server.js`) |
| Deployment | Vercel |
| Config | `vercel.json` for routing |

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/josueatdaloopa/ai-release-tracker.git
cd ai-release-tracker

# Install dependencies
npm install

# Start the local server
node server.js
```

Then open `http://localhost:3000` in your browser.

---

## Project Structure

```
ai-release-tracker/
├── public/          # Frontend assets (HTML, CSS, JS)
├── server.js        # Node.js backend
├── vercel.json      # Vercel deployment config
├── package.json
└── .gitignore
```

---

## Built With

Built using [Claude Code](https://claude.ai/code) — Anthropic's agentic coding tool.

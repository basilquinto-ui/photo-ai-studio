# Photo AI Studio
### by [sjiatravels.com](https://www.sjiatravels.com)

AI-powered ID photo generator — passport, visa, ID card, and square formats.
**100% free. No sign-up. Nothing stored. Instant download.**

---

## What's New
- No account or sign-up required — click Download and it saves instantly
- `sjiatravels.com` is clickable throughout the app (splash, topbar, footer)
- Travel ad banner appears while AI is analyzing — rotates 5 travel messages, links to sjiatravels.com

---

## Quick Start (5 minutes)

### Step 1 — Get your FREE Gemini API key
1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account (free, no credit card)
3. Click **Create API Key** and copy it

> Free tier: **1,500 requests/day** — more than enough.

### Step 2 — Add your key
Open `public/js/config.js`:
```js
window.GEMINI_API_KEY = 'AIzaSy...your-key-here...';
```

### Step 3 — Deploy (pick one)

**Vercel (recommended)**
```bash
npm install -g vercel
vercel
```

**Netlify**
Drag the folder onto https://app.netlify.com — live in seconds.

**Local**
Just open `index.html` in your browser, or:
```bash
npx serve .
```

---

## File Structure
```
photo-ai-studio/
├── index.html
├── vercel.json
├── netlify.toml
├── README.md
└── public/
    ├── favicon.svg
    ├── css/style.css
    └── js/
        ├── config.js   ← PUT YOUR API KEY HERE
        └── app.js
```

---

## Cost Breakdown

| Service        | Cost                        |
|----------------|-----------------------------|
| Gemini API     | Free (1,500 req/day)        |
| Vercel hosting | Free                        |
| Netlify hosting| Free                        |
| Supabase       | Not needed                  |
| **Total**      | **$0**                      |

---

*Built with ♥ for sjiatravels.com*

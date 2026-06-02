# ⚡ ForgeFit AI — Personalized Gym Schedule Generator

An AI-powered gym scheduling web app that generates fully personalized weekly workout plans based on your body, goals, fitness history, and medical conditions. Built as a pure static site — no backend required.

![ForgeFit Screenshot](https://via.placeholder.com/900x450/0a0a0a/e8ff47?text=ForgeFit+AI)

---

## 🚀 Live Demo

> Deploy to GitHub Pages using the instructions below and paste your URL here.

---

## ✨ Features

- **4-step onboarding** — collects body stats, goals, experience, health history & preferences
- **AI-generated schedule** — Claude AI builds a full 7-day weekly plan tailored to you
- **Medical condition awareness** — exercises are automatically modified for back pain, knee issues, heart conditions, diabetes, and more
- **Expandable exercise detail** — click any day to see full exercise list with sets/reps
- **AI chat trainer** — ask anything like *"Modify leg day for my knee injury"* and get instant advice
- **Progress tracker** — milestones and weekly session progress ring
- **Profile persistence** — your profile is saved locally (no account needed)
- **100% client-side** — no server, no database, no sign-up

---

## 🛠 Tech Stack

| Layer       | Tech |
|-------------|------|
| Frontend    | Vanilla HTML, CSS, JavaScript (ES6+) |
| AI Backend  | Anthropic Claude API (called directly from browser) |
| Fonts       | Google Fonts (Bebas Neue + DM Sans) |
| Deployment  | GitHub Pages (static hosting) |

---

## 📁 Project Structure

```
forgefit/
├── index.html        ← Main app (all views)
├── css/
│   └── style.css     ← All styles
├── js/
│   └── app.js        ← All logic (onboarding, API calls, rendering)
└── README.md
```

---

## 🔑 API Key Setup

ForgeFit AI uses the **Anthropic Claude API** to generate plans. You need a free API key:

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / log in
3. Navigate to **API Keys** → **Create Key**
4. Copy your key (starts with `sk-ant-...`)
5. Paste it into the app on Step 4 of onboarding

> **Security:** Your API key is sent directly from your browser to Anthropic's servers — it never touches any third-party server. It is NOT stored in localStorage. You'll need to re-enter it each session.

---

## 🌐 Deploy to GitHub Pages

### Option A — GitHub UI (easiest)

1. Create a new GitHub repository (e.g. `forgefit-ai`)
2. Upload all files maintaining this folder structure:
   ```
   index.html
   css/style.css
   js/app.js
   README.md
   ```
3. Go to **Settings → Pages**
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch, **/ (root)** folder
6. Click **Save**
7. Your site will be live at `https://YOUR_USERNAME.github.io/forgefit-ai/`

---

### Option B — Git CLI

```bash
# 1. Clone or initialize repo
git init forgefit-ai
cd forgefit-ai

# 2. Copy all project files here, then:
git add .
git commit -m "Initial commit: ForgeFit AI"

# 3. Create repo on GitHub (via UI or gh CLI)
gh repo create forgefit-ai --public

# 4. Push
git remote add origin https://github.com/YOUR_USERNAME/forgefit-ai.git
git branch -M main
git push -u origin main

# 5. Enable GitHub Pages
gh api repos/YOUR_USERNAME/forgefit-ai/pages \
  --method POST \
  -f source.branch=main \
  -f source.path=/

# Your site: https://YOUR_USERNAME.github.io/forgefit-ai/
```

---

### Option C — GitHub CLI (all-in-one)

```bash
cd forgefit-ai
git init && git add . && git commit -m "ForgeFit AI launch"
gh repo create forgefit-ai --public --source=. --push
# Then enable Pages in GitHub Settings → Pages
```

---

## 🔧 Customization

### Change the AI Model
In `js/app.js`, find `claude-sonnet-4-20250514` and replace with any Anthropic model.

### Add More Medical Conditions
In `index.html`, find `id="medical-chips"` and add new `<div class="condition-chip" data-val="your-condition">` elements.

### Modify Color Theme
In `css/style.css`, edit the `:root` variables:
```css
:root {
  --accent: #e8ff47;   /* lime green — change to your brand color */
  --accent2: #ff6b35;  /* orange */
  --bg: #0a0a0a;       /* background */
}
```

### Add Exercise Video Links
In `js/app.js → renderSchedule()`, add a YouTube/video link to each exercise item card.

---

## 📱 Mobile Support

ForgeFit is fully responsive. On mobile:
- Stats grid collapses to 2×2
- Exercise preview is hidden in day rows (tap to expand)
- Chat bar shrinks to fit screen

---

## 🔒 Privacy

- **No data is sent to any server other than Anthropic** (for AI generation)
- Your profile is saved in **localStorage** (your browser only)
- Your API key is **never saved** — entered per session only
- No cookies, no analytics, no tracking

---

## 📄 License

MIT — free to use, modify, and deploy.

---

## 🙌 Credits

Built with [Claude AI](https://anthropic.com) by Anthropic.

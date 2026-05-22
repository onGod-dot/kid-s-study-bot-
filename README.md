# 🦉 Buddy — AI Study Companion

Buddy is a full-stack AI-powered learning platform built for kids (ages 5–12) and teens (ages 13–18). It adapts its tone, difficulty, and visual style to each age group, turning homework and studying into an engaging, game-like experience.

---

## ✨ Features

### 🏠 Landing Page
- Age-group selector with animated cards for Kids and Teens
- Fully responsive — works cleanly on mobile and desktop
- Animated background with floating particles and colour blobs
- Loading screen with progress bar and rotating tips on first visit

---

### 💬 AI Chat Tutor
- Separate chat experience for kids and teens with different system prompts, tone, and response length
- **Kids** — short, playful answers (max 4 bullet points), simple vocabulary, guiding questions, fun emojis
- **Teens** — focused, structured answers with bold key terms, critical thinking prompts, and follow-up questions
- **Formatted responses** — AI output is parsed and rendered as proper bullet lists, numbered steps, bold text, and headings — no raw asterisks ever shown
- **Word-by-word typewriter effect** — new messages animate in word-by-word so markdown tokens are always complete before rendering
- **Conversation memory** — full chat history is sent with every request so students can ask natural follow-up questions
- **Per-avatar chat history** — each companion has its own independent conversation thread
- **Text-to-speech** — every AI response has a 🔊 button to read it aloud; click again to stop. Kids get a slower, higher-pitched voice; teens get a natural pace
- **Voice input** — 🎤 button uses the browser's Speech Recognition API to dictate questions hands-free
- **AI image generation** — type "draw a volcano" or "show me the solar system" and the AI generates an illustration inline
  - Kids section uses a fast, cartoon-friendly image model
  - Teens section uses a higher-quality, photorealistic image model
- **"Draw it" button** — on any text response, tap the paintbrush icon to auto-generate a visual illustration of that concept
- **Image download** — every generated image has a Download button that saves it directly to the device
- **Empty state** — friendly greeting shown when no messages exist yet
- **Clear chat** — one-tap button to reset the conversation for a fresh start

---

### 📚 Homework / Assignment Helper
- **Two input modes** — drag-and-drop file upload (images, Word docs, text files) or type/paste directly
- **Image OCR** — upload a photo of a handwritten or printed assignment; the AI reads and extracts the text
- **Full solution with steps** — the AI gives the complete answer AND every step to get there, not just hints
  - Kids: numbered steps with simple language and a clearly labelled ✅ Answer
  - Teens: detailed working with bold key terms and a ✅ Final Answer
- **Collapsible step cards** — each step is its own accordion card; step 1 opens by default, the rest collapse for a clean view
- **📄 Download PDF** — one click opens a clean print-ready page with the full solution stripped of markdown symbols; choose "Save as PDF" in the print dialog
- **Assignment history** — last 5 assignments shown with status indicators (in progress / completed)
- **New button** — reset and start a fresh assignment without leaving the tab

---

### 🎮 Games Section
- 4 games per age group (8 total), each with a progress bar showing completion
- **Kids games:** Number Bubble Pop, Memory Match, Word Scramble, Fun Quiz
- **Teens games:** Math Speed Run (30-second timed challenge with streak bonuses), Word Scramble (complex vocabulary), Logic Riddles, Science Trivia
- **AI encouragement** — when a game ends, the AI generates a personalised 1–2 sentence message based on the game and score
- **Badge system** — completing each game awards a unique badge (🫧 Bubble Master, 🧠 Memory Champ, 🔤 Word Wizard, ❓ Quiz Whiz, ⚡ Math Speedster, 🧩 Logic Legend, 🔬 Science Star)
- **Badge shelf** — earned badges are displayed at the top of the games section with score and persist across sessions
- **Auto-advance** — after each game, a badge award screen appears with confetti, the AI message, and a "Next Game" button to keep the momentum going
- **Game cards** show a ⭐ "Done" tag when that game's badge has already been earned

---

### 🎨 Avatar / Companion System
- Kids choose from 6 forest animal companions (Wise Owl, Playful Monkey, Quick Rabbit, Clever Fox, Gentle Deer, Friendly Bear)
- Teens choose from 6 space beings (Stellar Guide, Space Explorer, Cosmic Scholar, Orbital Mentor, Swift Learner, Cosmic Wisdom)
- Each avatar has its own independent chat history — switching companions switches the conversation
- Avatar picker slides up from the bottom on mobile, centred modal on desktop
- Selected avatar persists across sessions

---

### 🎭 Themed Interfaces
- **Kids — Forest Learning Academy** — deep green gradients, floating forest emoji particles, emerald accents
- **Teens — Space Academy** — deep space gradients, floating star/rocket particles, blue/indigo accents
- Both interfaces share the same tab structure: Chat · Homework · Games
- On mobile, the companion/mentor sidebar card is hidden so the chat fills the full width

---

### 📱 Mobile-First Responsive Design
- All layouts adapt cleanly from 320px mobile to wide desktop without breaking the desktop view
- Tab bars scroll horizontally on small screens with hidden scrollbars
- Avatar picker is a bottom sheet on mobile
- CTA buttons stretch full-width on mobile
- Chat input is always a single row (no stacking)

---

### 💾 Persistent State
- Chat history, earned badges, selected avatar, and assignments all survive page refreshes via localStorage
- Per-avatar message history is capped at 100 messages to prevent unbounded storage growth
- Timestamps stored as ISO strings for reliable JSON serialisation

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| AI — Chat & Homework | Together AI (server-side API route) |
| AI — Image Generation | Together AI (two separate models by age group) |
| AI — Speech-to-Text | Together AI Whisper (server-side API route) |
| Animations | Framer Motion |
| State Management | Zustand with persist middleware |
| Styling | Tailwind CSS |
| Voice Input | Web Speech Recognition API (browser built-in) |
| Text-to-Speech | Web Speech Synthesis API (browser built-in) |
| PDF Export | Browser Print API (no external library) |
| Image Download | Server-side proxy route + Blob download |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root:

```env
TOGETHER_API_KEY=your_together_ai_key_here
```

> The API key is used server-side only — it is never exposed to the browser.

---

## 📁 Project Structure

```
app/
  page.tsx                      # Landing page — age group selector
  layout.tsx                    # Root layout with loading screen
  globals.css                   # Global styles + custom utilities
  api/
    chat/route.ts               # AI chat completions (server-side)
    generate-image/route.ts     # AI image generation (server-side, age-aware)
    speech-to-text/route.ts     # Audio transcription (server-side)
    proxy-image/route.ts        # Image proxy for CORS-safe downloads

components/
  AppShell.tsx                  # Loading screen wrapper
  LoadingScreen.tsx             # Animated loading screen with tips
  KidsInterface.tsx             # Forest-themed kids interface
  TeensInterface.tsx            # Space-themed teens interface
  ChatBot.tsx                   # AI chat with TTS, voice input, image gen
  AssignmentHelper.tsx          # Homework solver with PDF export
  GamesSection.tsx              # 8 games with AI badges and auto-advance
  AvatarPicker.tsx              # Companion selection modal
  Confetti.tsx                  # Confetti celebration effect
  ParticleSystem.tsx            # Ambient floating particles
  ParentDashboard.tsx           # Parent progress monitoring view

lib/
  together-ai.ts                # Together AI service (chat, images, STT)
  store.ts                      # Zustand global store with persistence

hooks/
  useSoundEffects.ts            # Web Audio API sound effects
```

---

## 🔒 Security Notes

- All AI API calls go through Next.js server-side API routes — the API key is never sent to the browser
- The image proxy route validates that URLs belong to the Together AI CDN before fetching
- Image generation prompts are automatically prefixed with age-appropriate safety instructions

---

*Built for curious minds of all ages.*

# 🎓 Buddy — AI Study Companion

An intelligent, interactive study companion built for kids and teens. Buddy uses AI to make learning fun, personalized, and effective.

## What it does

- **AI Chat Tutor** — Kids (5–12) and teens (13–18) each get a tailored chat experience. The AI guides students through problems with age-appropriate language rather than just giving answers, encouraging critical thinking.
- **Conversation Memory** — The chatbot remembers the full conversation so students can ask follow-up questions naturally, just like talking to a real tutor.
- **Text-to-Speech** — Every AI response has a speaker button. Click it to have the response read aloud. Clicking again stops playback.
- **Homework Help** — Students can type or upload their assignment (image, PDF, Word doc, or text file). The AI analyzes it and generates a step-by-step learning guide.
- **STEM Learning** — Dedicated STEM section with interactive content for both age groups.
- **Parent Dashboard** — Parents can monitor progress and track learning activity.
- **Themed Interfaces** — Kids get a Forest Learning Academy with animal companions; teens get a Space Academy with cosmic mentors.

## Tech Stack

- **Next.js 14** (App Router)
- **Together AI** — `meta-llama/Llama-3.3-70B-Instruct-Turbo` via server-side API route
- **Framer Motion** — animations
- **Zustand** — global state
- **Tailwind CSS** — styling
- **Web Speech API** — text-to-speech (built into the browser, no extra cost)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  page.tsx              # Landing / age selection
  layout.tsx            # Root layout
  api/chat/route.ts     # Server-side Together AI proxy
components/
  ChatBot.tsx           # AI chat with TTS and conversation history
  AssignmentHelper.tsx  # Homework upload and step-by-step guide
  KidsInterface.tsx     # Forest-themed kids UI
  TeensInterface.tsx    # Space-themed teens UI
  ParentDashboard.tsx   # Progress monitoring
  SteamSection.tsx      # STEM learning content
lib/
  together-ai.ts        # Together AI service
  store.ts              # Zustand global store
```

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TIPS = [
  'Ask me anything — I love questions! 🤔',
  'Type "draw a volcano" to generate an image 🎨',
  'Switch mentors anytime — each has their own chat 💬',
  'Upload a homework photo for step-by-step help 📸',
  'Play games to sharpen your skills 🎮',
]

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  emoji: ['✨', '⭐', '🌟', '💫', '🔥', '🎯', '🎨', '🧠', '🚀', '🌈', '💡', '🦋'][i % 12],
  x: 5 + (i * 4.7) % 90,
  y: 5 + (i * 6.3) % 85,
  size: [14, 18, 22][i % 3],
  duration: 3 + (i % 4),
  delay: (i * 0.3) % 2.5,
}))

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)

  // Progress bar
  useEffect(() => {
    const steps = [10, 25, 42, 58, 74, 88, 100]
    const delays = [400, 700, 800, 900, 800, 700, 600]
    let i = 0
    const run = () => {
      if (i >= steps.length) return
      setTimeout(() => {
        setProgress(steps[i])
        i++
        run()
      }, delays[i] ?? 400)
    }
    run()
  }, [])

  // Cycle tips
  useEffect(() => {
    const t = setInterval(() => setTipIndex(n => (n + 1) % TIPS.length), 1800)
    return () => clearInterval(t)
  }, [])

  // When progress hits 100, wait a beat then exit
  useEffect(() => {
    if (progress < 100) return
    const t = setTimeout(() => {
      setLeaving(true)
      setTimeout(onDone, 700)
    }, 800)
    return () => clearTimeout(t)
  }, [progress, onDone])

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden
                     bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900"
        >
          {/* Glowing orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-600 blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 7, repeat: Infinity, delay: 1.5 }}
              className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-600 blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, delay: 0.8 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-pink-500 blur-3xl"
            />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {PARTICLES.map(p => (
              <motion.span
                key={p.id}
                className="absolute select-none"
                style={{ left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size, opacity: 0 }}
                animate={{ y: [0, -22, 0], opacity: [0, 0.7, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
              >
                {p.emoji}
              </motion.span>
            ))}
          </div>

          {/* Centre content */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-sm w-full">

            {/* Mascot */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
              className="relative"
            >
              {/* Pulsing glow ring */}
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-yellow-400/40 blur-2xl"
              />
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full border-2 border-dashed border-white/20"
              />
              {/* Avatar */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500
                           flex items-center justify-center text-6xl shadow-2xl border-4 border-white/20"
              >
                🦉
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300
                             bg-clip-text text-transparent drop-shadow-lg leading-tight">
                Buddy
              </h1>
              <p className="text-white/60 text-sm mt-1 font-medium tracking-wide">
                AI Study Companion
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full"
            >
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-white/30 text-xs">Loading…</span>
                <span className="text-white/40 text-xs font-mono">{progress}%</span>
              </div>
            </motion.div>

            {/* Rotating tip */}
            <div className="h-8 flex items-center justify-center overflow-hidden w-full">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-white/50 text-xs text-center px-2"
                >
                  {TIPS[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Loading dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white/40"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
